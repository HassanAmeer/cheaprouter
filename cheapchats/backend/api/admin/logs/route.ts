import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { auditLogs, users } from "@cheapchats/backend/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const logs = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100).all();

    const list = logs.map((l: any) => {
      const u = db.select().from(users).where(eq(users.id, l.userId)).get();
      return {
        ...l,
        username: u?.username || "System",
      };
    });

    return NextResponse.json({ logs: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
