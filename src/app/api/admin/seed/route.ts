import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const body = await req.json();
    const adminToken = req.headers.get('Authorization') || '';

    const response = await fetch(`${backendUrl}/api/admin/seed`, {
      method: 'POST',
      headers: { 'Authorization': adminToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const adminToken = req.headers.get('Authorization') || '';

    const response = await fetch(`${backendUrl}/api/admin/seed`, {
      method: 'DELETE',
      headers: { 'Authorization': adminToken },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 500 });
  }
}
