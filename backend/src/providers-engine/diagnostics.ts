// ---------------------------------------------------------------------------
// Provider & Model Diagnostics / Health Check Engine
// ---------------------------------------------------------------------------

import { db } from './db.ts';
import { getActiveKeys } from './providers.ts';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createCohere } from '@ai-sdk/cohere';
import { generateText } from 'ai';

export interface ProviderDiagnosticItem {
  id: string;
  name: string;
  status: boolean;
  priority: number | null;
  base_url: string | null;
  api_format: string | null;
  keys_count: number;
  has_valid_key: boolean;
  byok_enabled: boolean;
  models_count: number;
  models: { id: string; name: string }[];
  last_test?: {
    ok: boolean;
    latencyMs?: number;
    error?: string;
    testedAt?: string;
    modelTested?: string;
  };
}

const healthCache = new Map<string, { ok: boolean; latencyMs?: number; error?: string; testedAt: string; modelTested?: string }>();

/**
 * Returns full diagnostic list of all providers from database
 */
export async function getProvidersDiagnosticList(): Promise<ProviderDiagnosticItem[]> {
  const rows = await db<any[]>`
    SELECT id, name, status, key, priority, base_url, api_format, models, headers, byok_enabled
    FROM   admin_providers
    ORDER  BY priority ASC NULLS LAST, status DESC, name ASC
  `;

  return rows.map((p) => {
    const keys = getActiveKeys(p.key);
    const rawModels: any[] = Array.isArray(p.models) ? p.models : [];
    const models = rawModels.map((m: any) => {
      const id = typeof m === 'string' ? m : m.originalId || m.id || m.name || '';
      const name = typeof m === 'string' ? m : m.name || m.id || '';
      return { id, name };
    }).filter(m => m.id);

    return {
      id: p.id,
      name: p.name || p.id,
      status: Boolean(p.status),
      byok_enabled: p.byok_enabled ?? true,
      priority: p.priority ?? 0,
      base_url: p.base_url,
      api_format: p.api_format || 'openai',
      keys_count: keys.length,
      has_valid_key: keys.length > 0,
      models_count: models.length,
      models,
      last_test: healthCache.get(p.id),
    };
  });
}

/**
 * Helper to build an AI instance for testing
 */
function createTestInstance(apiFormat: string, apiKey: string, baseURL?: string, customHeaders?: Record<string, string>, modelId?: string) {
  const headers = customHeaders || {};
  const base = baseURL || undefined;
  const m = modelId || 'gpt-4o';

  switch (apiFormat) {
    case 'anthropic':
      return createAnthropic({ apiKey, baseURL: base, headers })(m);
    case 'google':
      return createGoogleGenerativeAI({ apiKey, baseURL: base, headers })(m);
    case 'cohere':
      return createCohere({ apiKey, baseURL: base, headers })(m);
    default:
      return createOpenAI({ apiKey, baseURL: base, headers })(m);
  }
}

/**
 * Tests connection to a single provider by sending a minimal 1-token test prompt
 */
export async function testProviderHealth(providerId: string): Promise<{
  ok: boolean;
  latencyMs?: number;
  error?: string;
  modelTested?: string;
}> {
  const rows = await db<any[]>`
    SELECT id, name, status, key, priority, base_url, api_format, models, headers
    FROM admin_providers
    WHERE id = ${providerId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return { ok: false, error: `Provider with id '${providerId}' not found.` };
  }

  const p = rows[0];
  const keys = getActiveKeys(p.key);
  if (keys.length === 0) {
    const res = { ok: false, error: 'No active or valid API keys configured.' };
    healthCache.set(p.id, { ...res, testedAt: new Date().toISOString() });
    return res;
  }

  const rawModels: any[] = Array.isArray(p.models) ? p.models : [];
  if (rawModels.length === 0) {
    const res = { ok: false, error: 'No models configured for this provider in admin catalog.' };
    healthCache.set(p.id, { ...res, testedAt: new Date().toISOString() });
    return res;
  }

  const firstModel = rawModels[0];
  const testModelId =
    typeof firstModel === 'string'
      ? firstModel
      : firstModel.originalId || firstModel.id || firstModel.name || '';

  const apiKey = keys[0];
  const baseURL = p.base_url || undefined;
  const customHeaders: Record<string, string> =
    p.headers && typeof p.headers === 'object' && !Array.isArray(p.headers)
      ? (p.headers as Record<string, string>)
      : {};

  const start = Date.now();
  try {
    const instance = createTestInstance(p.api_format, apiKey, baseURL, customHeaders, testModelId);

    // Ping request with strict 1-token output limit
    await generateText({
      model: instance,
      messages: [{ role: 'user', content: 'ping' }],
      maxOutputTokens: 1,
    });

    const latencyMs = Date.now() - start;
    const result = { ok: true, latencyMs, modelTested: testModelId };
    healthCache.set(p.id, { ...result, testedAt: new Date().toISOString() });
    return result;
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const errMsg = err?.message || String(err);
    const result = {
      ok: false,
      latencyMs,
      error: errMsg.length > 200 ? errMsg.slice(0, 200) + '...' : errMsg,
      modelTested: testModelId,
    };
    healthCache.set(p.id, { ...result, testedAt: new Date().toISOString() });
    return result;
  }
}

/**
 * Tests ANY raw API key directly against a provider before saving to database!
 */
export async function testCustomRawKey(params: {
  providerId?: string;
  apiKey: string;
  apiFormat?: string;
  baseURL?: string;
  modelId?: string;
}): Promise<{ ok: boolean; latencyMs?: number; error?: string; modelTested?: string; providerName?: string }> {
  let format = params.apiFormat || 'openai';
  let baseURL = params.baseURL;
  let modelId = params.modelId;
  let providerName = 'Custom';

  if (params.providerId) {
    const rows = await db<any[]>`
      SELECT id, name, api_format, base_url, models FROM admin_providers WHERE id = ${params.providerId} LIMIT 1
    `;
    if (rows.length > 0) {
      const p = rows[0];
      providerName = p.name;
      if (!params.apiFormat) format = p.api_format || 'openai';
      if (!baseURL) baseURL = p.base_url || undefined;
      if (!modelId && Array.isArray(p.models) && p.models.length > 0) {
        const first = p.models[0];
        modelId = typeof first === 'string' ? first : first.originalId || first.id || first.name;
      }
    }
  }

  if (!modelId) {
    modelId = format === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o';
  }

  const start = Date.now();
  try {
    const instance = createTestInstance(format, params.apiKey.trim(), baseURL, {}, modelId);
    await generateText({
      model: instance,
      messages: [{ role: 'user', content: 'ping' }],
      maxOutputTokens: 1,
    });
    return {
      ok: true,
      latencyMs: Date.now() - start,
      modelTested: modelId,
      providerName,
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: errMsg.length > 250 ? errMsg.slice(0, 250) + '...' : errMsg,
      modelTested: modelId,
      providerName,
    };
  }
}

/**
 * Tests all active providers concurrently
 */
export async function testAllActiveProviders(): Promise<Record<string, any>> {
  const providers = await getProvidersDiagnosticList();
  const activeProviders = providers.filter(p => p.status && p.has_valid_key && p.models_count > 0);

  const results: Record<string, any> = {};

  await Promise.all(
    activeProviders.map(async (p) => {
      results[p.id] = await testProviderHealth(p.id);
    })
  );

  return results;
}
