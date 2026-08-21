import { db, genId } from './db.ts';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

// Never fall back to a hardcoded secret: if JWT_SECRET is unset, fail loudly at
// startup so a deploy without a secret can't mint forgeable admin tokens.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET env var is required (min 32 chars). Refusing to start with a default/insecure secret.');
  process.exit(1);
}

// Token lifetimes (ms).
const USER_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const ADMIN_TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

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

export async function signToken(payload: { sub: string; email: string }, role?: 'admin'): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const ttl = role === 'admin' ? ADMIN_TOKEN_TTL : USER_TOKEN_TTL;
  const body = b64url(JSON.stringify({ ...payload, role, iat: Date.now(), exp: Date.now() + ttl }));
  const sig = await sign(`${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

export async function verifyToken(token: string): Promise<{ sub: string; email: string; role?: string } | null> {
  try {
    const [header, body, sig] = token.split('.');
    const expected = await sign(`${header}.${body}`);
    if (expected !== sig) return null;
    const json = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    if (json.sub === undefined) return null;
    // Reject expired tokens.
    if (typeof json.exp === 'number' && json.exp < Date.now()) return null;
    return { sub: json.sub, email: json.email, role: json.role };
  } catch {
    return null;
  }
}

// ─── Password hashing ─────────────────────────────────────────────────────
// User passwords were historically stored with a fast, reversible FNV hash
// (the `hashPassword` below). That is NOT safe — it leaks password length and a
// 32-bit checksum, so a leaked DB is trivially cracked. All NEW passwords and
// resets now use PBKDF2-HMAC-SHA256 with a per-user salt. `verifyPassword`
// still accepts the legacy format so existing accounts keep working, and
// callers rehash to the strong format on next successful login.
const PBKDF2_ITER = 100_000;

export function hashPassword(password: string): string {
  // Legacy FNV — KEPT ONLY to verify old hashes during migration. Do not use
  // for storing new passwords.
  let h = 2166136261;
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0') + '-' + password.length;
}

export function hashPasswordStrong(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITER, 32, 'sha256').toString('hex');
  return `pbkdf2$sha256$${PBKDF2_ITER}$${salt}$${hash}`;
}

export function isLegacyPasswordHash(stored: string): boolean {
  return !stored.startsWith('pbkdf2$');
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith('pbkdf2$')) {
    const parts = stored.split('$');
    const iter = Number(parts[2]);
    const salt = parts[3];
    const expected = parts[4];
    const candidate = pbkdf2Sync(password, salt, iter, 32, 'sha256').toString('hex');
    const a = Buffer.from(candidate, 'hex');
    const b = Buffer.from(expected, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }
  // Legacy FNV comparison.
  return hashPassword(password) === stored;
}

export async function setUserPassword(userId: string, password: string): Promise<void> {
  await db`UPDATE users SET password_hash = ${hashPasswordStrong(password)}, password_changed_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
}

export async function getUserById(id: string) {
  const result = await db`SELECT id, name, email, plan, created_at, profile_picture, status, last_login, last_ip, user_agent, hardware_info, plan_cli, plan_api, plan_chat, plan_agents, plan_cli_start, plan_cli_expiry, plan_api_start, plan_api_expiry, plan_chat_start, plan_chat_expiry, plan_agents_start, plan_agents_expiry, is_student, experience_level, use_cases, earning_goal, onboarding_completed, balance, password_changed_at FROM users WHERE id = ${id}`;
  return result[0] as any;
}

export async function getUserByEmail(email: string) {
  const result = await db`SELECT * FROM users WHERE email = ${email}`;
  return result[0] as
    | { id: string; name: string; email: string; password_hash: string; plan: string }
    | undefined;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  last_ip?: string,
  user_agent?: string,
  hardware_info?: string,
  referred_by?: string
) {
  const id = genId('usr');
  await db`
    INSERT INTO users (id, name, email, password_hash, last_ip, user_agent, hardware_info, referred_by)
    VALUES (${id}, ${name}, ${email}, ${hashPasswordStrong(password)}, ${last_ip ?? null}, ${user_agent ?? null}, ${hardware_info ?? null}, ${referred_by ?? null})
  `;
  return { id, name, email, plan: 'free' };
}

export async function updateUserLoginInfo(
  id: string,
  last_ip?: string,
  user_agent?: string,
  hardware_info?: string
) {
  await db`
    UPDATE users 
    SET 
      last_ip = COALESCE(${last_ip ?? null}, last_ip),
      user_agent = COALESCE(${user_agent ?? null}, user_agent),
      hardware_info = COALESCE(${hardware_info ?? null}, hardware_info),
      last_login = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
}

function detectOs(hwInfo: any, userAgent?: string): string {
  if (hwInfo) {
    try {
      const parsed = typeof hwInfo === 'string' ? JSON.parse(hwInfo) : hwInfo;
      if (parsed?.os && parsed.os !== 'Unknown') return parsed.os;
    } catch {}
  }
  const ua = userAgent || '';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS|Macintosh/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}

function mapUserRows(result: any[], callCounts: { user_id: string; count: number }[]) {
  const callMap = new Map(callCounts.map(r => [r.user_id, Number(r.count)]));
  return result.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    plan: row.plan || 'Free',
    balance: Number(row.balance ?? 0),
    plan_cli: row.plan_cli || 'Free',
    plan_api: row.plan_api || 'Free',
    plan_chat: row.plan_chat || 'Free',
    plan_agents: row.plan_agents || 'Free',
    plan_cli_start: row.plan_cli_start ? new Date(row.plan_cli_start).toISOString() : null,
    plan_cli_expiry: row.plan_cli_expiry ? new Date(row.plan_cli_expiry).toISOString() : null,
    plan_api_start: row.plan_api_start ? new Date(row.plan_api_start).toISOString() : null,
    plan_api_expiry: row.plan_api_expiry ? new Date(row.plan_api_expiry).toISOString() : null,
    plan_chat_start: row.plan_chat_start ? new Date(row.plan_chat_start).toISOString() : null,
    plan_chat_expiry: row.plan_chat_expiry ? new Date(row.plan_chat_expiry).toISOString() : null,
    plan_agents_start: row.plan_agents_start ? new Date(row.plan_agents_start).toISOString() : null,
    plan_agents_expiry: row.plan_agents_expiry ? new Date(row.plan_agents_expiry).toISOString() : null,
    created_at: new Date(row.created_at).toISOString(),
    joined: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    password_changed_at: row.password_changed_at ? new Date(row.password_changed_at).toISOString() : null,
    last_login: row.last_login ? new Date(row.last_login).toISOString() : null,
    last_ip: row.last_ip ?? null,
    os: detectOs(row.hardware_info, row.user_agent),
    calls: callMap.get(row.id) ?? 0,
    status: row.status || 'Active',
    profile_picture: row.profile_picture,
    is_student: row.is_student ?? false,
    experience_level: row.experience_level ?? null,
    use_cases: row.use_cases ?? null,
    earning_goal: row.earning_goal ?? null,
    onboarding_completed: row.onboarding_completed ?? false
  }));
}

const USER_SELECT = db`id, name, email, plan, created_at, profile_picture, status, last_login, last_ip, user_agent, hardware_info, plan_cli, plan_api, plan_chat, plan_agents, plan_cli_start, plan_cli_expiry, plan_api_start, plan_api_expiry, plan_chat_start, plan_chat_expiry, plan_agents_start, plan_agents_expiry, is_student, experience_level, use_cases, earning_goal, onboarding_completed, balance, password_changed_at`;

export async function getAllUsers(limit?: number, offset?: number) {
  const totalRes = await db`SELECT COUNT(*) AS c FROM users` as { c: number }[];
  const result = await db`SELECT ${USER_SELECT} FROM users ORDER BY created_at DESC ${limit && limit > 0 ? db`LIMIT ${limit} OFFSET ${offset ?? 0}` : db``}`;
  const callCounts = await db`SELECT user_id, COUNT(*) AS count FROM usage GROUP BY user_id` as { user_id: string; count: number }[];
  return {
    users: mapUserRows(result, callCounts),
    total: Number(totalRes[0]?.c ?? 0),
    limit: limit ?? null,
    offset: offset ?? 0,
  };
}

// Admin user list with optional registration-date filtering (30/60/90 day
// windows or a custom start/end date) plus signup stats for the header cards.
export async function getFilteredUsers(opts: { filterDays?: number; startDate?: string; endDate?: string; limit?: number; offset?: number }) {
  const { filterDays, startDate, endDate } = opts;
  let where = db``;
  if (filterDays && filterDays > 0) {
    where = db`WHERE created_at >= NOW() - INTERVAL '1 day' * ${filterDays}`;
  } else if (startDate || endDate) {
    const parts: any[] = [];
    if (startDate) parts.push(db`created_at >= ${startDate}::date`);
    if (endDate) parts.push(db`created_at < (${endDate}::date + 1)`);
    where = parts.length === 2 ? db`WHERE ${parts[0]} AND ${parts[1]}` : db`WHERE ${parts[0]}`;
  }

  const totalRes = await db`SELECT COUNT(*) AS c FROM users` as { c: number }[];
  const todayRes = await db`SELECT COUNT(*) AS c FROM users WHERE created_at >= CURRENT_DATE` as { c: number }[];
  const weekRes = await db`SELECT COUNT(*) AS c FROM users WHERE created_at >= NOW() - INTERVAL '7 days'` as { c: number }[];
  const monthRes = await db`SELECT COUNT(*) AS c FROM users WHERE created_at >= NOW() - INTERVAL '30 days'` as { c: number }[];
  const filteredRes = await db`SELECT COUNT(*) AS c FROM users ${where}` as { c: number }[];

  const result = await db`
    SELECT ${USER_SELECT} FROM users ${where}
    ORDER BY created_at DESC
    ${opts.limit && opts.limit > 0 ? db`LIMIT ${opts.limit} OFFSET ${opts.offset ?? 0}` : db``}
  `;
  const callCounts = await db`SELECT user_id, COUNT(*) AS count FROM usage GROUP BY user_id` as { user_id: string; count: number }[];

  return {
    users: mapUserRows(result, callCounts),
    stats: {
      total: Number(totalRes[0]?.c ?? 0),
      today: Number(todayRes[0]?.c ?? 0),
      last7Days: Number(weekRes[0]?.c ?? 0),
      last30Days: Number(monthRes[0]?.c ?? 0),
      filteredCount: Number(filteredRes[0]?.c ?? 0),
    },
    limit: opts.limit ?? null,
    offset: opts.offset ?? 0,
  };
}

export async function updateUserProfile(id: string, name: string, profile_picture?: string) {
  if (profile_picture !== undefined) {
    await db`UPDATE users SET name = ${name}, profile_picture = ${profile_picture} WHERE id = ${id}`;
  } else {
    await db`UPDATE users SET name = ${name} WHERE id = ${id}`;
  }
}

export async function changeUserPassword(id: string, newPassword: string) {
  await db`
    UPDATE users SET password_hash = ${hashPasswordStrong(newPassword)}, password_changed_at = CURRENT_TIMESTAMP WHERE id = ${id}
  `;
}

export async function deleteUser(id: string) {
  await db`DELETE FROM users WHERE id = ${id}`;
}

export async function getPasswordHash(id: string): Promise<string | null> {
  const result = await db`SELECT password_hash FROM users WHERE id = ${id}`;
  return (result[0]?.password_hash as string) ?? null;
}

export async function saveOnboarding(id: string, data: {
  isStudent: boolean;
  experienceLevel: string;
  useCases: string[];
  earningGoal: string;
}) {
  const useCasesJoined = Array.isArray(data.useCases) ? data.useCases.join(',') : null;
  await db`
    UPDATE users SET
      is_student = ${data.isStudent ?? false},
      experience_level = ${data.experienceLevel ?? null},
      use_cases = ${useCasesJoined},
      earning_goal = ${data.earningGoal ?? null},
      onboarding_completed = TRUE
    WHERE id = ${id}
  `;
}

// Fields an admin may write directly. Used by both single-user update and
// bulk edit so neither can sneak in arbitrary columns.
export const ADMIN_USER_FIELDS = [
  'name', 'email', 'plan', 'status', 'profile_picture',
  'plan_cli', 'plan_api', 'plan_chat', 'plan_agents',
  'plan_cli_start', 'plan_cli_expiry',
  'plan_api_start', 'plan_api_expiry',
  'plan_chat_start', 'plan_chat_expiry',
  'plan_agents_start', 'plan_agents_expiry',
  'created_at', 'last_login',
  'is_student', 'experience_level', 'use_cases', 'earning_goal', 'onboarding_completed',
  'balance'
] as const;

export async function adminUpdateUser(id: string, data: any) {
  const allowedFields = ADMIN_USER_FIELDS;
  const updates = Object.keys(data).filter(k => allowedFields.includes(k) && data[k] !== undefined);
  if (updates.length === 0) return;

  // Email must stay unique.
  if (data.email !== undefined) {
    const clash = await db`SELECT id FROM users WHERE email = ${data.email} AND id != ${id} LIMIT 1` as { id: string }[];
    if (clash[0]) throw new Error('Email already in use by another user');
  }

  // Apply all field updates atomically so a mid-loop failure can't leave the
  // user in a half-updated state.
  await db.begin(async (tx) => {
    for (const field of updates) {
      await tx`UPDATE users SET ${tx(field)} = ${data[field]} WHERE id = ${id}`;
    }
  });
}

export async function adminDeleteUser(id: string) {
  await db`DELETE FROM users WHERE id = ${id}`;
}
