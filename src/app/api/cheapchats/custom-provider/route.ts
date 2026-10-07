import { lookup as dnsLookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 1024 * 1024;
const MAX_MODELS_RESPONSE_BYTES = 2 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 120_000;

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const value = (((octets[0] * 256 + octets[1]) * 256 + octets[2]) * 256 + octets[3]) >>> 0;
  const blocked: Array<[number, number]> = [
    [0x00000000, 8], [0x0a000000, 8], [0x64400000, 10], [0x7f000000, 8],
    [0xa9fe0000, 16], [0xac100000, 12], [0xc0000000, 24], [0xc0000200, 24],
    [0xc0586300, 24], [0xc0a80000, 16], [0xc6120000, 15], [0xc6336400, 24],
    [0xcb007100, 24], [0xe0000000, 4], [0xf0000000, 4],
  ];
  return !blocked.some(([network, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (value & mask) === (network & mask);
  });
}

function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPublicIpv4(address);
  if (version !== 6) return false;

  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:") || normalized.startsWith("2002:") || normalized.startsWith("2001:0:")) {
    return false;
  }
  const firstGroup = Number.parseInt(normalized.split(":")[0] || "0", 16);
  return firstGroup >= 0x2000 && firstGroup <= 0x3fff && !normalized.startsWith("2001:db8:");
}

async function resolvePublicTarget(rawUrl: string): Promise<{ url: URL; address: string; family: 4 | 6 }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("The provider URL is invalid.");
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.port !== "" && Number(url.port) < 1024 && url.port !== "80" && url.port !== "443")
  ) {
    throw new Error("Use an HTTP or HTTPS provider URL without credentials, query strings, fragments, or restricted ports.");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Local and private network provider addresses are not allowed.");
  }

  const literalFamily = isIP(hostname);
  const addresses = literalFamily
    ? [{ address: hostname, family: literalFamily }]
    : await dnsLookup(hostname, { all: true, verbatim: true });

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error("The provider host must resolve only to public internet addresses.");
  }

  const target = addresses[0];
  return { url, address: target.address, family: target.family as 4 | 6 };
}

function checkSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsedOrigin = new URL(origin);
    const requestUrl = new URL(request.url);
    return parsedOrigin.origin === requestUrl.origin;
  } catch {
    return false;
  }
}

async function readLimitedJson(request: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) throw new Error("The request is too large.");
  if (!request.body) throw new Error("The request body is required.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new Error("The request is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(bytes);
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The request body must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

function requestUpstream(
  target: Awaited<ReturnType<typeof resolvePublicTarget>>,
  method: "GET" | "POST",
  apiKey: string,
  payload?: string
): Promise<import("node:http").IncomingMessage> {
  const transport = target.url.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const outgoing = transport(
      target.url,
      {
        method,
        headers: {
          Accept: method === "GET" ? "application/json" : "text/event-stream, application/json",
          ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
        timeout: UPSTREAM_TIMEOUT_MS,
        maxHeaderSize: 16 * 1024,
        lookup: (_hostname, options, callback) => {
          const result = { address: target.address, family: target.family };
          if (typeof options === "object" && options !== null && "all" in options && options.all) {
            callback(null, [result]);
          } else {
            callback(null, result.address, result.family);
          }
        },
      },
      resolve
    );
    outgoing.on("timeout", () => outgoing.destroy(new Error("The provider request timed out.")));
    outgoing.on("error", reject);
    if (payload) outgoing.write(payload);
    outgoing.end();
  });
}

export async function POST(request: Request) {
  if (!checkSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  try {
    const body = await readLimitedJson(request);
    const { baseUrl, apiKey, action, payload } = body;
    if (
      typeof baseUrl !== "string" ||
      typeof apiKey !== "undefined" && typeof apiKey !== "string" ||
      (action !== "models" && action !== "chat")
    ) {
      return NextResponse.json({ error: "Invalid provider proxy request." }, { status: 400 });
    }

    const target = await resolvePublicTarget(baseUrl);
    const upstreamPayload = action === "chat" ? JSON.stringify(payload) : undefined;
    if (action === "chat" && (!payload || typeof payload !== "object" || Array.isArray(payload))) {
      return NextResponse.json({ error: "A chat request payload is required." }, { status: 400 });
    }

    target.url.pathname = `${target.url.pathname.replace(/\/+$/, "")}/${action === "models" ? "models" : "chat/completions"}`;
    const upstream = await requestUpstream(target, action === "models" ? "GET" : "POST", apiKey || "", upstreamPayload);
    const status = upstream.statusCode || 502;
    const contentType = upstream.headers["content-type"] || "application/json";

    if (action === "models") {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of upstream) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.byteLength;
        if (size > MAX_MODELS_RESPONSE_BYTES) {
          upstream.destroy();
          return NextResponse.json({ error: "The provider model list is too large." }, { status: 502 });
        }
        chunks.push(buffer);
      }
      return new NextResponse(Buffer.concat(chunks), {
        status,
        headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
      });
    }

    const iterator = upstream[Symbol.asyncIterator]();
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { done, value } = await iterator.next();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(Buffer.isBuffer(value) ? value : Buffer.from(value));
        } catch (error) {
          controller.error(error);
        }
      },
      async cancel() {
        upstream.destroy();
        await iterator.return?.();
      },
    });
    return new NextResponse(stream, {
      status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The custom provider request failed.";
    console.error("Custom provider proxy request failed:", message);
    const status = message.includes("provider URL") || message.includes("Use an HTTP") || message.includes("not allowed") || message.includes("credentials") || message.includes("public internet")
      ? 400
      : message.includes("too large")
        ? 413
        : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
