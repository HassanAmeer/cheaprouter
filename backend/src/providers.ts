import { db, genId } from './db.ts';

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
