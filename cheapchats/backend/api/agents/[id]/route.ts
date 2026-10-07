import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { agents, auditLogs } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = db.select().from(agents).where(eq(agents.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (typeof body.isFeatured === "number" || typeof body.isFeatured === "boolean") {
      updates.isFeatured = body.isFeatured ? 1 : 0;
    }
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.isPublic === "number" || typeof body.isPublic === "boolean") {
      updates.isPublic = body.isPublic ? 1 : 0;
    }

    db.update(agents).set(updates).where(eq(agents.id, id)).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update agent" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const existing = db.select().from(agents).where(eq(agents.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    db.delete(agents).where(eq(agents.id, id)).run();

    db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      userId: "usr_admin",
      action: "AGENT_DELETED",
      details: `Admin deleted agent ID ${id} (${existing.name})`,
      ip: "127.0.0.1",
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete agent" }, { status: 500 });
  }
}
