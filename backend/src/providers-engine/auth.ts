// ---------------------------------------------------------------------------
// Auth — validates Bearer tokens against api_keys, system_keys, or dev master key.
// Results are cached for 30 s to avoid a DB round-trip per request.
// ---------------------------------------------------------------------------

import { db } from './db.ts';
import { authCache } from './cache.ts';

/** SHA-256 hash of the raw key (same algorithm as cheaprouter/src/keys.ts) */
export async function hashKey(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns the user_id for a valid bearer token, or null if the key is unknown.
 * Checks:
 * 1. Optional Dev Master Key (sk-engine-dev-key)
 * 2. User API keys (api_keys table)
 * 3. System Admin keys (system_keys table)
 */
export async function validateBearer(token: string): Promise<string | null> {
  if (!token) return null;

  // 1. Built-in Dev Master Key for instant testing & development
  const masterKey = process.env.MASTER_KEY || 'sk-engine-dev-key';
  if (token === masterKey) {
    return 'dev_master_user';
  }

  // 2. Cache lookup
  const cached = authCache.get(token);
  if (cached !== undefined) return cached;

  const hash = await hashKey(token);

  // 3. User API keys table check
  const rows = await db<{ user_id: string }[]>`
    SELECT user_id FROM api_keys WHERE key_hash = ${hash} LIMIT 1
  `;
  if (rows.length > 0) {
    const userId = rows[0].user_id;
    authCache.set(token, userId, 30_000);
    db`UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key_hash = ${hash}`.catch(() => {});
    return userId;
  }

  // 4. System Admin keys table check
  const sysRows = await db<{ id: string }[]>`
    SELECT id FROM system_keys WHERE key_hash = ${hash} LIMIT 1
  `;
  if (sysRows.length > 0) {
    authCache.set(token, 'system_admin', 30_000);
    db`UPDATE system_keys SET last_used = CURRENT_TIMESTAMP WHERE key_hash = ${hash}`.catch(() => {});
    return 'system_admin';
  }

  authCache.set(token, null, 30_000);
  return null;
}

/**
 * Extract the bearer token from the Authorization header or x-api-key.
 */
export function extractToken(headers: Headers): string | null {
  const auth = headers.get('authorization') ?? '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();

  // Anthropic SDK sends x-api-key instead of Bearer
  const xKey = headers.get('x-api-key') ?? '';
  if (xKey) return xKey.trim();

  return null;
}
