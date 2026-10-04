import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(req, `/api/conversations/${id}/messages`);
}

async function proxy(req: NextRequest, path: string) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('Authorization') || '';
    const response = await fetch(`${backendUrl}${path}`, {
      method: req.method,
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(req.method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      body: req.method === 'POST' ? await req.text() : undefined,
    });

    if (!response.ok) return NextResponse.json({ error: 'Backend error' }, { status: response.status });
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}
