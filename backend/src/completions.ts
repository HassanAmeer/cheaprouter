import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { db } from './db.ts';
import { recordUsage, checkMonthlyQuota } from './usage.ts';
import { hashPassword, verifyToken } from './auth.ts';
import { hashKey } from './keys.ts';
import { computeCost, checkBalanceForCost, deductBalance } from './billing.ts';
import { addDevLog } from './logger.ts';

// Placeholder/masked keys (from seed data or admin UI) must never be sent
// upstream as live Bearer credentials.
function isPlaceholderKey(key: string): boolean {
  const s = String(key || '').trim();
  if (!s) return true;
  if (s.includes('•') || s.includes('...')) return true;
  if (/demo$/i.test(s)) return true;
  return false;
}

function getActiveKeys(keyStr: string): string[] {
  if (!keyStr) return [];
  try {
    const parsed = JSON.parse(keyStr);
    if (Array.isArray(parsed)) {
      const activeKeys = parsed.filter((k: any) => {
        if (typeof k === 'string') return !isPlaceholderKey(k);
        return k.active !== false && !isPlaceholderKey(k.key ?? '');
      }).map((k: any) => typeof k === 'string' ? k : k.key);
      
      // Shuffle the active keys array for load balancing
      for (let i = activeKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeKeys[i], activeKeys[j]] = [activeKeys[j], activeKeys[i]];
      }
      
      return activeKeys;
    }
    return isPlaceholderKey(keyStr) ? [] : [keyStr];
  } catch {
    return isPlaceholderKey(keyStr) ? [] : [keyStr];
  }
}

// Match a model request against a provider's model list, supporting both
// object entries ({ id, originalId, name }) and plain string entries.
function matchModel(models: any, model: string): any {
  if (!Array.isArray(models)) return null;
  return models.find((m: any) => {
    if (typeof m === 'string') return m === model;
    return m.id === model || m.originalId === model || m.name === model;
  });
}

export async function getSystemPromptForModel(model: string) {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true`;
  for (const prov of providersResult) {
    const matched = matchModel(prov.models, model);
    if (matched && typeof matched !== 'string' && matched.systemPrompt) {
      return matched.systemPrompt;
    }
  }
  return null;
}

export interface ModelInstanceItem {
  instance: any;
  providerName: string;
  providerId: string;
  modelId: string;
  keyMask?: string;
}

// Pick the default model for chat: the first model offered by the lowest-priority
// active provider, falling back to a hardcoded default if none can be resolved.
export async function getDefaultModel(): Promise<string> {
  try {
    const providersResult = await db`SELECT * FROM admin_providers WHERE status = true ORDER BY priority ASC NULLS LAST, id ASC`;
    for (const p of providersResult) {
      if (p.models && Array.isArray(p.models) && p.models.length > 0) {
        const first = p.models[0];
        const modelId = typeof first === 'string' ? first : (first.originalId || first.id || first.name || '');
        return modelId.trim() || undefined;
      }
    }
  } catch (e) {
    // fall through
  }
  return 'gpt-4o';
}

export async function getModelInstances(userId: string, model: string, sessionId?: string): Promise<ModelInstanceItem[]> {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true ORDER BY priority ASC NULLS LAST, id ASC`;
  const items: ModelInstanceItem[] = [];

  // Dynamic Provider Resolution across all active providers that match this model
  for (const p of providersResult) {
    const matched = matchModel(p.models, model);
    if (matched) {
      const apiKeys = getActiveKeys(p.key);
      if (apiKeys.length > 0) {
        const modelId = typeof matched === 'string' ? matched : (matched.originalId || matched.id);
          const customHeaders: Record<string, string> = {
            ...(p.headers && typeof p.headers === 'object' && !Array.isArray(p.headers) ? p.headers : {}),
            ...(sessionId ? { 'x-session-id': sessionId } : {}),
          };

          for (const apiKey of apiKeys) {
            let instance: any;
            if (p.api_format === 'anthropic') {
              instance = createAnthropic({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders })(modelId);
            } else if (p.api_format === 'google') {
              instance = createGoogleGenerativeAI({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders })(modelId);
            } else if (p.api_format === 'cohere') {
              instance = createCohere({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders })(modelId);
            } else {
              instance = createOpenAI({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders })(modelId);
            }

            items.push({
              instance,
              providerName: p.name || p.id,
              providerId: p.id,
              modelId,
              keyMask: apiKey.length > 8 ? apiKey.slice(0, 4) + '...' + apiKey.slice(-4) : 'key'
            });
          }
        }
      }
  }

  if (items.length > 0) {
    return items;
  }

  throw new Error(`Model '${model}' not found or no active provider configured for it.`);
}

export async function handleCompletions(c: any) {
  let auth = '';
  let sessionId = '';
  try {
    auth = c.req.header('authorization') || '';
    sessionId = c.req.header('x-session-id') || '';
    const userAgent = (c.req.header('user-agent') || '').toLowerCase();
    const cliUa = ['cli', 'code', 'aider', 'cursor', 'kilocode', 'opencode', 'opencli', 'agent', 'claude-code', 'cmdk', 'terminal', 'windsurf'].some(k => userAgent.includes(k));
    const source = cliUa ? 'cli' : 'api';
    
    if (!auth || !auth.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const reqKey = auth.replace('Bearer ', '');
    
    // Match against the hash actually stored (FNV-1a via hashKey) — the old
    // hashPassword + key_prefix fallback allowed a 16-char prefix to authenticate.
    const hashedKey = hashKey(reqKey);
    const legacyHashedKey = hashPassword(reqKey);
    const keyRows = await db`SELECT id, user_id FROM api_keys WHERE key_hash = ${hashedKey} OR key_hash = ${legacyHashedKey}`;
    const userId = keyRows.length > 0 ? keyRows[0].user_id : null;
    if (keyRows.length > 0) {
      await db`UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ${keyRows[0].id}`;
    }
    
    // Admin test models flow: the admin token is a valid JWT, not an API key.
    let adminUserId: string | null = null;
    if (!userId) {
      const payload = await verifyToken(reqKey);
      if (payload && payload.role === 'admin') {
        adminUserId = 'admin';
      }
    }
    
    const finalUserId = userId || adminUserId || c.get('userId');
    
    if (!finalUserId) {
      return c.json({ error: 'Invalid API key or unauthorized' }, 401);
    }

    // Admin test-identity must not be charged or recorded (no real user row).
    const skipUsage = adminUserId === 'admin';

    let body;
    try {
      body = await c.req.json();
    } catch (e) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    const { model: requestedModel, messages, stream = false, temperature, max_tokens, top_p } = body;
    const model = requestedModel || (await getDefaultModel());

    if (!messages || !Array.isArray(messages)) {
      addDevLog('ERROR', 'Completions', 'Invalid messages format', undefined, sessionId);
      return c.json({ error: 'Invalid messages format' }, 400);
    }

    // ── Balance + monthly quota: reject before spending upstream tokens ──
    if (!skipUsage) {
      // Cost-aware gate: a request the user can't afford (worst case bounded by
      // max_tokens) is rejected up front instead of being served for free when
      // the post-generation deduction can't cover the real cost.
      const bal = await checkBalanceForCost(finalUserId, max_tokens);
      if (!bal.ok) {
        addDevLog('WARNING', 'Billing', `Insufficient balance for ${finalUserId} ($${bal.balance} vs est. $${bal.estimatedCost})`, undefined, sessionId);
        return c.json({
          error: {
            message: `Insufficient balance. Current balance: $${bal.balance.toFixed(2)}. Please top up your account.`,
            type: 'insufficient_quota',
            code: 'insufficient_balance'
          }
        }, 402);
      }
      const q = await checkMonthlyQuota(finalUserId);
      if (!q.ok) {
        addDevLog('WARNING', 'Billing', `Monthly quota reached for ${finalUserId} (${q.used}/${q.limit})`, undefined, sessionId);
        return c.json({
          error: {
            message: `Monthly token quota reached (${q.used.toLocaleString()} of ${q.limit.toLocaleString()} tokens used). Quota resets next month.`,
            type: 'insufficient_quota',
            code: 'monthly_quota_reached'
          }
        }, 402);
      }
    }

    const systemPrompt = await getSystemPromptForModel(model);

    // Map OpenAI roles to AI SDK roles, preserving system and handling tool/function.
    // 'tool' must stay 'tool' (with a tool-result part) so the provider can
    // close the tool-call round-trip; collapsing it to 'assistant' breaks that.
    const mapRole = (role: string): string => {
      const r = String(role || '').toLowerCase();
      if (r === 'system' || r === 'user' || r === 'assistant' || r === 'tool') return r;
      if (r === 'function' || r === 'tool_result') return 'tool';
      return 'assistant';
    };

    // Convert messages (supporting both text and multimodal image attachments)
    const coreMessages: any[] = messages.map((m: any) => {
      const role = mapRole(m.role);
      if (role === 'tool') {
        // OpenAI-style tool message -> AI SDK tool-result part so providers
        // (Anthropic/Google/etc.) can associate it with the tool call.
        const rawResult = Array.isArray(m.content) ? JSON.stringify(m.content) : m.content;
        let parsed: unknown = rawResult;
        if (typeof rawResult === 'string') {
          try { parsed = JSON.parse(rawResult); } catch { parsed = rawResult; }
        }
        const output = (parsed !== null && typeof parsed === 'object')
          ? { type: 'json', value: parsed }
          : { type: 'text', value: rawResult ?? '' };
        return {
          role: 'tool',
          content: [{
            type: 'tool-result',
            toolCallId: m.tool_call_id ?? m.toolCallId ?? `call_${Math.random().toString(36).slice(2, 10)}`,
            toolName: m.name ?? 'unknown',
            output,
          }],
        };
      }
      if (Array.isArray(m.content)) {
        return { role, content: m.content };
      }
      if (m.tool_calls && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
        // OpenAI-style assistant tool_calls -> AI SDK tool-call parts so the
        // provider can see which tool was invoked before the tool result.
        const parts: any[] = [];
        if (m.content) parts.push({ type: 'text', text: m.content });
        for (const tc of m.tool_calls) {
          const fn = tc.function || {};
          parts.push({
            type: 'tool-call',
            toolCallId: tc.id ?? `call_${Math.random().toString(36).slice(2, 10)}`,
            toolName: fn.name ?? 'unknown',
            input: typeof fn.arguments === 'string' ? JSON.parse(fn.arguments || '{}') : (fn.arguments ?? {}),
          });
        }
        return { role, content: parts };
      }
      if (m.images && Array.isArray(m.images) && m.images.length > 0) {
        const parts: any[] = [];
        if (m.content) {
          parts.push({ type: 'text', text: m.content });
        }
        for (const img of m.images) {
          parts.push({ type: 'image', image: img });
        }
        return { role, content: parts };
      }
      return { role, content: m.content };
    });

    if (systemPrompt) {
      coreMessages.unshift({ role: 'system', content: systemPrompt });
    }

    addDevLog('INFO', 'Completions', `Incoming request for model: ${model}`, { 
      userId: finalUserId, 
      stream, 
      temperature, 
      max_tokens, 
      top_p,
      messageCount: coreMessages.length,
      sessionId
    }, sessionId);

    const aiModelItems = await getModelInstances(finalUserId, model, sessionId);
    if (!aiModelItems || aiModelItems.length === 0) {
      addDevLog('ERROR', 'Model Selection', `Model not available or no active keys found for ${model}`, undefined, sessionId);
      return c.json({ error: 'Model not available or no active keys.' }, 500);
    }
    
    addDevLog('INFO', 'Model Selection', `Found ${aiModelItems.length} active provider instances for fallback loop`, undefined, sessionId);

    // Check if user has disabled this model
    const prefRows = await db`SELECT enabled FROM user_model_prefs WHERE user_id = ${finalUserId} AND model_id = ${model}`;
    if (prefRows.length > 0 && prefRows[0].enabled === false) {
      return c.json({
        error: {
          message: `Model '${model}' is disabled for your account. Enable it in your dashboard under Providers > Model Catalog.`,
          type: 'invalid_request_error',
          code: 'model_disabled'
        }
      }, 403);
    }

    let lastError: any = null;
    let attempt = 0;
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
    
    for (const item of aiModelItems) {
      attempt++;
      const maxTries = 2; // Up to 2 tries per key for transient 503/429 network/endpoint hiccups
      for (let keyTry = 1; keyTry <= maxTries; keyTry++) {
        try {
          addDevLog('INFO', 'AI Request', `Attempt ${attempt} (try ${keyTry}) on ${item.providerName} [${item.modelId}] starting...`, undefined, sessionId);
          if (stream) {
            const result = await streamText({
              model: item.instance,
              maxRetries: 0,
              messages: coreMessages,
              ...(typeof temperature === 'number' ? { temperature } : {}),
              ...(typeof max_tokens === 'number' ? { maxTokens: max_tokens } : {}),
              ...(typeof top_p === 'number' ? { topP: top_p } : {}),
            });

            // Peek the first fullStream part so upstream provider errors (bad
            // key, dead provider, 4xx/5xx) surface HERE inside the
            // retry/fallback loop, before a single byte is sent to the client.
            // AI SDK v7 reports provider errors as an 'error' part instead of
            // throwing from streamText, which previously made the fallback
            // loop dead code for streaming.
            const iterator = result.fullStream[Symbol.asyncIterator]();
            const first = await iterator.next();
            if (first.done) {
              throw new Error('Provider returned an empty stream');
            }
            if (first.value.type === 'error') {
              const e: any = first.value.error;
              throw e instanceof Error ? e : new Error(e?.message || 'Stream error');
            }

            // OpenAI-compatible SSE stream so aider/cursor/claude-code etc. can parse it.
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              async start(controller) {
                const sentinel = `chatcmpl-${Date.now()}`;
                const created = Math.floor(Date.now() / 1000);
                const send = (obj: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
                const sendRaw = (text: string) => controller.enqueue(encoder.encode(text + '\n\n'));
                // Bill only real usage (never the 150-token minimum for a
                // failed stream) and only once.
                let billed = false;
                const billOnce = async (usage: any) => {
                  if (billed) return;
                  billed = true;
                  if (!skipUsage && usage?.totalTokens) {
                    const tokens = usage.totalTokens;
                    const cost = await computeCost(tokens);
                    await recordUsage(finalUserId, model, tokens, cost, source);
                    const ded = await deductBalance(finalUserId, cost);
                    if (!ded.ok) {
                      addDevLog('WARNING', 'Billing', `Billing failed after stream: balance $${ded.balance.toFixed(2)} < cost $${cost.toFixed(4)}`, undefined, sessionId);
                    }
                  }
                };
                try {
                  const handlePart = async (part: any) => {
                    if (part.type === 'text-delta') {
                      send({ id: sentinel, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta: { content: part.delta }, finish_reason: null }] });
                    }
                  };
                  await handlePart(first.value);
                  let next = await iterator.next();
                  while (!next.done) {
                    const part = next.value;
                    if (part.type === 'error') {
                      send({ error: (part.error as any)?.message || 'Stream error', type: 'provider_error' });
                      return;
                    }
                    if (part.type === 'finish') {
                      send({ id: sentinel, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
                      sendRaw('data: [DONE]');
                      await billOnce(part.totalUsage);
                      addDevLog('SUCCESS', 'AI Request', `Attempt ${attempt}: Successfully streamed response.`, { usage: part.totalUsage }, sessionId);
                      return;
                    }
                    await handlePart(part);
                    next = await iterator.next();
                  }
                } catch (err) {
                  controller.error(err);
                } finally {
                  controller.close();
                }
              },
            });

            return new Response(stream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no',
              },
            });
          } else {
            const result = await generateText({
              model: item.instance,
              maxRetries: 0,
              messages: coreMessages,
              ...(typeof temperature === 'number' ? { temperature } : {}),
              ...(typeof max_tokens === 'number' ? { maxTokens: max_tokens } : {}),
              ...(typeof top_p === 'number' ? { topP: top_p } : {}),
            });

            const tokens: number = result.usage?.totalTokens || 150;
            if (!skipUsage) {
              const cost = await computeCost(tokens);
              await recordUsage(finalUserId, model, tokens, cost, source);
              const ded = await deductBalance(finalUserId, cost);
              if (!ded.ok) {
                // Free-ride backstop: never hand over content that wasn't paid for.
                addDevLog('WARNING', 'Billing', `Billing failed after generation: balance $${ded.balance.toFixed(2)} < cost $${cost.toFixed(4)}`, undefined, sessionId);
                return c.json({
                  error: {
                    message: `Insufficient balance. Current balance: $${ded.balance.toFixed(2)}. Please top up your account.`,
                    type: 'insufficient_quota',
                    code: 'insufficient_balance'
                  }
                }, 402);
              }
            }
            
            addDevLog('SUCCESS', 'AI Request', `Attempt ${attempt}: Successfully generated response.`, { tokens }, sessionId);

            return c.json({
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model,
              choices: [{
                index: 0,
                message: { role: 'assistant', content: result.text },
                finish_reason: 'stop'
              }],
              usage: {
                prompt_tokens: (result.usage as any)?.promptTokens || 0,
                completion_tokens: (result.usage as any)?.completionTokens || 0,
                total_tokens: tokens
              }
            });
          }
        } catch (err: any) {
          lastError = err;
          
          const statusCode = err?.statusCode || (err as any)?.response?.status || 500;
          let parsedResponse = err?.responseBody;
          if (typeof parsedResponse === 'string') {
            try { parsedResponse = JSON.parse(parsedResponse); } catch {}
          }

          const rawMsg = err?.message || '';
          const isTransient = statusCode === 503 || statusCode === 429 || statusCode === 502 || statusCode === 504 || rawMsg.includes('Endpoint is unavailable') || rawMsg.includes('Rate limit');

          const formattedLogDetails = {
            "1. Error Message": rawMsg || 'Unknown error',
            "2. Status Code": statusCode,
            "3. Provider Response (Actual Error)": parsedResponse || err?.response || 'No response body',
            "4. Request Payload (What we sent)": err?.requestBodyValues || 'N/A',
            "5. Raw Error Object": err
          };
          
          addDevLog('WARNING', 'AI Request', `Attempt ${attempt} (try ${keyTry}) failed on ${item.providerName}: ${rawMsg || 'Unknown error'} (Status: ${statusCode})`, formattedLogDetails, sessionId);
          console.error(`[Fallback] AI request failed on ${item.providerName} (Status: ${statusCode}). Error:`, rawMsg || err);
          
          // If transient and we have a retry left on this key, wait briefly and retry
          if (isTransient && keyTry < maxTries) {
            addDevLog('INFO', 'AI Request', `Transient upstream issue on ${item.providerName}. Retrying in 600ms...`, undefined, sessionId);
            await sleep(600);
            continue;
          }

          // Hard client errors (e.g. 400/422 malformed payload) abort unless
          // the provider simply doesn't support this model. 401/403 = bad key,
          // 429 = rate limit, 404 = model not found — all fail over instead.
          const modelNotFound = statusCode === 404 || /not supported|does not exist|not found/i.test(rawMsg);
          if (statusCode >= 400 && statusCode < 500 && statusCode !== 401 && statusCode !== 403 && statusCode !== 429 && !modelNotFound) {
            console.error(`[Fallback] Hard client error detected (${statusCode}), aborting fallback.`);
            throw err;
          }
          
          // Otherwise break keyTry loop to try the next provider / key
          break;
        }
      }
    }
    
    // If all keys and providers failed, throw the last error so it can be sent to the user
    addDevLog('ERROR', 'Completions', `All fallback attempts failed.`, undefined, sessionId);
    throw lastError;
  } catch (error: any) {
    addDevLog('ERROR', 'Completions', `Unhandled exception: ${error?.message || 'Unknown error'}`, { error }, sessionId);
    console.error('Chat completions error:', error);
    let msg = 'Error processing request';
    try {
      if (error?.responseBody) {
        const parsed = JSON.parse(error.responseBody);
        msg = parsed?.error?.message || parsed?.error || parsed?.message || error.responseBody;
      } else {
        msg = error?.message || error?.cause?.message || (typeof error === 'string' ? error : msg);
      }
    } catch {
      msg = error?.message || 'Error processing request';
    }
    const status = msg.includes('not found') ? 400 : 500;
    return c.json({ error: msg }, status);
  }
}

export async function getModelInstance(userId: string, model: string, sessionId?: string) {
  const items = await getModelInstances(userId, model, sessionId);
  return items[0]?.instance;
}

// Try every matching model instance in priority order until one succeeds.
// Chat/stream routes use this so a down or misconfigured primary provider
// fails over instead of returning an error. Only hard client errors (malformed
// payload) abort the chain; bad keys, rate limits and missing models fail over.
export async function tryInstances(
  userId: string,
  model: string,
  sessionId: string | undefined,
  call: (item: ModelInstanceItem) => Promise<void>,
  onFail?: (item: ModelInstanceItem, err: any) => void
): Promise<void> {
  const items = await getModelInstances(userId, model, sessionId);
  let lastError: any;
  for (const item of items) {
    try {
      await call(item);
      return;
    } catch (err: any) {
      lastError = err;
      if (onFail) onFail(item, err);
      const statusCode = err?.statusCode || err?.response?.status || 500;
      let rawMsg = err?.message || String(err);
      if (typeof err?.responseBody === 'string') {
        try {
          const parsed = JSON.parse(err.responseBody);
          rawMsg = parsed?.error?.message || rawMsg;
        } catch {}
      }
      const modelNotFound = statusCode === 404 || /not supported|does not exist|not found/i.test(rawMsg);
      const hardAbort = statusCode >= 400 && statusCode < 500 && statusCode !== 401 && statusCode !== 403 && statusCode !== 429 && !modelNotFound;
      if (hardAbort) throw err;
      addDevLog('WARNING', 'AI Request', `Instance failed, trying next provider: ${rawMsg || 'Unknown error'} (Status: ${statusCode})`, undefined, sessionId);
    }
  }
  throw lastError || new Error(`Model '${model}' not found or no active provider configured for it.`);
}
