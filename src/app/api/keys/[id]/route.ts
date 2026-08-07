import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';
    
    const response = await fetch(`${backendUrl}/api/keys/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': authHeader }
    });
    
    if (!response.ok) return NextResponse.json({ error: 'Failed' }, { status: response.status });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
