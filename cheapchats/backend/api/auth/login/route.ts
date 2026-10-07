import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { users, auditLogs } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signSession, verifyPassword } from "@cheapchats/backend/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const user = db.select().from(users).where(eq(users.username, username)).get();

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    if (user.status === "BANNED") {
      return NextResponse.json({ error: "Account is banned. Contact system administrator." }, { status: 403 });
    }

    // Log audit action
    db.insert(auditLogs).values({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      action: "USER_LOGIN",
      details: `User ${user.username} logged in successfully as ${user.role}.`,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      createdAt: Date.now(),
    }).run();

    const res = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      }
    });

    res.cookies.set("user_session", signSession({ id: user.id, username: user.username, role: user.role }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
}
}
