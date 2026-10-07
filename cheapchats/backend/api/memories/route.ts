import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { memories } from "@cheapchats/backend/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let list = db
      .select()
      .from(memories)
      .where(eq(memories.userId, session.id))
      .orderBy(desc(memories.createdAt))
      .all();
    if (!list || list.length === 0) {
      const defaultId = `mem_default_${Date.now()}`;
      db.insert(memories).values({
        id: defaultId,
        userId: session.id,
        key: "user_name",
        value: "My name is Hasan",
        content: "user_name: My name is Hasan",
        isUsed: 1,
        createdAt: Date.now(),
      }).run();
      list = db
        .select()
        .from(memories)
        .where(eq(memories.userId, session.id))
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
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.id;

    const body = await req.json();
    const id = body.id || `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    db.insert(memories).values({
      id,
      userId,
      key: body.key || "",
      value: body.value || "",
      content: body.content || (body.key ? `${body.key}: ${body.value}` : ""),
      isUsed: body.isUsed !== false ? 1 : 0,
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
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isUsed, key, value, content } = body;

    if (!id) return NextResponse.json({ error: "Memory ID required" }, { status: 400 });

    const existing = db
      .select()
      .from(memories)
      .where(eq(memories.id, id))
      .get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    db.update(memories)
      .set({
        isUsed: isUsed !== undefined ? (isUsed ? 1 : 0) : existing.isUsed,
        key: key !== undefined ? key : existing.key,
        value: value !== undefined ? value : existing.value,
        content: content !== undefined ? content : (key || value ? `${key || existing.key}: ${value || existing.value}` : existing.content),
      })
      .where(eq(memories.id, id))
      .run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update memory" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      db.delete(memories).where(eq(memories.userId, session.id)).run();
      return NextResponse.json({ success: true, message: "Cleared all memories" });
    }

    if (!id) return NextResponse.json({ error: "Memory ID required" }, { status: 400 });

    const existing = db.select().from(memories).where(eq(memories.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    db.delete(memories).where(and(eq(memories.id, id), eq(memories.userId, session.id))).run();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete memory" }, { status: 500 });
  }
}
