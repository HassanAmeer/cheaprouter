import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';
    
    const response = await fetch(`${backendUrl}/api/stream?${url.searchParams.toString()}`, {
      headers: { 'Authorization': authHeader }
    });
    
    if (!response.ok) return NextResponse.json({ error: 'Stream failed' }, { status: response.status });
    
    // We can just return the stream directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
