import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { memories } from "@cheapchats/backend/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.id || "usr_user1";

    let list = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt))
      .all();

    if (!list || list.length === 0) {
      const defaultId = `mem_default_${Date.now()}`;
      await db.insert(memories).values({
        id: defaultId,
        userId,
        key: "user_name",
        value: "My name is Hasan",
        content: "user_name: My name is Hasan",
        isUsed: 1,
        createdAt: Date.now(),
      }).run();
      list = await db
        .select()
        .from(memories)
        .where(eq(memories.userId, userId))
        .orderBy(desc(memories.createdAt))
        .all();
    }
    return NextResponse.json({ memories: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id || "usr_user1";

    const body = await req.json();
    const id = body.id || `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await db.insert(memories).values({
      id,
      userId,
      key: body.key || "",
      value: body.value || "",
      content: body.content || (body.key ? `${body.key}: ${body.value}` : ""),
      isUsed: body.isUsed !== undefined ? (body.isUsed ? 1 : 0) : 1,
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true, memoryId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create memory" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id || "usr_user1";

    const body = await req.json();
    const { id, isUsed, content, key, value } = body;
    if (!id) return NextResponse.json({ error: "Memory ID required" }, { status: 400 });

    const updates: any = {};
    if (isUsed !== undefined) updates.isUsed = isUsed ? 1 : 0;
    if (content !== undefined) updates.content = content;
    if (key !== undefined) updates.key = key;
    if (value !== undefined) updates.value = value;

    await db.update(memories).set(updates).where(and(eq(memories.id, id), eq(memories.userId, userId))).run();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update memory" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id || "usr_user1";

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll");

    if (clearAll === "true") {
      await db.delete(memories).where(eq(memories.userId, userId)).run();
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: "Memory ID required" }, { status: 400 });

    await db.delete(memories).where(and(eq(memories.id, id), eq(memories.userId, userId))).run();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete memory" }, { status: 500 });
  }
}
