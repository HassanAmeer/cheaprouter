import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json();

    const response = await fetch(`${backendUrl}/api/admin/users/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(body)
    });

    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply bulk update' }, { status: 500 });
  }
}