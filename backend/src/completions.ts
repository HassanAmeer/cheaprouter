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
      const matched = prov.models.find((m: any) => m.id === model);
      if (matched && matched.systemPrompt) {
        return matched.systemPrompt;
      }
    }
  }
  return null;
}

export async function getModelInstances(userId: string, model: string, sessionId?: string) {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true`;

  // Dynamic Provider Resolution
  for (const p of providersResult) {
    if (p.models && Array.isArray(p.models)) {
      const matched = p.models.find((m: any) => m.id === model);
      if (matched) {
        const apiKeys = getActiveKeys(p.key);
        if (apiKeys.length > 0) {
          const modelId = matched.originalId || matched.id;
          const customHeaders: Record<string, string> = sessionId ? { 'x-session-id': sessionId } : {};
          
          const customFetch = async (url: any, options?: any) => {
            const fs = require('fs');
            fs.appendFileSync('fetch_debug.log', `customFetch called, body type: ${options?.body ? typeof options.body : 'undefined'} isBuffer: ${Buffer.isBuffer(options?.body)} constructor: ${options?.body?.constructor?.name}\n`);
            if (options && options.body && typeof options.body === 'string' && sessionId) {
              try {
                const parsedBody = JSON.parse(options.body);
                parsedBody.sessionId = sessionId;
                options.body = JSON.stringify(parsedBody);
              } catch (e) {
                // Ignore parse errors
              }
            }
            return fetch(url, options);
          };

          return apiKeys.map(apiKey => {
            if (p.api_format === 'anthropic') {
              return createAnthropic({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders, fetch: customFetch as any })(modelId);
            } else if (p.api_format === 'google') {
              return createGoogleGenerativeAI({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders, fetch: customFetch as any })(modelId);
            } else if (p.api_format === 'cohere') {
              return createCohere({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders, fetch: customFetch as any })(modelId);
            } else {
              // Default to OpenAI / Custom provider
              return createOpenAI({ apiKey, baseURL: p.base_url || undefined, headers: customHeaders, fetch: customFetch as any })(modelId);
            }
          });
        }
      }
    }
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
    
    // In a real app we validate reqKey against api_keys table here
    // For now we accept it to find the user. 
    // We assume the user has a valid API key, or we just look up the user by key.
    const hashedKey = hashPassword(reqKey);
    const keyRows = await db`SELECT user_id FROM api_keys WHERE key_hash = ${hashedKey} OR key_prefix = ${reqKey.substring(0, 16)}`;
    const userId = keyRows.length > 0 ? keyRows[0].user_id : null;
    
    // Admin test models flow: the admin token is a valid JWT, not an API key.
    // Treat signed-in admins as the 'admin' test identity.
    let adminUserId: string | null = null;
    if (!userId) {
      const payload = await verifyToken(reqKey);
      if (payload && payload.role === 'admin') {
        adminUserId = 'admin';
      }
    }
    
    // If no user found from API key, but we have a user logged in (frontend chat), we could use c.get('userId')
    // We'll fall back to c.get('userId')
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

    const aiModels = await getModelInstances(finalUserId, model, sessionId);
    if (!aiModels || aiModels.length === 0) {
      addDevLog('ERROR', 'Model Selection', `Model not available or no active keys found for ${model}`, undefined, sessionId);
      return c.json({ error: 'Model not available or no active keys.' }, 500);
    }
    
    addDevLog('INFO', 'Model Selection', `Found ${aiModels.length} active keys/instances for fallback loop`, undefined, sessionId);

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
    
    for (const aiModel of aiModels) {
      attempt++;
      try {
        addDevLog('INFO', 'AI Request', `Attempt ${attempt}/${aiModels.length} starting with selected key...`, undefined, sessionId);
        if (stream) {
          const result = await streamText({
            model: aiModel,
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
            model: aiModel,
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
        
        // Extract status code from Vercel AI SDK error objects
        const statusCode = err?.statusCode || (err as any)?.response?.status || 500;
        
        let parsedResponse = err?.responseBody;
        if (typeof parsedResponse === 'string') {
          try { parsedResponse = JSON.parse(parsedResponse); } catch {}
        }

        const formattedLogDetails = {
          "1. Error Message": err?.message || 'Unknown error',
          "2. Status Code": statusCode,
          "3. Provider Response (Actual Error)": parsedResponse || err?.response || 'No response body',
          "4. Request Payload (What we sent)": err?.requestBodyValues || 'N/A',
          "5. Raw Error Object": err
        };
        
        addDevLog('WARNING', 'AI Request', `Attempt ${attempt} failed: ${err?.message || 'Unknown error'} (Status: ${statusCode})`, formattedLogDetails, sessionId);
        console.error(`[Fallback] AI request failed with a key (Status: ${statusCode}). Error:`, err?.message || err);
        
        // If it's a "Hard Error" (e.g. 400 Bad Request, 401, 403) and NOT a 429 Rate Limit, we abort fallback.
        // This prevents trying the same invalid prompt on all keys.
        if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
          console.error(`[Fallback] Hard error detected (${statusCode}), aborting fallback.`);
          throw err; // Break loop and send to user
        }
        
        // Continue to the next aiModel in the array for 429 or 5xx errors
      }
    }
    
    // If all keys failed, throw the last error so it can be sent to the user
    addDevLog('ERROR', 'Completions', `All fallback attempts failed.`, undefined, sessionId);
    throw lastError;
  } catch (error: any) {
    addDevLog('ERROR', 'Completions', `Unhandled exception: ${error?.message || 'Unknown error'}`, { error }, sessionId);
    console.error('Chat completions error:', error);
    // AI SDK throws APICallError with a responseBody string — parse it for the real error
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
  const instances = await getModelInstances(userId, model, sessionId);
  return instances[0];
}
