import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = request.headers.get('Authorization') || '';
    const sessionIdHeader = request.headers.get('x-session-id') || '';
    const body = await request.json();

    const response = await fetch(`${backendUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...(sessionIdHeader ? { 'x-session-id': sessionIdHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        { error: { message: `Backend returned non-JSON response: ${text.slice(0, 200)}` } },
        { status: response.ok ? 200 : 500 }
      );
    }

    return NextResponse.json(data, { status: response.ok ? 200 : (response.status || 500) });
  } catch (error: any) {
    console.error('Error proxying chat completions:', error);
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}