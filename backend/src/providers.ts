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

export function listProviders(userId: string) {
  const rows = db
    .query('SELECT id, provider, masked_key AS masked, status, created_at AS added FROM providers WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as { id: string; provider: string; masked: string; status: string; added: string }[];
  return rows.map((r) => ({ ...r, ...providerMeta(r.provider) }));
}

export function upsertProvider(userId: string, provider: string, maskedKey: string) {
  const existing = db.query('SELECT id FROM providers WHERE user_id = ? AND provider = ?').get(userId, provider) as { id: string } | undefined;
  if (existing) {
    db.query('UPDATE providers SET masked_key = ?, status = ? WHERE id = ?').run(maskedKey, 'active', existing.id);
    return;
  }
  db.query('INSERT INTO providers (id, user_id, provider, masked_key) VALUES (?, ?, ?, ?)').run(genId('prv'), userId, provider, maskedKey);
}

export function setProviderStatus(userId: string, id: string, status: string) {
  db.query('UPDATE providers SET status = ? WHERE id = ? AND user_id = ?').run(status, id, userId);
}

export function deleteProvider(userId: string, id: string) {
  db.query('DELETE FROM providers WHERE id = ? AND user_id = ?').run(id, userId);
}
