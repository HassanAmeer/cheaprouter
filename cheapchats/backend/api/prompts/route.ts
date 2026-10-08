import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { prompts } from "@cheapchats/backend/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.id;

    const list = session?.role === "ADMIN"
      ? await db.select().from(prompts).orderBy(desc(prompts.createdAt)).all()
      : userId
      ? await db
          .select()
          .from(prompts)
          .where(or(eq(prompts.isPublic, 1), eq(prompts.userId, userId)))
          .orderBy(desc(prompts.createdAt))
          .all()
      : await db
          .select()
          .from(prompts)
          .where(eq(prompts.isPublic, 1))
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
    const userId = session?.id || "usr_user1";

    const body = await req.json();
    const id = `prm_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await db.insert(prompts).values({
      id,
      userId,
      title: body.title || "Untitled Prompt",
      description: body.description || "",
      category: body.category || "General",
      content: body.content || "",
      command: body.command || "",
      isPublic: body.isPublic ? 1 : 0,
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true, promptId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create prompt" }, { status: 500 });
  }
}
