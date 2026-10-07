import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { users, conversations, messages, mcpServers, auditLogs } from "@cheapchats/backend/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const totalUsers = db.select({ count: sql<number>`count(*)` }).from(users).get()?.count || 0;

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const activeConvsToday = db.select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(sql`created_at >= ${startOfDay.getTime()}`)
      .get()?.count || 0;

    const tokenStats = db.select({
      totalTokens: sql<number>`sum(tokens)`,
      totalCost: sql<number>`sum(cost)`
    }).from(messages).get();

    const activeMcp = db.select({ count: sql<number>`count(*)` }).from(mcpServers).get()?.count || 0;

    const recentLogs = db.select().from(auditLogs).orderBy(sql`created_at desc`).limit(10).all();

    const tokenUsageChart: { day: string; tokens: number; cost: number }[] = [];
    const modelDistribution: { name: string; percentage: number; color: string }[] = [];

    return NextResponse.json({
      stats: {
        totalUsers,
        activeConvsToday,
        totalTokens: tokenStats?.totalTokens || 0,
        totalCost: Number((tokenStats?.totalCost || 0).toFixed(4)),
        activeMcpServers: activeMcp,
      },
      charts: {
        tokenUsageChart,
        modelDistribution,
      },
      systemLogs: recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch admin stats" }, { status: 500 });
  }
}
