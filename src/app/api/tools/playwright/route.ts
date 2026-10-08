import { NextResponse } from "next/server";
import {
  browsePage,
  captureScreenshot,
  searchWithPlaywright,
  executeAutomation,
} from "@cheapchats/backend/lib/playwrightService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "browse", url, query, steps, options = {} } = body;

    switch (action) {
      case "browse": {
        if (!url) {
          return NextResponse.json({ error: "URL is required for browse action" }, { status: 400 });
        }
        const crawl = await browsePage(url, options);
        return NextResponse.json({ success: true, ...crawl });
      }

      case "screenshot": {
        if (!url) {
          return NextResponse.json({ error: "URL is required for screenshot action" }, { status: 400 });
        }
        const screenshotResult = await captureScreenshot(url, options);
        return NextResponse.json(screenshotResult);
      }

      case "search": {
        if (!query) {
          return NextResponse.json({ error: "Query is required for search action" }, { status: 400 });
        }
        const results = await searchWithPlaywright(query, options.limit || 5);
        return NextResponse.json({ success: true, query, results });
      }

      case "automate": {
        if (!Array.isArray(steps) || steps.length === 0) {
          return NextResponse.json({ error: "Array of automation steps is required" }, { status: 400 });
        }
        const automationResult = await executeAutomation(steps);
        return NextResponse.json(automationResult);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: browse, screenshot, search, automate` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Playwright automation failed" },
      { status: 500 }
    );
  }
}
