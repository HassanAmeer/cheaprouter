import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';
import { streamText, generateText } from 'ai';
import { db } from './db.ts';
import { recordUsage } from './usage.ts';
import { hashPassword } from './auth.ts';

function pickActiveKey(keyStr: string): string | null {
  if (!keyStr) return null;
  try {
    const parsed = JSON.parse(keyStr);
    if (Array.isArray(parsed)) {
      const activeKeys = parsed.filter((k: any) => {
        if (typeof k === 'string') return true;
        return k.active !== false && k.key?.trim() !== '';
      }).map((k: any) => typeof k === 'string' ? k : k.key);
      if (activeKeys.length > 0) {
        return activeKeys[Math.floor(Math.random() * activeKeys.length)];
      }
      return null;
    }
    return keyStr;
  } catch {
    return keyStr;
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

export async function getModelInstance(userId: string, model: string) {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true`;
  
  // Helper to check a specific provider
  const checkProv = (provId: string, factory: (key: string) => any) => {
    const p = providersResult.find((r: any) => r.id === provId);
    if (p && p.models) {
      const matched = p.models.find((m: any) => m.id === model);
      if (matched) {
        const apiKey = pickActiveKey(p.key);
        if (apiKey) return factory(apiKey)(matched.originalId || matched.id);
      }
    }
    return null;
  };

  const orInst = checkProv('ap_openrouter', (key) => createOpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: key }));
  if (orInst) return orInst;

  const oaInst = checkProv('ap_openai', (key) => createOpenAI({ apiKey: key }));
  if (oaInst) return oaInst;

  const anthInst = checkProv('ap_anthropic', (key) => createAnthropic({ apiKey: key }));
  if (anthInst) return anthInst;

  const cohereInst = checkProv('ap_cohere', (key) => createCohere({ apiKey: key }));
  if (cohereInst) return cohereInst;

  let provider = 'OpenAI';
  if (model.includes('claude')) provider = 'Anthropic';
  if (model.includes('gemini')) provider = 'Google';

  const userProviders = await db`SELECT masked_key FROM providers WHERE user_id = ${userId} AND provider = ${provider} AND status = 'active'`;
  let apiKey = userProviders.length > 0 ? userProviders[0].masked_key : null;
  
  if (!apiKey) {
    if (provider === 'OpenAI') apiKey = process.env.OPENAI_API_KEY;
    if (provider === 'Anthropic') apiKey = process.env.ANTHROPIC_API_KEY;
    if (provider === 'Google') apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }
  
  if (!apiKey) throw new Error(`No API key found for provider ${provider}`);

  if (provider === 'OpenAI') return createOpenAI({ apiKey })(model);
  if (provider === 'Anthropic') return createAnthropic({ apiKey })(model);
  return createGoogleGenerativeAI({ apiKey })(model);
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
    const keyRows = await db`SELECT user_id FROM api_keys WHERE key_hash = ${hashedKey} OR key_prefix = ${reqKey.substring(0, 10)}`;
    const userId = keyRows.length > 0 ? keyRows[0].user_id : null;
    
    // If no user found from API key, but we have a user logged in (frontend chat), we could use c.get('userId')
    // We'll fall back to c.get('userId')
    const finalUserId = userId || c.get('userId');
    
    if (!finalUserId) {
      return c.json({ error: 'Invalid API key or unauthorized' }, 401);
    }

    const body = await c.req.valid('json');
    const { model = 'gpt-4o', messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Invalid messages format' }, 400);
    }

    const aiModel = await getModelInstance(finalUserId, model);
    const systemPrompt = await getSystemPromptForModel(model);

    // Convert messages
    const coreMessages: any[] = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    if (systemPrompt) {
      coreMessages.unshift({ role: 'system', content: systemPrompt });
    }

    if (stream) {
      const result = await streamText({
        model: aiModel,
        messages: coreMessages,
        async onFinish({ usage }) {
          if (usage) {
            await recordUsage(finalUserId, model, usage.totalTokens || 150, (usage.totalTokens || 150) * 0.000003);
          }
        },
      });
      return result.toTextStreamResponse();
    } else {
      const result = await generateText({
        model: aiModel,
        messages: coreMessages,
      });
      
      const tokens: number = result.usage?.totalTokens || 150;
      await recordUsage(finalUserId, model, tokens, tokens * 0.000003);
      
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
  } catch (error: any) {
    console.error('Chat completions error:', error);
    return c.json({ error: error.message || 'Error processing request' }, 500);
  }
}
