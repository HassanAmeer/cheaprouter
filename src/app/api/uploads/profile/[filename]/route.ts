import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'cheap_user_dashboard');

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    // Containment check: reject any path that escapes the upload dir
    // (e.g. encoded ../ traversal like %2e%2e%2f).
    const resolved = path.resolve(UPLOAD_DIR, filename);
    if (!resolved.startsWith(UPLOAD_DIR + path.sep)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const filepath = resolved;

    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.gif' ? 'image/gif' : 'image/jpeg';

    const fileBuffer = fs.readFileSync(filepath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Failed to serve file' }, { status: 500 });
  }
}
