import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'cheap_user_dashboard');

export const dynamic = 'force-dynamic';

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Verify the JWT signature using the same secret/algorithm as the backend so
// only authenticated (user or admin) callers can upload. Avoids pulling the
// backend's DB-coupled auth module into the Next.js route.
async function verifyAuth(token: string): Promise<boolean> {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [header, body, sig] = parts;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${header}.${body}`);
  const expected = hmac.digest('base64url');
  // Constant-time-ish compare.
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (mismatch !== 0) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof payload.exp === 'number' && payload.exp < Date.now()) return false;
  } catch {
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer /, '');
    if (!(await verifyAuth(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    ensureUploadDir();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP, GIF allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);

    // Validate actual file content via magic bytes, not just the declared MIME type.
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isGif = buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46;
    const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
    let ext = 'jpg';
    if (isJpeg) ext = 'jpg';
    else if (isPng) ext = 'png';
    else if (isGif) ext = 'gif';
    else if (isWebp) ext = 'webp';
    else return NextResponse.json({ error: 'File content is not a valid image' }, { status: 400 });

    const maxSize = 5 * 1024 * 1024;
    if (buf.length > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 5MB allowed.' }, { status: 400 });
    }

    const filename = `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, buf);

    const publicUrl = `/api/uploads/profile/${filename}`;
    return NextResponse.json({ url: publicUrl, filename });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Upload failed' }, { status: 500 });
  }
}
