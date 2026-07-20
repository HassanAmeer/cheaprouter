import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Default credentials specified by the user
    if (username === 'admin' && password === '1234') {
      // In a real app, use JWT. For this mock, a simple token string.
      const token = `admin_token_${Date.now()}`;
      return NextResponse.json({ token, user: { role: 'admin' } });
    }

    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
