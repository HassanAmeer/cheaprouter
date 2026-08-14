import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = request.headers.get('Authorization') || '';

    const response = await fetch(`${backendUrl}/api/admin/keys`, {
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
    console.error('Error fetching admin keys from backend:', error);
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}
