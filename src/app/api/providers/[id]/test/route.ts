import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';

    const response = await fetch(`${backendUrl}/api/providers/${id}/test`, {
      method: 'POST',
      headers: { Authorization: authHeader },
    });

    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
