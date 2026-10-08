import { NextResponse } from "next/server";
import {
  readWebPageWithReach,
  searchWebWithReach,
  getYoutubeTranscriptWithReach,
  readGithubWithReach,
  callAgentReachCli,
  getAgentReachDoctorReport,
} from "@cheapchats/backend/lib/agentReachService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "read", url, query, owner, repo, itemPath, channel, limit = 5 } = body;

    switch (action) {
      case "read": {
        if (!url) {
          return NextResponse.json({ error: "URL is required for read action" }, { status: 400 });
        }
        const res = await readWebPageWithReach(url);
        return NextResponse.json(res);
      }

      case "search": {
        if (!query) {
          return NextResponse.json({ error: "Query is required for search action" }, { status: 400 });
        }
        const res = await searchWebWithReach(query, Number(limit) || 5);
        return NextResponse.json({ success: true, ...res });
      }

      case "youtube": {
        if (!url) {
          return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
        }
        const res = await getYoutubeTranscriptWithReach(url);
        return NextResponse.json(res);
      }

      case "github": {
        if (!owner || !repo) {
          return NextResponse.json({ error: "owner and repo are required for GitHub action" }, { status: 400 });
        }
        const res = await readGithubWithReach(owner, repo, itemPath);
        return NextResponse.json(res);
      }

      case "doctor": {
        const report = await getAgentReachDoctorReport();
        return NextResponse.json({ success: true, report });
      }

      case "cli": {
        if (!channel) {
          return NextResponse.json({ error: "Channel is required for CLI action" }, { status: 400 });
        }
        const cliRes = await callAgentReachCli("get", [channel, query || ""]);
        return NextResponse.json(cliRes);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: read, search, youtube, github, doctor, cli` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Agent Reach operation failed" },
      { status: 500 }
    );
  }
}
