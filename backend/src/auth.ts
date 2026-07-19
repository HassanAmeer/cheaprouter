import { db, genId } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-cheapmodels-secret-change-me';

function b64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  const bin = atob(input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return b64url(sig);
}

export async function signToken(payload: { sub: string; email: string }): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = await sign(`${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

export async function verifyToken(token: string): Promise<{ sub: string; email: string } | null> {
  try {
    const [header, body, sig] = token.split('.');
    const expected = await sign(`${header}.${body}`);
    if (expected !== sig) return null;
    const json = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    return { sub: json.sub, email: json.email };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  // Deterministic hash for dev use. Swap for bcrypt/argon2 in production.
  let h = 2166136261;
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0') + '-' + password.length;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function getUserById(id: string) {
  return db.query('SELECT id, name, email, plan, created_at FROM users WHERE id = ?').get(id) as
    | { id: string; name: string; email: string; plan: string; created_at: string }
    | undefined;
}

export function getUserByEmail(email: string) {
  return db.query('SELECT * FROM users WHERE email = ?').get(email) as
    | { id: string; name: string; email: string; password_hash: string; plan: string }
    | undefined;
}

export function createUser(name: string, email: string, password: string) {
  const id = genId('usr');
  db.query('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(id, name, email, hashPassword(password));
  return { id, name, email, plan: 'free' };
}
