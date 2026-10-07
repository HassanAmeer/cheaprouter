import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { providerEndpoints } from "@cheapchats/backend/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PROVIDER = "Custom API";

async function getUserEndpoint(userId: string = "public") {
  return db
    .select()
    .from(providerEndpoints)
    .where(and(eq(providerEndpoints.userId, userId), eq(providerEndpoints.provider, PROVIDER)))
    .get();
}

export async function GET() {
  const endpoint = await getUserEndpoint();
  return NextResponse.json({
    endpoint: endpoint
      ? { baseUrl: endpoint.baseUrl, apiKey: endpoint.apiKey ? "CUSTOM_API_KEY_SET" : "" }
      : null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const endpoint = String(body.endpoint || body.baseUrl || "").trim();
    const apiKey = body.apiKey ? String(body.apiKey) : "";

    if (!endpoint) return NextResponse.json({ error: "Endpoint URL is required" }, { status: 400 });

    let parsedEndpoint;
    try {
      parsedEndpoint = new URL(endpoint);
    } catch {
      return NextResponse.json({ error: "Endpoint URL is invalid" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsedEndpoint.protocol)) {
      return NextResponse.json({ error: "Only HTTP(S) endpoints are allowed" }, { status: 400 });
    }

    const now = Date.now();
    const existing = await getUserEndpoint();
    if (existing) {
      db.update(providerEndpoints)
        .set({ baseUrl: endpoint, apiKey, updatedAt: now })
        .where(eq(providerEndpoints.id, existing.id))
        .run();
    } else {
      db.insert(providerEndpoints)
        .values({
          id: `endpoint_${now}`,
          userId: "public",
          provider: PROVIDER,
          baseUrl: endpoint,
          apiKey,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save provider endpoint" }, { status: 500 });
  }
}
