import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { conversations, messages } from "@cheapchats/backend/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.id;

    const userConvs = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.isIncognito, 0)))
      .orderBy(desc(conversations.updatedAt))
      .all();

    return NextResponse.json({ conversations: userConvs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.id;

    const { title, model, provider, isIncognito, isBookmarked, projectId, systemPrompt, agentId } = await req.json();

    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = Date.now();

    if (!isIncognito) {
      db.insert(conversations).values({
        id,
        userId,
        title: title || "New Chat",
        model: model || "openai/gpt-4o",
        provider: provider || "OpenRouter",
        projectId: projectId || null,
        systemPrompt: systemPrompt || null,
        agentId: agentId || null,
        isPinned: 0,
        isBookmarked: isBookmarked ? 1 : 0,
        isIncognito: 0,
        createdAt: now,
        updatedAt: now,
      }).run();
    }

    return NextResponse.json({
      conversation: {
        id,
        userId,
        title: title || "New Chat",
        model: model || "openai/gpt-4o",
        provider: provider || "OpenRouter",
        projectId: projectId || null,
        systemPrompt: systemPrompt || null,
        agentId: agentId || null,
        isBookmarked: isBookmarked ? 1 : 0,
        isIncognito: isIncognito ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create conversation" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.id;

    const userConversations = db.select({ id: conversations.id }).from(conversations).where(eq(conversations.userId, userId)).all();
    for (const conversation of userConversations) {
      db.delete(messages).where(eq(messages.conversationId, conversation.id)).run();
    }

    db.delete(conversations).where(eq(conversations.userId, userId)).run();

    return NextResponse.json({ success: true, message: "All conversations deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete all conversations" }, { status: 500 });
  }
}
