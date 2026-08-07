import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Proxy the request to the Bun backend running on port 4000
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = request.headers.get('Authorization') || '';
    
    const response = await fetch(`${backendUrl}/api/admin/system`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching system logs from backend:', error);
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = request.headers.get('Authorization') || '';
    const body = await request.json();
    
    const response = await fetch(`${backendUrl}/api/admin/system/logs`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting logs:', error);
    return NextResponse.json({ error: 'Failed to delete logs' }, { status: 500 });
  }
}
