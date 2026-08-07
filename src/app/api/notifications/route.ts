import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('Authorization') || '';
    
    // Admin uses /api/admin/notifications? Maybe not needed for GET since they just post.
    // User uses /api/notifications
    
    const response = await fetch(`${backendUrl}/api/notifications`, {
      method: 'GET',
      headers: { 'Authorization': authHeader }
    });

    if (!response.ok) return NextResponse.json({ error: 'Backend error' }, { status: response.status });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('Authorization') || '';
    const body = await req.json();

    // The frontend sends { title, message, targetUserIds: [...] }
    const response = await fetch(`${backendUrl}/api/admin/notifications`, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) return NextResponse.json({ error: 'Backend error' }, { status: response.status });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('Authorization') || '';
    const body = await req.json();
    
    const response = await fetch(`${backendUrl}/api/notifications`, {
      method: 'PUT',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) return NextResponse.json({ error: 'Backend error' }, { status: response.status });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
