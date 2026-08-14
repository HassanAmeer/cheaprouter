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

export async function verifyToken(token: string): Promise<{ sub: string; email: string; role?: string } | null> {
  try {
    const [header, body, sig] = token.split('.');
    const expected = await sign(`${header}.${body}`);
    if (expected !== sig) return null;
    const json = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    return { sub: json.sub, email: json.email, role: json.role };
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

export async function getUserById(id: string) {
  const result = await db`SELECT id, name, email, plan, created_at, profile_picture, status, last_login, last_ip, user_agent, hardware_info, plan_cli, plan_api, plan_chat, plan_agents, plan_cli_start, plan_cli_expiry, plan_api_start, plan_api_expiry, plan_chat_start, plan_chat_expiry, plan_agents_start, plan_agents_expiry, is_student, experience_level, use_cases, earning_goal, onboarding_completed, balance FROM users WHERE id = ${id}`;
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
  hardware_info?: string
) {
  const id = genId('usr');
  await db`
    INSERT INTO users (id, name, email, password_hash, last_ip, user_agent, hardware_info)
    VALUES (${id}, ${name}, ${email}, ${hashPassword(password)}, ${last_ip ?? null}, ${user_agent ?? null}, ${hardware_info ?? null})
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

export async function getAllUsers() {
  const result = await db`SELECT id, name, email, plan, created_at, profile_picture, status, last_login, last_ip, user_agent, hardware_info, plan_cli, plan_api, plan_chat, plan_agents, plan_cli_start, plan_cli_expiry, plan_api_start, plan_api_expiry, plan_chat_start, plan_chat_expiry, plan_agents_start, plan_agents_expiry, is_student, experience_level, use_cases, earning_goal, onboarding_completed, balance FROM users ORDER BY created_at DESC`;
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
    last_login: row.last_login ? new Date(row.last_login).toISOString() : null,
    last_ip: row.last_ip ?? null,
    os: detectOs(row.hardware_info, row.user_agent),
    calls: 0,
    status: row.status || 'Active',
    profile_picture: row.profile_picture,
    is_student: row.is_student ?? false,
    experience_level: row.experience_level ?? null,
    use_cases: row.use_cases ?? null,
    earning_goal: row.earning_goal ?? null,
    onboarding_completed: row.onboarding_completed ?? false
  }));
}

export async function updateUserProfile(id: string, name: string, profile_picture?: string) {
  if (profile_picture !== undefined) {
    await db`UPDATE users SET name = ${name}, profile_picture = ${profile_picture} WHERE id = ${id}`;
  } else {
    await db`UPDATE users SET name = ${name} WHERE id = ${id}`;
  }
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

export async function adminUpdateUser(id: string, data: any) {
  const allowedFields = [
    'name', 'email', 'plan', 'status', 'profile_picture', 
    'plan_cli', 'plan_api', 'plan_chat', 'plan_agents',
    'plan_cli_start', 'plan_cli_expiry',
    'plan_api_start', 'plan_api_expiry',
    'plan_chat_start', 'plan_chat_expiry',
    'plan_agents_start', 'plan_agents_expiry',
    'created_at', 'last_login',
    'is_student', 'experience_level', 'use_cases', 'earning_goal', 'onboarding_completed',
    'balance'
  ];
  const updates = Object.keys(data).filter(k => allowedFields.includes(k) && data[k] !== undefined);
  if (updates.length === 0) return;

  for (const field of updates) {
    await db`UPDATE users SET ${db(field)} = ${data[field]} WHERE id = ${id}`;
  }
}

export async function adminDeleteUser(id: string) {
  await db`DELETE FROM users WHERE id = ${id}`;
}
