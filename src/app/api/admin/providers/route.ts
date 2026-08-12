import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/admin/providers`, {
      headers: { 'Authorization': authHeader },
      cache: 'no-store'
    });
    if (!response.ok) return NextResponse.json([], { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/admin/providers`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend returned an error:', response.status, errorText);
      require('fs').appendFileSync('backend_error.log', `Status: ${response.status} Body: ${errorText}\n`);
      return NextResponse.json({ error: 'Failed', details: errorText }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update providers' }, { status: 500 });
  }
}

