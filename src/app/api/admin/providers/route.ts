import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json({ providers: db.listAdminProviders() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin providers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = db.saveAdminProviders(body);
    return NextResponse.json({ providers: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update admin providers' }, { status: 500 });
  }
}
