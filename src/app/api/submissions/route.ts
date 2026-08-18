import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';

    const response = await fetch(`${backendUrl}/api/submissions`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({}, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';

    const response = await fetch(`${backendUrl}/api/submissions`, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      return NextResponse.json({ error: err?.error || 'Failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
