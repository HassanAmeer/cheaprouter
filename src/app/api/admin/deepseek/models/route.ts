import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const url = new URL(req.url);
    const key = url.searchParams.get('key') || '';
    const response = await fetch(`${backendUrl}/api/admin/deepseek/models${key ? '?key=' + encodeURIComponent(key) : ''}`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) return NextResponse.json({ data: [] }, { status: response.status });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
