import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { users, conversations, auditLogs } from "@cheapchats/backend/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { hashPassword, requireAdmin } from "@cheapchats/backend/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const allUsers = db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        status: users.status,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .all();

    const result = allUsers.map((u: any) => {
      const convCount = db.select({ count: sql<number>`count(*)` })
        .from(conversations)
        .where(eq(conversations.userId, u.id))
        .get()?.count || 0;

      return {
        ...u,
          conversationsCount: convCount,
      };
    });

    return NextResponse.json({ users: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch admin users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { username, password, role = "USER" } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const existing = db.select().from(users).where(eq(users.username, username)).get();
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = Date.now();

    db.insert(users).values({
      id,
      username,
      password: hashPassword(password),
      role,
      status: "ACTIVE",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      createdAt: now,
    }).run();

    db.insert(auditLogs).values({
      id: `log_${now}`,
      userId: "usr_admin",
      action: "USER_CREATED",
      details: `Admin created user ${username} with role ${role}.`,
      ip: "127.0.0.1",
      createdAt: now,
    }).run();

    return NextResponse.json({ success: true, userId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, action, role, password, status } = await req.json();

    const targetUser = db.select().from(users).where(eq(users.id, userId)).get();
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (action === "RESET_PASSWORD") {
      updates.password = hashPassword("1234");
    } else if (action === "CHANGE_ROLE" && role) {
      updates.role = role;
    } else if (action === "TOGGLE_BAN") {
      updates.status = targetUser.status === "ACTIVE" ? "BANNED" : "ACTIVE";
    }

    if (Object.keys(updates).length > 0) {
      db.update(users).set(updates).where(eq(users.id, userId)).run();

      db.insert(auditLogs).values({
        id: `log_${Date.now()}`,
        userId: "usr_admin",
        action: `USER_MODIFIED_${action}`,
        details: `Updated user ${targetUser.username}: ${JSON.stringify(updates)}`,
        ip: "127.0.0.1",
        createdAt: Date.now(),
      }).run();
    }

    return NextResponse.json({ success: true, updates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    db.delete(users).where(eq(users.id, userId)).run();

    db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      userId: "usr_admin",
      action: "USER_DELETED",
      details: `Deleted user account ID ${userId}`,
      ip: "127.0.0.1",
      createdAt: Date.now(),
    }).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
