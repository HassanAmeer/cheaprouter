import { NextResponse } from 'next/server';
import { db } from '../../../../../../cheapchats/backend/db';
import { conversations, messages } from '../../../../../../cheapchats/backend/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const conv = db.select().from(conversations).where(eq(conversations.id, id)).get();
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const msgs = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt))
      .all();

    return NextResponse.json({ conversation: conv, messages: msgs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load conversation' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: any = { updatedAt: Date.now() };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.isPinned !== undefined) updateData.isPinned = body.isPinned ? 1 : 0;
    if (body.isBookmarked !== undefined) updateData.isBookmarked = body.isBookmarked ? 1 : 0;

    db.update(conversations).set(updateData).where(eq(conversations.id, id)).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update conversation' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    db.delete(messages).where(eq(messages.conversationId, id)).run();
    db.delete(conversations).where(eq(conversations.id, id)).run();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete conversation' }, { status: 500 });
  }
}
