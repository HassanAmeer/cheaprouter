import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, generateText } from 'ai';
import { db } from './db.ts';
import { recordUsage } from './usage.ts';

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
    const keyRows = await db`SELECT user_id FROM api_keys WHERE key_hash = ${reqKey} OR key_prefix = ${reqKey.substring(0, 10)}`;
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

    let provider = 'OpenAI';
    if (model.includes('claude')) provider = 'Anthropic';
    if (model.includes('gemini')) provider = 'Google';

    // Get provider key from user's configured providers in Postgres
    // In the frontend it used `db.getActiveProviderKey(provider)` which checked if it was global or user specific.
    // Let's first check user's providers
    const userProviders = await db`SELECT masked_key FROM providers WHERE user_id = ${finalUserId} AND provider = ${provider} AND status = 'active'`;
    let apiKey = userProviders.length > 0 ? userProviders[0].masked_key : null;
    
    // Fallback to global admin providers if user doesn't have one?
    // The instructions implied falling back to process env or global DB.
    if (!apiKey) {
      if (provider === 'OpenAI') apiKey = process.env.OPENAI_API_KEY;
      if (provider === 'Anthropic') apiKey = process.env.ANTHROPIC_API_KEY;
      if (provider === 'Google') apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    }

    if (!apiKey) {
      return c.json({ error: `No API key found for provider ${provider}. Add it in the BYOK dashboard.` }, 400);
    }

    let aiModel: any;
    if (provider === 'OpenAI') {
      const openai = createOpenAI({ apiKey });
      aiModel = openai(model);
    } else if (provider === 'Anthropic') {
      const anthropic = createAnthropic({ apiKey });
      aiModel = anthropic(model);
    } else {
      const google = createGoogleGenerativeAI({ apiKey });
      aiModel = google(model);
    }

    // Convert messages
    const coreMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

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
      
      const tokens = result.usage ? result.usage.totalTokens : 150;
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
          prompt_tokens: result.usage?.promptTokens || 0,
          completion_tokens: result.usage?.completionTokens || 0,
          total_tokens: tokens
        }
      });
    }
  } catch (error: any) {
    console.error('Chat completions error:', error);
    return c.json({ error: error.message || 'Error processing request' }, 500);
  }
}
