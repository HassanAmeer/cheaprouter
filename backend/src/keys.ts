import { db, genId } from './db.ts';

export async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function generateApiKey(): Promise<{ full: string; prefix: string; hash: string }> {
  const rand = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).slice(2, 12);
  const full = `sk-${rand}`;
  return { full, prefix: full.slice(0, 16), hash: await hashKey(full) };
}

export async function listKeys(userId: string) {
  const rows = await db`SELECT id, name, key_prefix AS prefix, created_at AS created, last_used AS "lastUsed", source FROM api_keys WHERE user_id = ${userId} ORDER BY created_at DESC` as { id: string; name: string; prefix: string; created: string; lastUsed: string | null; source: string }[];
  return rows.map(k => ({
    id: k.id,
    name: k.name,
    secret: maskSecret(k.prefix),
    created: k.created,
    lastUsed: k.lastUsed,
    source: k.source,
  }));
}

// Only a masked display value — the full key is never recoverable after creation.
function maskSecret(prefix: string): string {
  const tail = prefix.length > 6 ? prefix.slice(-4) : prefix;
  return `sk-••••••••••${tail}`;
}

export async function createKey(userId: string, name: string, source: string = 'api') {
  const { full, prefix, hash } = await generateApiKey();
  const id = genId('key');
  await db`INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, source) VALUES (${id}, ${userId}, ${name}, ${prefix}, ${hash}, ${source})`;
  return { id, name, secret: full, created: new Date().toISOString().slice(0, 10), lastUsed: 'Never', source };
}

export async function deleteKey(userId: string, id: string) {
  await db`DELETE FROM api_keys WHERE id = ${id} AND user_id = ${userId}`;
}

export async function listAllKeysWithUsers() {
  return await db`
    SELECT
      k.id, k.name, k.key_prefix AS prefix, k.created_at AS created, k.last_used AS "lastUsed",
      u.id AS "userId", u.name AS "userName", u.email AS "userEmail",
      COALESCE(u.plan, 'free') AS plan,
      COALESCE(u.plan_api, 'Free') AS "planApi",
      COALESCE(u.balance, 0) AS balance
    FROM api_keys k
    JOIN users u ON u.id = k.user_id
    ORDER BY k.created_at DESC
  `;
}

export async function adminDeleteKey(id: string) {
  await db`DELETE FROM api_keys WHERE id = ${id}`;
}

// ── System API: store a key (admin-only) ──
export async function storeSystemKey(name: string, description?: string) {
  const { full, prefix, hash } = await generateApiKey();
  const id = genId('key');
  await db`
    INSERT INTO system_keys (id, name, key_prefix, key_hash, description)
    VALUES (${id}, ${name}, ${prefix}, ${hash}, ${description ?? ''})
  `;
  return { id, name, secret: full, prefix, created: new Date().toISOString().slice(0, 10), lastUsed: 'Never' };
}

export async function listSystemKeys() {
  return await db`SELECT id, name, key_prefix AS prefix, description, created_at AS created, last_used AS "lastUsed" FROM system_keys ORDER BY created_at DESC`;
}

export async function deleteSystemKey(id: string) {
  await db`DELETE FROM system_keys WHERE id = ${id}`;
}
