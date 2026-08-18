import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { db } from './db.ts';
import { recordUsage } from './usage.ts';
import { hashPassword, verifyToken } from './auth.ts';
import { hashKey } from './keys.ts';
import { computeCost, getBalance, checkBalanceEnough, deductBalance } from './billing.ts';
import { addDevLog } from './logger.ts';

function getActiveKeys(keyStr: string): string[] {
  if (!keyStr) return [];
  try {
    const parsed = JSON.parse(keyStr);
    if (Array.isArray(parsed)) {
      const activeKeys = parsed.filter((k: any) => {
        if (typeof k === 'string') return true;
        return k.active !== false && k.key?.trim() !== '';
      }).map((k: any) => typeof k === 'string' ? k : k.key);
      
      // Shuffle the active keys array for load balancing
      for (let i = activeKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeKeys[i], activeKeys[j]] = [activeKeys[j], activeKeys[i]];
      }
      
      return activeKeys;
    }
    return [keyStr];
  } catch {
    return [keyStr];
  }
}

export async function getSystemPromptForModel(model: string) {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true`;
  for (const prov of providersResult) {
    if (prov.models && Array.isArray(prov.models)) {
      const matched = prov.models.find((m: any) => m.id === model || m.originalId === model || m.name === model);
      if (matched && matched.systemPrompt) {
        return matched.systemPrompt;
      }
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
        return (first.originalId || first.id || first.name || '').trim() || undefined;
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
    if (p.models && Array.isArray(p.models)) {
      const matched = p.models.find((m: any) => m.id === model || m.originalId === model || m.name === model);
      if (matched) {
        const apiKeys = getActiveKeys(p.key);
        if (apiKeys.length > 0) {
          const modelId = matched.originalId || matched.id;
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

    // ── Balance enforcement: reject before spending upstream tokens ──
    if (!skipUsage) {
      const bal = await checkBalanceEnough(finalUserId);
      if (!bal.ok) {
        addDevLog('WARNING', 'Billing', `Insufficient balance for ${finalUserId} ($${bal.balance})`, undefined, sessionId);
        return c.json({
          error: {
            message: `Insufficient balance. Current balance: $${bal.balance.toFixed(2)}. Please top up your account.`,
            type: 'insufficient_quota',
            code: 'insufficient_balance'
          }
        }, 402);
      }
    }

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
            // Bill exactly once regardless of how the stream ends (success,
            // upstream error, or client abort). onFinish alone is skipped on
            // error/abort, so we also settle in the stream's finally block.
            let billed = false;
            const bill = async (usage: any) => {
              if (billed) return;
              billed = true;
              if (!skipUsage) {
                const tokens = usage?.totalTokens || 150;
                const cost = await computeCost(tokens);
                await recordUsage(finalUserId, model, tokens, cost, source);
                await deductBalance(finalUserId, cost);
              }
            };

            const result = await streamText({
              model: item.instance,
              maxRetries: 0,
              messages: coreMessages,
              ...(typeof temperature === 'number' ? { temperature } : {}),
              ...(typeof max_tokens === 'number' ? { maxTokens: max_tokens } : {}),
              ...(typeof top_p === 'number' ? { topP: top_p } : {}),
              async onFinish({ usage, text }) {
                await bill(usage);
                addDevLog('SUCCESS', 'AI Request', `Attempt ${attempt}: Successfully streamed response.`, { 
                  usage,
                  responsePreview: text.slice(0, 200) + (text.length > 200 ? '...' : '')
                }, sessionId);
              },
              async onError({ error }) {
                await bill(undefined);
                addDevLog('ERROR', 'AI Request', `Attempt ${attempt}: Stream error.`, { error: String(error) }, sessionId);
              },
            });

            // OpenAI-compatible SSE stream so aider/cursor/claude-code etc. can parse it.
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              async start(controller) {
                const sentinel = `chatcmpl-${Date.now()}`;
                const created = Math.floor(Date.now() / 1000);
                try {
                  for await (const chunk of result.textStream) {
                    const payload = {
                      id: sentinel,
                      object: 'chat.completion.chunk',
                      created,
                      model,
                      choices: [{ index: 0, delta: { content: chunk }, finish_reason: null }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
                  }
                  const done = {
                    id: sentinel,
                    object: 'chat.completion.chunk',
                    created,
                    model,
                    choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(done)}\n\n`));
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                } catch (err) {
                  controller.error(err);
                } finally {
                  // Settle billing even if onFinish never fired (error/abort).
                  const usage = await Promise.resolve(result.usage).catch(() => undefined);
                  await bill(usage).catch(() => {});
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
              await deductBalance(finalUserId, cost);
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

          // Hard client errors (e.g. 400 Bad Request, 422) abort unless model isn't supported on this provider.
          // 401/403 mean the key is bad/rotated on this provider — fail over to the next provider/key instead.
          if (statusCode >= 400 && statusCode < 500 && statusCode !== 401 && statusCode !== 403 && statusCode !== 429 && !rawMsg.includes('not supported')) {
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
