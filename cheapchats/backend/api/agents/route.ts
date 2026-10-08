import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { agents } from "@cheapchats/backend/db/schema";
import { eq, desc, or } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.id;

    const allAgents = session?.role === "ADMIN"
      ? await db.select().from(agents).orderBy(desc(agents.createdAt)).all()
      : userId
      ? await db
          .select()
          .from(agents)
          .where(or(eq(agents.isPublic, 1), eq(agents.userId, userId)))
          .orderBy(desc(agents.createdAt))
          .all()
      : await db
          .select()
          .from(agents)
          .where(eq(agents.isPublic, 1))
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
    const userId = session?.id || "usr_user1";

    const body = await req.json();
    const id = body.id || `agt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    if (body.id) {
      const existing = db.select().from(agents).where(eq(agents.id, body.id)).get();
      if (existing) {
        db.update(agents)
          .set({
            name: body.name || existing.name,
            description: body.description !== undefined ? body.description : existing.description,
            avatar: body.avatar || existing.avatar,
            systemPrompt: body.systemPrompt || existing.systemPrompt,
            temperature: typeof body.temperature === "number" ? body.temperature : existing.temperature,
            model: body.model || existing.model,
            capabilities: JSON.stringify(body.capabilities || {}),
            isPublic: body.isPublic ? 1 : 0,
          })
          .where(eq(agents.id, body.id))
          .run();
        return NextResponse.json({ success: true, agentId: body.id });
      }
    }

    await db.insert(agents).values({
      id,
      userId,
      name: body.name || "Custom Agent",
      description: body.description || "",
      avatar: body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
      systemPrompt: body.systemPrompt || "You are a helpful assistant.",
      temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
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
