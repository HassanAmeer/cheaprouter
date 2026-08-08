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

  const groqInst = checkProv('ap_groq', (key) => createOpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: key }));
  if (groqInst) return groqInst;

  const googleInst = checkProv('ap_google', (key) => createGoogleGenerativeAI({ apiKey: key }));
  if (googleInst) return googleInst;

  const cerebrasInst = checkProv('ap_cerebras', (key) => createOpenAI({ baseURL: 'https://api.cerebras.ai/v1', apiKey: key }));
  if (cerebrasInst) return cerebrasInst;

  const sambanovaInst = checkProv('ap_sambanova', (key) => createOpenAI({ baseURL: 'https://api.sambanova.ai/v1', apiKey: key }));
  if (sambanovaInst) return sambanovaInst;

  const xaiInst = checkProv('ap_xai', (key) => createOpenAI({ baseURL: 'https://api.x.ai/v1', apiKey: key }));
  if (xaiInst) return xaiInst;

  const novitaInst = checkProv('ap_novita', (key) => createOpenAI({ baseURL: 'https://api.novita.ai/v3/openai', apiKey: key }));
  if (novitaInst) return novitaInst;

  const bytezInst = checkProv('ap_bytez', (key) => createOpenAI({ baseURL: 'https://api.bytez.com/v1', apiKey: key }));
  if (bytezInst) return bytezInst;

  const aimlapiInst = checkProv('ap_aimlapi', (key) => createOpenAI({ baseURL: 'https://api.aimlapi.com/v1', apiKey: key }));
  if (aimlapiInst) return aimlapiInst;

  const mistralInst = checkProv('ap_mistral', (key) => createOpenAI({ baseURL: 'https://api.mistral.ai/v1', apiKey: key }));
  if (mistralInst) return mistralInst;

  const togetherInst = checkProv('ap_together', (key) => createOpenAI({ baseURL: 'https://api.together.xyz/v1', apiKey: key }));
  if (togetherInst) return togetherInst;

  const deepseekInst = checkProv('ap_deepseek', (key) => createOpenAI({ baseURL: 'https://api.deepseek.com/v1', apiKey: key }));
  if (deepseekInst) return deepseekInst;

  const fireworksInst = checkProv('ap_fireworks', (key) => createOpenAI({ baseURL: 'https://api.fireworks.ai/inference/v1', apiKey: key }));
  if (fireworksInst) return fireworksInst;

  const perplexityInst = checkProv('ap_perplexity', (key) => createOpenAI({ baseURL: 'https://api.perplexity.ai', apiKey: key }));
  if (perplexityInst) return perplexityInst;

  const amazonbedrockInst = checkProv('ap_amazonbedrock', (key) => createOpenAI({ baseURL: 'https://bedrock.proxy/v1', apiKey: key }));
  if (amazonbedrockInst) return amazonbedrockInst;

  const githubInst = checkProv('ap_github', (key) => createOpenAI({ baseURL: 'https://models.inference.ai.azure.com', apiKey: key }));
  if (githubInst) return githubInst;

  const huggingfaceInst = checkProv('ap_huggingface', (key) => createOpenAI({ baseURL: 'https://api-inference.huggingface.co/v1', apiKey: key }));
  if (huggingfaceInst) return huggingfaceInst;

  const hyperbolicInst = checkProv('ap_hyperbolic', (key) => createOpenAI({ baseURL: 'https://api.hyperbolic.ai/v1', apiKey: key }));
  if (hyperbolicInst) return hyperbolicInst;

  const moonshotInst = checkProv('ap_moonshot', (key) => createOpenAI({ baseURL: 'https://api.moonshot.cn/v1', apiKey: key }));
  if (moonshotInst) return moonshotInst;

  const zaiInst = checkProv('ap_zai', (key) => createOpenAI({ baseURL: 'https://api.z.ai/v1', apiKey: key }));
  if (zaiInst) return zaiInst;

  const nvidiaInst = checkProv('ap_nvidia', (key) => createOpenAI({ baseURL: 'https://integrate.api.nvidia.com/v1', apiKey: key }));
  if (nvidiaInst) return nvidiaInst;

  const kilocodeInst = checkProv('ap_kilocode', (key) => createOpenAI({ baseURL: 'https://api.kilocode.ai/v1', apiKey: key }));
  if (kilocodeInst) return kilocodeInst;

  const clinecodeInst = checkProv('ap_clinecode', (key) => createOpenAI({ baseURL: 'https://api.clinecode.ai/v1', apiKey: key }));
  if (clinecodeInst) return clinecodeInst;

  const poixeInst = checkProv('ap_poixe', (key) => createOpenAI({ baseURL: 'https://api.poixe.com/v1', apiKey: key }));
  if (poixeInst) return poixeInst;

  const siliconflowInst = checkProv('ap_siliconflow', (key) => createOpenAI({ baseURL: 'https://api.siliconflow.cn/v1', apiKey: key }));
  if (siliconflowInst) return siliconflowInst;

  const zenmuxInst = checkProv('ap_zenmux', (key) => createOpenAI({ baseURL: 'https://api.zenmux.ai/v1', apiKey: key }));
  if (zenmuxInst) return zenmuxInst;

  const unorouterInst = checkProv('ap_unorouter', (key) => createOpenAI({ baseURL: 'https://api.unorouter.com/v1', apiKey: key }));
  if (unorouterInst) return unorouterInst;

  const routewayInst = checkProv('ap_routeway', (key) => createOpenAI({ baseURL: 'https://api.routeway.ai/v1', apiKey: key }));
  if (routewayInst) return routewayInst;

  const stepfunInst = checkProv('ap_stepfun', (key) => createOpenAI({ baseURL: 'https://api.stepfun.com/v1', apiKey: key }));
  if (stepfunInst) return stepfunInst;

  const llm7Inst = checkProv('ap_llm7', (key) => createOpenAI({ baseURL: 'https://api.llm7.io/v1', apiKey: key }));
  if (llm7Inst) return llm7Inst;

  const modelscopeInst = checkProv('ap_modelscope', (key) => createOpenAI({ baseURL: 'https://api-inference.modelscope.cn/v1', apiKey: key }));
  if (modelscopeInst) return modelscopeInst;

  const aihordeInst = checkProv('ap_aihorde', (key) => createOpenAI({ baseURL: 'https://aihorde.net/api/v2', apiKey: key }));
  if (aihordeInst) return aihordeInst;

  const pollinationsInst = checkProv('ap_pollinations', (key) => createOpenAI({ baseURL: 'https://text.pollinations.ai/v1', apiKey: key }));
  if (pollinationsInst) return pollinationsInst;

  const anyrouterInst = checkProv('ap_anyrouter', (key) => createOpenAI({ baseURL: 'https://api.anyrouter.dev/v1', apiKey: key }));
  if (anyrouterInst) return anyrouterInst;

  const agnesaiInst = checkProv('ap_agnesai', (key) => createOpenAI({ baseURL: 'https://api.agnes-ai.com/v1', apiKey: key }));
  if (agnesaiInst) return agnesaiInst;

  const tokenrouterInst = checkProv('ap_tokenrouter', (key) => createOpenAI({ baseURL: 'https://api.tokenrouter.com/v1', apiKey: key }));
  if (tokenrouterInst) return tokenrouterInst;

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
