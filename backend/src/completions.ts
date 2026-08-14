import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { db } from './db.ts';
import { recordUsage } from './usage.ts';
import { hashPassword, verifyToken } from './auth.ts';
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

export async function getModelInstances(userId: string, model: string, sessionId?: string): Promise<ModelInstanceItem[]> {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true ORDER BY priority DESC NULLS LAST, id ASC`;
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
    
    if (!auth || !auth.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const reqKey = auth.replace('Bearer ', '');
    
    const hashedKey = hashPassword(reqKey);
    const keyRows = await db`SELECT user_id FROM api_keys WHERE key_hash = ${hashedKey} OR key_prefix = ${reqKey.substring(0, 16)}`;
    const userId = keyRows.length > 0 ? keyRows[0].user_id : null;
    
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

    let body;
    try {
      body = await c.req.json();
    } catch (e) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    const { model = 'gpt-4o', messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      addDevLog('ERROR', 'Completions', 'Invalid messages format', undefined, sessionId);
      return c.json({ error: 'Invalid messages format' }, 400);
    }

    const systemPrompt = await getSystemPromptForModel(model);

    // Convert messages
    const coreMessages: any[] = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    if (systemPrompt) {
      coreMessages.unshift({ role: 'system', content: systemPrompt });
    }

    addDevLog('INFO', 'Completions', `Incoming request for model: ${model}`, { 
      userId: finalUserId, 
      messageCount: messages.length,
      payload: coreMessages
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

    // Admin test-identity must not be recorded against usage (no real user row).
    const skipUsage = adminUserId === 'admin';

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
              async onFinish({ usage, text }) {
                if (usage && !skipUsage) {
                  await recordUsage(finalUserId, model, usage.totalTokens || 150, (usage.totalTokens || 150) * 0.000003);
                }
                addDevLog('SUCCESS', 'AI Request', `Attempt ${attempt}: Successfully streamed response.`, { 
                  usage,
                  responsePreview: text.slice(0, 200) + (text.length > 200 ? '...' : '')
                }, sessionId);
              },
            });
            return result.toTextStreamResponse();
          } else {
            const result = await generateText({
              model: item.instance,
              maxRetries: 0,
              messages: coreMessages,
            });

            const tokens: number = result.usage?.totalTokens || 150;
            if (!skipUsage) {
              await recordUsage(finalUserId, model, tokens, tokens * 0.000003);
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

          // Hard client errors (e.g. 400 Bad Request, 403 Forbidden) abort unless model isn't supported on this provider
          if (statusCode >= 400 && statusCode < 500 && statusCode !== 429 && !rawMsg.includes('not supported')) {
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
