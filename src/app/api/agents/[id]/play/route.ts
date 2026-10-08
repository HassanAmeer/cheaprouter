import { NextResponse } from "next/server";
import { executeAgentResearch } from "@cheapchats/backend/lib/agentRunnerService";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    // Trigger in background without blocking HTTP request
    executeAgentResearch(id, {
      query: body.query,
      projectId: body.projectId,
      conversationId: body.conversationId,
      targetUrls: body.targetUrls,
      mode: body.mode,
    }).catch((err) => console.error("[AGENT BACKGROUND ERROR]", err));

    return NextResponse.json({
      success: true,
      status: "running",
      message: "Autonomous research launched in background",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to run agent research" },
      { status: 500 }
    );
  }
}
