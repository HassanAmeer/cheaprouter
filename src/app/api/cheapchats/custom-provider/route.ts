import { lookup as dnsLookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import {
  readWebPageWithReach,
  searchWebWithReach,
  cleanSearchQuery,
  getYoutubeTranscriptWithReach,
} from "../../../../../cheapchats/backend/lib/agentReachService";

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
    let upstreamPayload: string | undefined = undefined;
    if (action === "chat") {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return NextResponse.json({ error: "A chat request payload is required." }, { status: 400 });
      }

      // Clone payload & messages
      const payloadObj = { ...(payload as Record<string, any>) };
      const rawMessages: any[] = Array.isArray(payloadObj.messages) ? [...payloadObj.messages] : [];

      // Extract last user message
      const lastUserIndex = rawMessages.findLastIndex((m: any) => m && m.role === "user");
      const userMessage =
        (typeof body.message === "string" && body.message.trim()) ||
        (lastUserIndex !== -1 && typeof rawMessages[lastUserIndex]?.content === "string"
          ? rawMessages[lastUserIndex].content.trim()
          : "");

      const tools =
        body.tools && typeof body.tools === "object"
          ? (body.tools as Record<string, boolean>)
          : undefined;

      // 1. Live URL Scraping (Jina Reader / YouTube Transcript)
      const urlMatch = userMessage.match(/https?:\/\/[^\s<>'"]+/i);
      let scrapedContext = "";
      if (urlMatch) {
        const targetUrl = urlMatch[0];
        try {
          const isYoutube = /youtube\.com|youtu\.be/i.test(targetUrl);
          const scrapeResult = isYoutube
            ? await getYoutubeTranscriptWithReach(targetUrl)
            : await readWebPageWithReach(targetUrl);
          if (scrapeResult && scrapeResult.success && scrapeResult.markdown) {
            scrapedContext = `\n\n<agent_reach_scraped_content url="${targetUrl}" source="${scrapeResult.source}">\nTitle: ${scrapeResult.title || targetUrl}\nContent:\n${scrapeResult.markdown}\n</agent_reach_scraped_content>\n`;
          }
        } catch (err) {
          console.warn("[Custom Provider] Scrape URL failed:", err);
        }
      }

      // 2. Pure capability check vs live web search
      const lowerTrimmed = userMessage.toLowerCase().trim().replace(/[?!.,;]+$/, "");
      const isPureSearchCapabilityQuestion =
        /^(web\s+(se|par|pe)\s+)?(aap\s+)?search\s+(karke\s+)?(mujhe\s+)?(batayein|batao|karein|karo)$/i.test(lowerTrimmed) ||
        /^(kya\s+)?(aap|tum)\s+(web|internet|google)\s+(se\s+)?search\s+kar\s+sakte\s+(ho|hain)$/i.test(lowerTrimmed) ||
        /^(can\s+you|are\s+you\s+able\s+to)\s+(search|browse)\s+(the\s+)?(web|internet)$/i.test(lowerTrimmed) ||
        /^(search\s+the\s+web|browse\s+the\s+web|web\s+search\s+karo|search\s+karke\s+batao|web\s+search\s+on\s+hai)$/i.test(lowerTrimmed);

      const isExplicitSearchRequest =
        Boolean(tools?.webSearch) ||
        (/\b(search|dhoondo|find|latest|news|google|khabar|update|taza|playwright|agent reach|scrape|live|price|rate|bhao|gold|chandi|silver|dollar|rupee|pkr|usd|result|nikal|nikalo|check|current|today|aj|aaj|kal|bitcoin|btc|crypto|ethereum|eth|solana|sol|nvidia|browse|fetch)\b/i.test(
          userMessage
        ));

      let searchSystemDirective = "";
      let liveSearchContextText = "";
      let executedCleanedQuery = "";

      if (isPureSearchCapabilityQuestion) {
        searchSystemDirective = `\n\n<search_readiness_instruction>
The user is testing or asking about your real-time web search and live internet capabilities.
MANDATORY INSTRUCTION:
1. Enthusiastically confirm in natural Roman Urdu or English:
   "Jee haan! Mere paas real-time web search aur live internet research ki mukammal salahiyat active hai. Aap mujhe koi bhi topic (jaise taza tareen khabrein, gold rate, crypto/currency rates, cricket score, ya research) batayein, main foran internet se live search karke aapko update karunga."
2. NEVER apologize or claim that you cannot search.
</search_readiness_instruction>\n`;
      } else if (isExplicitSearchRequest && !urlMatch && userMessage) {
        try {
          let cleanedQuery = cleanSearchQuery(userMessage);
          if (!cleanedQuery || cleanedQuery.length < 2) {
            cleanedQuery = userMessage.replace(/https?:\/\/[^\s]+/gi, "").trim();
          }
          executedCleanedQuery = cleanedQuery;

          if (cleanedQuery) {
            console.log("[Custom Provider Reach] Searching web for topic:", cleanedQuery);
            const searchData = await searchWebWithReach(cleanedQuery, 5);
            if (searchData.results && searchData.results.length > 0) {
              liveSearchContextText = searchData.results
                .map(
                  (r: any, idx: number) =>
                    `[Source ${idx + 1}]: ${r.title}\nLink: ${r.link}\nDetails: ${r.snippet}`
                )
                .join("\n\n");

              searchSystemDirective = `\n\n<web_search_results engine="${searchData.source}">
Query: "${cleanedQuery}"
${searchData.summary ? `Summary: ${searchData.summary}\n` : ""}
Results:
${searchData.results.map((r: any) => `- **${r.title}** (${r.link})\n  ${r.snippet}`).join("\n")}

CRITICAL MANDATORY DIRECTIVE:
Real-time verified live web data has been retrieved above via Agent Reach and DuckDuckGo / Wikipedia / Web.
You MUST directly and accurately answer the user's question using these exact findings and current data.
NEVER say "I am not able to search", "mere paas real-time access nahi hai", or "I lack real-time data". You HAVE the live research data right here. State the facts clearly in natural Roman Urdu or English!
</web_search_results>\n`;
            }
          }
        } catch (err) {
          console.warn("[Custom Provider Reach] Search execution failed:", err);
        }
      }

      // Inject system instructions
      const fullAdditions = `${scrapedContext}${searchSystemDirective}`;
      if (fullAdditions) {
        const sysIndex = rawMessages.findIndex((m: any) => m && m.role === "system");
        if (sysIndex !== -1) {
          rawMessages[sysIndex] = {
            ...rawMessages[sysIndex],
            content: `${rawMessages[sysIndex].content || ""}\n${fullAdditions}`,
          };
        } else {
          rawMessages.unshift({
            role: "system",
            content: fullAdditions.trim(),
          });
        }
      }

      // Inject live research dossier directly into active user prompt
      if (liveSearchContextText && lastUserIndex !== -1) {
        const targetUserIdx = rawMessages.findLastIndex((m: any) => m && m.role === "user");
        if (targetUserIdx !== -1) {
          rawMessages[targetUserIdx] = {
            ...rawMessages[targetUserIdx],
            content: `[CURRENT LIVE WEB DATA & RESEARCH DOSSIER FOR: "${executedCleanedQuery}"]\n${liveSearchContextText}\n\n[USER QUERY]:\n${userMessage}`,
          };
        }
      }

      payloadObj.messages = rawMessages;
      upstreamPayload = JSON.stringify(payloadObj);
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
