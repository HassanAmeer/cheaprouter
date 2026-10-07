import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { prompts } from "@cheapchats/backend/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const list = session.role === "ADMIN"
      ? db.select().from(prompts).orderBy(desc(prompts.createdAt)).all()
      : db
          .select()
          .from(prompts)
          .where(eq(prompts.userId, session.id))
          .orderBy(desc(prompts.createdAt))
          .all();
    return NextResponse.json({ prompts: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch prompts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.id;

    const body = await req.json();
    const id = `prm_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    db.insert(prompts).values({
      id,
      userId,
      title: body.title || body.name || "Untitled Prompt",
      description: body.description || "",
      category: body.category || "General",
      content: body.content || body.text || "",
      command: body.command || "",
      isPublic: body.isPublic ? 1 : 0,
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true, promptId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create prompt" }, { status: 500 });
  }
}
