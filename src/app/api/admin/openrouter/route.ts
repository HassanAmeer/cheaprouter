import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/admin/openrouter`);
    if (!response.ok) return NextResponse.json({}, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/admin/openrouter`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update openrouter config' }, { status: 500 });
  }
}
