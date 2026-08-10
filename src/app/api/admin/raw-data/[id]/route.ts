import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('Authorization') || '';
    const body = await request.json();
    const response = await fetch(`${backendUrl}/api/admin/raw-data/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('Authorization') || '';
    const response = await fetch(`${backendUrl}/api/admin/raw-data/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to communicate with backend' }, { status: 500 });
  }
}
