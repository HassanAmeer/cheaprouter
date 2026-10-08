import { NextResponse } from "next/server";
import { searchWebWithReach } from "@cheapchats/backend/lib/agentReachService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query, limit = 5, isBackground = false, maxRetries } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const searchResult = await searchWebWithReach(query, Number(limit) || 5, { isBackground, maxRetries });
    return NextResponse.json({ success: true, ...searchResult });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to perform web search" },
      { status: 500 }
    );
  }
}
