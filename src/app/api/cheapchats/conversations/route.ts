import { NextResponse } from 'next/server';
import { db } from '../../../../../cheapchats/backend/db';
import { conversations, messages } from '../../../../../cheapchats/backend/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = db
      .select()
      .from(conversations)
      .where(eq(conversations.isIncognito, 0))
      .orderBy(desc(conversations.updatedAt))
      .all();

    return NextResponse.json({ conversations: list, list });
  } catch (error: any) {
    console.error('Failed to list conversations:', error);
    return NextResponse.json({ conversations: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title = 'New Chat', model = 'gpt-4o', provider = 'OpenAI' } = await req.json();
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();

    db.insert(conversations).values({
      id,
      userId: 'guest_user',
      title,
      model,
      provider,
      isPinned: 0,
      isBookmarked: 0,
      isIncognito: 0,
      createdAt: now,
      updatedAt: now,
    }).run();

    return NextResponse.json({ id, title, model, provider });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create conversation' }, { status: 500 });
  }
}
