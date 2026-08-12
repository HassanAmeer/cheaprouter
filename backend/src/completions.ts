import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { db } from './db.ts';
import { recordUsage } from './usage.ts';
import { hashPassword, verifyToken } from './auth.ts';

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

export async function getModelInstances(userId: string, model: string) {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true`;

  // Dynamic Provider Resolution
  for (const p of providersResult) {
    if (p.models && Array.isArray(p.models)) {
      const matched = p.models.find((m: any) => m.id === model);
      if (matched) {
        const apiKeys = getActiveKeys(p.key);
        if (apiKeys.length > 0) {
          const modelId = matched.originalId || matched.id;
          return apiKeys.map(apiKey => {
            if (p.api_format === 'anthropic') {
              return createAnthropic({ apiKey, baseURL: p.base_url || undefined })(modelId);
            } else if (p.api_format === 'google') {
              return createGoogleGenerativeAI({ apiKey, baseURL: p.base_url || undefined })(modelId);
            } else if (p.api_format === 'cohere') {
              return createCohere({ apiKey, baseURL: p.base_url || undefined })(modelId);
            } else {
              // Default to OpenAI / Custom provider
              return createOpenAI({ apiKey, baseURL: p.base_url || undefined })(modelId);
            }
          });
        }
      }
    }
  }

  throw new Error(`Model '${model}' not found or no active provider configured for it.`);
}

export async function handleCompletions(c: any) {
  try {
    const auth = c.req.header('authorization');
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
      return c.json({ error: 'Invalid messages format' }, 400);
    }

    const aiModels = await getModelInstances(finalUserId, model);
    if (!aiModels || aiModels.length === 0) {
      return c.json({ error: 'Model not available or no active keys.' }, 500);
    }

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

    const systemPrompt = await getSystemPromptForModel(model);

    // Admin test-identity must not be recorded against usage (no real user row).
    const skipUsage = adminUserId === 'admin';

    // Convert messages
    const coreMessages: any[] = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    if (systemPrompt) {
      coreMessages.unshift({ role: 'system', content: systemPrompt });
    }

    let lastError: any = null;
    
    for (const aiModel of aiModels) {
      try {
        if (stream) {
          const result = await streamText({
            model: aiModel,
            maxRetries: 0,
            messages: coreMessages,
            async onFinish({ usage }) {
              if (usage && !skipUsage) {
                await recordUsage(finalUserId, model, usage.totalTokens || 150, (usage.totalTokens || 150) * 0.000003);
              }
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
        console.error(`[Fallback] AI request failed with a key. Trying next... Error:`, err?.message || err);
        // Continue to the next aiModel in the array
      }
    }
    
    // If all keys failed, throw the last error so it can be sent to the user
    throw lastError;
  } catch (error: any) {
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
