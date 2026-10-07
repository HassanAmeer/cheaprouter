import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { conversations, messages, users, auditLogs } from "@cheapchats/backend/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const convId = searchParams.get("id");

    if (convId) {
      const conv = db.select().from(conversations).where(eq(conversations.id, convId)).get();
      const msgList = db.select().from(messages).where(eq(messages.conversationId, convId)).orderBy(messages.createdAt).all();
      return NextResponse.json({ conversation: conv, messages: msgList });
    }

    const allConvs = db.select().from(conversations).orderBy(desc(conversations.updatedAt)).all();

    const list = allConvs.map((c: any) => {
      const owner = db.select().from(users).where(eq(users.id, c.userId)).get();
      const msgCount = db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(eq(messages.conversationId, c.id))
        .get()?.count || 0;

      return {
        ...c,
        ownerUsername: owner?.username || "Unknown User",
        messageCount: msgCount,
      };
    });

    return NextResponse.json({ conversations: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch admin chats" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const convId = searchParams.get("id");

    if (!convId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    db.delete(messages).where(eq(messages.conversationId, convId)).run();
    db.delete(conversations).where(eq(conversations.id, convId)).run();

    db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      userId: "usr_admin",
      action: "CONVERSATION_MODERATED_DELETE",
      details: `Admin deleted conversation ID ${convId}`,
      ip: "127.0.0.1",
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete conversation" }, { status: 500 });
  }
}
