import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { agents } from "@cheapchats/backend/db/schema";
import { and, eq, desc, or } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const allAgents = session.role === "ADMIN"
      ? db.select().from(agents).orderBy(desc(agents.createdAt)).all()
      : db
          .select()
          .from(agents)
          .where(or(eq(agents.isPublic, 1), eq(agents.userId, session.id)))
          .orderBy(desc(agents.createdAt))
          .all();
    return NextResponse.json({ agents: allAgents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch agents" }, { status: 500 });
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
    const id = `agent_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    db.insert(agents).values({
      id,
      userId,
      name: body.name || "Custom Agent",
      description: body.description || "",
      avatar: body.avatar || "🤖",
      systemPrompt: body.systemPrompt || "You are a helpful assistant.",
      temperature: body.temperature ?? 0.7,
      model: body.model || "openai/gpt-4o",
      capabilities: JSON.stringify(body.capabilities || {}),
      isPublic: body.isPublic ? 1 : 0,
      isFeatured: 0,
      status: "APPROVED",
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true, agentId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create agent" }, { status: 500 });
  }
}
