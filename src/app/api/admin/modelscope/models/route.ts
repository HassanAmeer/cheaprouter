import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const response = await fetch('http://localhost:4000/api/admin/modelscope/models?key=' + key);
    
    if (!response.ok) {
      throw new Error('Backend responded with ' + response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: error.message },
      { status: 500 }
    );
  }
}
