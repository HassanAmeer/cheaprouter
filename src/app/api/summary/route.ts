import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const authHeader = req.headers.get('authorization') || '';

    const response = await fetch(`${backendUrl}/api/summary`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({}, { status: response.status });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}