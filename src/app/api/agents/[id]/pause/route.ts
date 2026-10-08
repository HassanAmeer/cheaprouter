import { NextResponse } from "next/server";
import { pauseAgent } from "@cheapchats/backend/lib/agentRunnerService";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = pauseAgent(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to pause agent" },
      { status: 500 }
    );
  }
}
