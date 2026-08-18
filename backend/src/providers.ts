import { db, genId } from './db.ts';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const META: Record<string, { name: string; color: string }> = {
  openai: { name: 'OpenAI', color: '#10A37F' },
  anthropic: { name: 'Anthropic', color: '#D97757' },
  google: { name: 'Google', color: '#4285F4' },
  meta: { name: 'Meta', color: '#0668E1' },
  deepseek: { name: 'DeepSeek', color: '#1A53E8' },
};

export function providerMeta(key: string) {
  return META[key] ?? { name: key, color: '#888' };
}

function matchModel(models: any, model: string): any {
  if (!Array.isArray(models)) return null;
  return models.find((m: any) => {
    if (typeof m === 'string') return m === model;
    return m.id === model || m.originalId === model || m.name === model;
  });
}

async function getAdminProviderForType(providerType: string) {
  const providersResult = await db`SELECT * FROM admin_providers WHERE status = true ORDER BY priority ASC NULLS LAST, id ASC`;
  for (const p of providersResult) {
    const nameLower = (p.name || '').toLowerCase();
    const idLower = (p.id || '').toLowerCase();
    if (nameLower.includes(providerType) || idLower.includes(providerType) || providerType === 'openai' && nameLower.includes('openai') || providerType === 'anthropic' && nameLower.includes('anthropic') || providerType === 'google' && (nameLower.includes('google') || nameLower.includes('gemini')) || providerType === 'deepseek' && nameLower.includes('deepseek') || providerType === 'meta' && (nameLower.includes('meta') || nameLower.includes('llama'))) {
      return p;
    }
  }
  return null;
}

export async function testProviderConnection(providerType: string): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const adminProvider = await getAdminProviderForType(providerType);
  if (!adminProvider) {
    return { ok: false, error: `No active admin provider configured for ${providerType}` };
  }

  const apiKeys = adminProvider.key;
  if (!apiKeys) {
    return { ok: false, error: 'Admin provider has no API key configured' };
  }

  let keys: string[];
  try {
    const parsed = JSON.parse(apiKeys);
    if (Array.isArray(parsed)) {
      keys = parsed.filter((k: any) => {
        if (typeof k === 'string') return k && !k.includes('•') && !k.includes('...') && !/demo$/i.test(k);
        return k.active !== false && k.key && !k.key.includes('•') && !k.key.includes('...') && !/demo$/i.test(k.key);
      }).map((k: any) => typeof k === 'string' ? k : k.key);
    } else {
      keys = apiKeys && !apiKeys.includes('•') && !apiKeys.includes('...') && !/demo$/i.test(apiKeys) ? [apiKeys] : [];
    }
  } catch {
    keys = apiKeys && !apiKeys.includes('•') && !apiKeys.includes('...') && !/demo$/i.test(apiKeys) ? [apiKeys] : [];
  }

  if (keys.length === 0) {
    return { ok: false, error: 'No valid API keys configured for this provider' };
  }

  const models = adminProvider.models || [];
  const testModel = matchModel(models, models[0]?.id || models[0]?.originalId || models[0]?.name || '');
  const modelId = testModel ? (typeof testModel === 'string' ? testModel : (testModel.originalId || testModel.id || testModel.name)) : (models[0]?.id || models[0]?.originalId || models[0]?.name || '');

  if (!modelId) {
    return { ok: false, error: 'No models configured for this provider' };
  }

  const customHeaders: Record<string, string> = {
    ...(adminProvider.headers && typeof adminProvider.headers === 'object' && !Array.isArray(adminProvider.headers) ? adminProvider.headers : {}),
  };

  for (const apiKey of keys) {
    try {
      let instance: any;
      if (adminProvider.api_format === 'anthropic') {
        instance = createAnthropic({ apiKey, baseURL: adminProvider.base_url || undefined, headers: customHeaders })(modelId);
      } else if (adminProvider.api_format === 'google') {
        instance = createGoogleGenerativeAI({ apiKey, baseURL: adminProvider.base_url || undefined, headers: customHeaders })(modelId);
      } else if (adminProvider.api_format === 'cohere') {
        const { createCohere } = await import('@ai-sdk/cohere');
        instance = createCohere({ apiKey, baseURL: adminProvider.base_url || undefined, headers: customHeaders })(modelId);
      } else {
        instance = createOpenAI({ apiKey, baseURL: adminProvider.base_url || undefined, headers: customHeaders })(modelId);
      }

      const start = Date.now();
      await generateText({
        model: instance,
        messages: [{ role: 'user', content: 'ping' }],
        maxTokens: 1,
      });
      const latencyMs = Date.now() - start;
      return { ok: true, latencyMs };
    } catch (err: any) {
      const statusCode = err?.statusCode || err?.response?.status || 0;
      const rawMsg = err?.message || String(err);
      if (statusCode === 401 || statusCode === 403) {
        continue; // Try next key
      }
      if (statusCode === 429) {
        continue; // Try next key
      }
      // For other errors, continue to next key
      continue;
    }
  }

  return { ok: false, error: 'All provider keys failed or are invalid' };
}

export async function listProviders(userId: string) {
  const rows = await db`SELECT id, provider, masked_key AS masked, status, created_at AS added FROM providers WHERE user_id = ${userId} ORDER BY created_at DESC` as { id: string; provider: string; masked: string; status: string; added: string }[];
  return rows.map((r) => ({ ...r, ...providerMeta(r.provider) }));
}

export async function upsertProvider(userId: string, provider: string, maskedKey: string) {
  const existing = await db`SELECT id FROM providers WHERE user_id = ${userId} AND provider = ${provider}`;
  if (existing.length > 0) {
    await db`UPDATE providers SET masked_key = ${maskedKey}, status = 'active' WHERE id = ${existing[0].id}`;
    return;
  }
  await db`INSERT INTO providers (id, user_id, provider, masked_key) VALUES (${genId('prv')}, ${userId}, ${provider}, ${maskedKey})`;
}

export async function setProviderStatus(userId: string, id: string, status: string) {
  await db`UPDATE providers SET status = ${status} WHERE id = ${id} AND user_id = ${userId}`;
}

export async function deleteProvider(userId: string, id: string) {
  await db`DELETE FROM providers WHERE id = ${id} AND user_id = ${userId}`;
}
