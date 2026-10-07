import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { globalConfig, auditLogs } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const configs = db.select().from(globalConfig).all();
    const result: Record<string, string> = {};
    configs.forEach((c: any) => (result[c.key] = c.key.endsWith("_API_KEY") && c.value ? `${c.key}_SET` : c.value));
    return NextResponse.json({ config: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch endpoints config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const now = Date.now();

    for (const [key, value] of Object.entries(body)) {
      const existing = db.select().from(globalConfig).where(eq(globalConfig.key, key)).get();
      if (existing) {
        db.update(globalConfig).set({ value: String(value), updatedAt: now }).where(eq(globalConfig.key, key)).run();
      } else {
        db.insert(globalConfig).values({ key, value: String(value), updatedAt: now }).run();
      }
    }

    db.insert(auditLogs).values({
      id: `log_${now}`,
      userId: "usr_admin",
      action: "ENDPOINTS_CONFIG_UPDATED",
      details: `Updated global API keys & provider settings.`,
      ip: "127.0.0.1",
      createdAt: now,
    }).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save endpoints config" }, { status: 500 });
  }
}
