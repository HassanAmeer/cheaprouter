import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { mcpServers } from "@cheapchats/backend/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const servers = db.select().from(mcpServers).orderBy(desc(mcpServers.createdAt)).all();
    return NextResponse.json({ servers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch MCP servers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `mcp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const existing = db.select().from(mcpServers).where(eq(mcpServers.id, id)).get();
    if (existing) {
      db.update(mcpServers)
        .set({
          name: body.name || existing.name,
          type: body.type || existing.type,
          urlOrCommand: body.urlOrCommand || existing.urlOrCommand,
          status: body.status || existing.status,
          toolsJson: body.tools ? JSON.stringify(body.tools) : existing.toolsJson,
        })
        .where(eq(mcpServers.id, id))
        .run();
      return NextResponse.json({ success: true, serverId: id });
    }

    db.insert(mcpServers).values({
      id,
      name: body.name,
      type: body.type || "stdio",
      urlOrCommand: body.urlOrCommand,
      status: body.status || "ACTIVE",
      toolsJson: JSON.stringify(body.tools || []),
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true, serverId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save MCP server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Server ID required" }, { status: 400 });

    db.delete(mcpServers).where(eq(mcpServers.id, id)).run();
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete MCP server" }, { status: 500 });
  }
}
