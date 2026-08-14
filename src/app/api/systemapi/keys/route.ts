import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = request.headers.get('Authorization') || '';

    const response = await fetch(`${backendUrl}/api/systemapi/keys`, {
      method: 'GET',
      headers: { 'Authorization': authHeader }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error: any) {
    console.error('Error fetching system keys from backend:', error);
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = request.headers.get('Authorization') || '';
    const body = await request.json();

    const response = await fetch(`${backendUrl}/api/systemapi/keys`, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error: any) {
    console.error('Error storing system key:', error);
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}
