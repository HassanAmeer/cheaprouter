import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { users } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    const user = session
      ? db.select().from(users).where(eq(users.id, session.id)).get()
      : null;

    if (!user || user.status === "BANNED") {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      }
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
