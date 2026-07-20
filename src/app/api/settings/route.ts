import { NextResponse } from 'next/server';
import { settingsDb } from '@/lib/settings';

export async function GET() {
  return NextResponse.json(settingsDb.getSettings());
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updatedSettings = settingsDb.updateSettings(body);
    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
