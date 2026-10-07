import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { conversations, messages } from "@cheapchats/backend/db/schema";
import { eq, asc } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const conv = db.select().from(conversations).where(eq(conversations.id, id)).get();
    if (!conv || conv.isIncognito === 1 || (conv.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const msgList = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt))
      .all();

    return NextResponse.json({ conversation: conv, messages: msgList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch conversation" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const conv = db.select().from(conversations).where(eq(conversations.id, id)).get();
    if (!conv || (conv.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.isPinned === "boolean" || typeof body.isPinned === "number") updates.isPinned = body.isPinned ? 1 : 0;
    if (typeof body.isBookmarked === "boolean" || typeof body.isBookmarked === "number") updates.isBookmarked = body.isBookmarked ? 1 : 0;

    db.update(conversations).set(updates).where(eq(conversations.id, id)).run();

    return NextResponse.json({ success: true, updates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update conversation" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const existing = db.select().from(conversations).where(eq(conversations.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    db.delete(messages).where(eq(messages.conversationId, id)).run();
    db.delete(conversations).where(eq(conversations.id, id)).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete conversation" }, { status: 500 });
  }
}
