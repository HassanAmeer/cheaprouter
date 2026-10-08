import { NextResponse } from "next/server";
import { getAgentStatus } from "@cheapchats/backend/lib/agentRunnerService";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const status = getAgentStatus(id);
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get agent status" },
      { status: 500 }
    );
  }
}
