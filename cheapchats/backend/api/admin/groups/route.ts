import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { globalConfig, auditLogs } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const matrixEntry = db.select().from(globalConfig).where(eq(globalConfig.key, "PERMISSIONS_MATRIX")).get();
    const defaultMatrix = {
      USER: { webSearch: true, mcpTools: true, fileUploads: true, customPrompts: true, agentBuilder: true },
      ADMIN: { webSearch: true, mcpTools: true, fileUploads: true, customPrompts: true, agentBuilder: true, fullModeration: true }
    };

    const matrix = matrixEntry ? JSON.parse(matrixEntry.value) : defaultMatrix;
    return NextResponse.json({ matrix });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch permissions matrix" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { matrix } = await req.json();
    const now = Date.now();

    const existing = db.select().from(globalConfig).where(eq(globalConfig.key, "PERMISSIONS_MATRIX")).get();
    if (existing) {
      db.update(globalConfig).set({ value: JSON.stringify(matrix), updatedAt: now }).where(eq(globalConfig.key, "PERMISSIONS_MATRIX")).run();
    } else {
      db.insert(globalConfig).values({ key: "PERMISSIONS_MATRIX", value: JSON.stringify(matrix), updatedAt: now }).run();
    }

    db.insert(auditLogs).values({
      id: `log_${now}`,
      userId: "usr_admin",
      action: "PERMISSIONS_MATRIX_UPDATED",
      details: "Admin modified role permissions capabilities matrix.",
      ip: "127.0.0.1",
      createdAt: now,
    }).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update permissions matrix" }, { status: 500 });
  }
}
