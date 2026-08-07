import { db, genId } from './db.ts';

function hashKey(key: string): string {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

export function generateApiKey(): { full: string; prefix: string; hash: string } {
  const rand = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).slice(2, 10);
  const full = `cm_live_${rand}`;
  return { full, prefix: full.slice(0, 16), hash: hashKey(full) };
}

export async function listKeys(userId: string) {
  return await db`SELECT id, name, key_prefix AS secret, created_at AS created, last_used AS "lastUsed" FROM api_keys WHERE user_id = ${userId} ORDER BY created_at DESC` as { id: string; name: string; secret: string; created: string; lastUsed: string | null }[];
}

export async function createKey(userId: string, name: string) {
  const { full, prefix, hash } = generateApiKey();
  const id = genId('key');
  await db`INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash) VALUES (${id}, ${userId}, ${name}, ${prefix}, ${hash})`;
  return { id, name, secret: full, created: new Date().toISOString().slice(0, 10), lastUsed: 'Never' };
}

export async function deleteKey(userId: string, id: string) {
  await db`DELETE FROM api_keys WHERE id = ${id} AND user_id = ${userId}`;
}
