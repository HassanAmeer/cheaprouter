import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/admin/aihorde`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({}, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/admin/aihorde`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(body)
    });
    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update aihorde config' }, { status: 500 });
  }
}
