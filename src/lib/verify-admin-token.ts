export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET;

function b64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input: string): Uint8Array<ArrayBuffer> {
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  const bin = atob(input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Verify an admin JWT issued by the backend (HS256). Fails closed: no secret
// configured, bad signature, expired, or non-admin role are all rejected.
export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!JWT_SECRET || JWT_SECRET.length < 32) return false;
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return false;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig), new TextEncoder().encode(`${header}.${body}`));
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    if (payload.role !== 'admin') return false;
    if (typeof payload.exp === 'number' && payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}