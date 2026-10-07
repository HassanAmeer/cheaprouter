// ---------------------------------------------------------------------------
// Provider resolution — fetches active providers from DB (cached 60 s),
// matches a requested model, and selects an API key (random load-balance).
// ---------------------------------------------------------------------------

import { db }                        from './db.ts';
import { providerCache, Provider }   from './cache.ts';

const PROVIDER_CACHE_KEY = '__active__';
const PROVIDER_TTL_MS    = 60_000; // 60 s

/** Placeholder / masked keys must never reach an upstream provider */
function isPlaceholder(key: string): boolean {
  const s = String(key ?? '').trim();
  if (!s) return true;
  if (s.includes('•') || s.includes('...')) return true;
  if (/demo$/i.test(s)) return true;
  return false;
}

/** Parse the JSON key field and return only active, real keys (shuffled) */
export function getActiveKeys(raw: string): string[] {
  if (!raw) return [];
  let parsed: any;
  try { parsed = JSON.parse(raw); } catch { parsed = raw; }

  const keys: string[] = Array.isArray(parsed)
    ? parsed
        .filter((k: any) =>
          typeof k === 'string'
            ? !isPlaceholder(k)
            : k.active !== false && !isPlaceholder(k.key ?? ''),
        )
        .map((k: any) => (typeof k === 'string' ? k : k.key))
    : isPlaceholder(parsed) ? [] : [String(parsed)];

  // Shuffle for load-balancing across keys
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

/** Return all active providers (from cache or DB) */
export async function getActiveProviders(): Promise<Provider[]> {
  const cached = providerCache.get(PROVIDER_CACHE_KEY);
  if (cached) return cached;

  const rows = await db<Provider[]>`
    SELECT id, name, status, key, priority, base_url, api_format, models, headers, byok_enabled
    FROM   admin_providers
    WHERE  status = true
    ORDER  BY priority ASC NULLS LAST, id ASC
  `;
  providerCache.set(PROVIDER_CACHE_KEY, rows, PROVIDER_TTL_MS);
  return rows;
}

export interface ResolvedModel {
  provider:   Provider;
  apiKey:     string;
  modelId:    string;           // The actual upstream model ID (originalId or id)
}

/** Find the matching provider + key + modelId for a given model name */
export async function resolveModel(model: string): Promise<ResolvedModel[]> {
  const providers = await getActiveProviders();
  const results: ResolvedModel[] = [];

  for (const p of providers) {
    const models: any[] = Array.isArray(p.models) ? p.models : [];
    const matched = models.find((m: any) => {
      if (typeof m === 'string') return m === model;
      return m.id === model || m.originalId === model || m.name === model;
    });
    if (!matched) continue;

    const keys = getActiveKeys(p.key);
    if (!keys.length) continue;

    const modelId =
      typeof matched === 'string'
        ? matched
        : matched.originalId || matched.id || matched.name || model;

    for (const apiKey of keys) {
      results.push({ provider: p, apiKey, modelId });
    }
  }

  return results;
}

/** Return the first model from the highest-priority active provider */
export async function getDefaultModel(): Promise<string> {
  const providers = await getActiveProviders();
  for (const p of providers) {
    if (Array.isArray(p.models) && p.models.length > 0) {
      const first = p.models[0];
      const id =
        typeof first === 'string'
          ? first
          : first.originalId || first.id || first.name || '';
      if (id.trim()) return id.trim();
    }
  }
  return 'gpt-4o';
}

/**
 * Creates or updates a custom provider in admin_providers with custom models, keys, and base_url
 */
export async function upsertCustomProvider(params: {
  id?: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  apiFormat?: string;
  models: Array<{ id: string; name?: string; originalId?: string } | string>;
  headers?: Record<string, string>;
  priority?: number;
  status?: boolean;
}): Promise<any> {
  const provId = params.id?.trim() || `ap_custom_${Date.now()}`;
  const name = params.name.trim();
  const baseUrl = params.baseUrl.trim();
  const apiKey = params.apiKey.trim();
  const apiFormat = params.apiFormat || 'openai';
  const priority = params.priority ?? 10;
  const status = params.status ?? true;

  // Format models into standard catalog structure
  const formattedModels = (params.models || []).map((m: any) => {
    if (typeof m === 'string') {
      const id = m.trim();
      return { id, name: id, originalId: id };
    }
    const id = (m.id || m.originalId || m.name || '').trim();
    return {
      id,
      name: (m.name || id).trim(),
      originalId: (m.originalId || id).trim(),
      text: true,
      reasoning: m.reasoning ?? false,
      vision: m.vision ?? false,
    };
  }).filter((m: any) => m.id);

  const keyJson = JSON.stringify([apiKey]);

  await db`
    INSERT INTO admin_providers (id, name, status, key, priority, base_url, api_format, is_custom, models, headers)
    VALUES (
      ${provId},
      ${name},
      ${status},
      ${keyJson},
      ${priority},
      ${baseUrl},
      ${apiFormat},
      true,
      ${db.json(formattedModels)},
      ${db.json(params.headers || {})}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = ${name},
      status = ${status},
      key = ${keyJson},
      priority = ${priority},
      base_url = ${baseUrl},
      api_format = ${apiFormat},
      is_custom = true,
      models = ${db.json(formattedModels)},
      headers = ${db.json(params.headers || {})}
  `;

  // Invalidate provider cache immediately
  providerCache.delete(PROVIDER_CACHE_KEY);

  return {
    success: true,
    id: provId,
    name,
    baseUrl,
    apiFormat,
    modelsCount: formattedModels.length,
    models: formattedModels,
  };
}

/**
 * Deletes a custom provider
 */
export async function deleteCustomProvider(id: string): Promise<boolean> {
  await db`DELETE FROM admin_providers WHERE id = ${id}`;
  providerCache.delete(PROVIDER_CACHE_KEY);
  return true;
}
