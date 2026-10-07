// ---------------------------------------------------------------------------
// GET /v1/models  — OpenAI-compatible model list endpoint
// Aggregates models from all active providers.
// ---------------------------------------------------------------------------

import { getActiveProviders } from './providers.ts';

export async function handleGetModels(): Promise<Response> {
  const providers = await getActiveProviders();
  const seen      = new Set<string>();
  const models: any[] = [];

  for (const p of providers) {
    const list: any[] = Array.isArray(p.models) ? p.models : [];
    for (const m of list) {
      const id =
        typeof m === 'string'
          ? m
          : m.id || m.originalId || m.name || '';
      if (!id || seen.has(id)) continue;
      seen.add(id);

      models.push({
        id,
        object:   'model',
        created:  Math.floor(Date.now() / 1000),
        owned_by: p.name || p.id,
      });
    }
  }

  return Response.json({
    object: 'list',
    data:   models,
  });
}
