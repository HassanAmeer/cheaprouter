import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { prompts } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const prompt = db.select().from(prompts).where(eq(prompts.id, id)).get();
    if (!prompt || (prompt.isPublic !== 1 && prompt.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }
    return NextResponse.json({ prompt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch prompt" }, { status: 500 });
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

    const existing = db.select().from(prompts).where(eq(prompts.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.content === "string") updates.content = body.content;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.category === "string") updates.category = body.category;
    if (typeof body.command === "string") updates.command = body.command;
    if (typeof body.isPublic === "number" || typeof body.isPublic === "boolean") {
      updates.isPublic = body.isPublic ? 1 : 0;
    }

    db.update(prompts).set(updates).where(eq(prompts.id, id)).run();

    return NextResponse.json({ success: true, promptId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update prompt" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const existing = db.select().from(prompts).where(eq(prompts.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    db.delete(prompts).where(eq(prompts.id, id)).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete prompt" }, { status: 500 });
  }
}
