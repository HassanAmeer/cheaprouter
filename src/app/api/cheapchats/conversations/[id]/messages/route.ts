import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../../../../cheapchats/backend/db";
import { conversations, messages } from "../../../../../../../cheapchats/backend/db/schema";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const entries = body?.messages;

    if (
      !Array.isArray(entries) ||
      entries.length === 0 ||
      entries.length > 20 ||
      entries.some(
        (entry) =>
          !entry ||
          !["user", "assistant"].includes(entry.sender) ||
          typeof entry.content !== "string"
      )
    ) {
      return NextResponse.json({ error: "Invalid message list." }, { status: 400 });
    }

    const conversation = db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.id, id))
      .get();
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const now = Date.now();
    db.insert(messages)
      .values(
        entries.map((entry: { sender: "user" | "assistant"; content: string; attachments?: unknown }, index: number) => ({
          id: `msg_${now}_${index}_${crypto.randomUUID()}`,
          conversationId: id,
          sender: entry.sender,
          content: entry.content,
          model: typeof body.model === "string" ? body.model : null,
          provider: typeof body.provider === "string" ? body.provider : null,
          tokens: Math.ceil(entry.content.length / 4),
          attachments: entry.attachments ? JSON.stringify(entry.attachments) : null,
          createdAt: now + index,
        }))
      )
      .run();

    db.update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, id))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save custom provider chat messages:", error);
    return NextResponse.json({ error: "Failed to save chat messages." }, { status: 500 });
  }
}
