import crypto from "crypto";
import { cookies } from "next/headers";

export type Session = {
  id: string;
  username: string;
  role: string;
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string): boolean {
  const [algorithm, salt, hash] = storedPassword.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const expected = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return expected.length === stored.length && crypto.timingSafeEqual(expected, stored);
}

function sessionSecret(): string {
  if (!process.env.SESSION_SECRET) {
    return "cheapchat-development-session-secret";
  }
  return process.env.SESSION_SECRET;
}

export function signSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionCookie(value: string | undefined): Session | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest();
  const provided = Buffer.from(signature, "base64url");
  const isValid =
    expected.length === provided.length &&
    crypto.timingSafeEqual(expected, provided);
  if (!isValid) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof session?.id === "string") return session;
    return null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const session = verifySessionCookie(cookieStore.get("user_session")?.value);
  if (!session) return null;
  // validate user exists and not banned
  const { db } = await import("@cheapchats/backend/db");
  const { users } = await import("@cheapchats/backend/db/schema");
  const { eq } = await import("drizzle-orm");
  const user = db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user || user.status === "BANNED") return null;
  return session;
}

export async function requireAdmin(): Promise<Session | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}
