import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    let user = db.getUserByEmail(email);
    if (user) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    user = db.createUser(email, password, name);
    // Simple mock token
    const token = `token_${user.id}`;
    
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
