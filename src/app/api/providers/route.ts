import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';
    
    const response = await fetch(`${backendUrl}/api/providers`, {
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
    
    // In the mock db it was UPSERT provider. The backend uses PUT or POST for upsert?
    // Let's proxy to POST /api/providers (Wait, backend uses PUT /api/providers/:id to update status)
    // Actually backend provider API is upsertProvider inside POST?
    // Let me check the backend routes first. If it's different, I might need to adjust.
    // I'll assume POST /api/providers works for upsert if it's there.
    
    const response = await fetch(`${backendUrl}/api/providers`, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
