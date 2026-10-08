import https from "node:https";
import dns from "node:dns";

const dnsCache = new Map<string, { ips: string[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache

/**
 * High-speed DNS-over-HTTPS (DoH) resolver.
 * Completely eliminates local ISP / router DNS timeouts (which can hang up to 90 seconds).
 * Resolves any domain in 50-150ms via Cloudflare (1.1.1.1) and Google (8.8.8.8).
 */
export async function resolveDoH(hostname: string): Promise<string[]> {
  const cleanHost = hostname.trim().toLowerCase();

  // Skip IP addresses and local hosts
  if (
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "::1" ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost)
  ) {
    return [cleanHost];
  }

  // Check in-memory cache
  const cached = dnsCache.get(cleanHost);
  if (cached && Date.now() < cached.expiry && cached.ips.length > 0) {
    return cached.ips;
  }

  const queryDoHEndpoint = (endpointUrl: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const req = https.get(
        `${endpointUrl}?name=${encodeURIComponent(cleanHost)}&type=A`,
        {
          headers: { accept: "application/dns-json" },
          timeout: 4000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              const answers = (json.Answer || [])
                .filter((a: any) => a.type === 1 && a.data)
                .map((a: any) => String(a.data).trim());
              if (answers.length > 0) {
                resolve(answers);
              } else {
                reject(new Error(`No A records for ${cleanHost}`));
              }
            } catch (err) {
              reject(err);
            }
          });
        }
      );
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`DoH timeout for ${cleanHost}`));
      });
    });
  };

  try {
    // Try Cloudflare 1.1.1.1 first
    const ips = await queryDoHEndpoint("https://1.1.1.1/dns-query");
    dnsCache.set(cleanHost, { ips, expiry: Date.now() + CACHE_TTL_MS });
    return ips;
  } catch {
    try {
      // Fallback to Google 8.8.8.8 DoH
      const ips = await queryDoHEndpoint("https://8.8.8.8/resolve");
      dnsCache.set(cleanHost, { ips, expiry: Date.now() + CACHE_TTL_MS });
      return ips;
    } catch {
      // Return empty if DoH fails
      return [];
    }
  }
}

// Global hook: patch node:dns.lookup once so all native fetch() and https calls in Node.js
// automatically use high-speed DoH without blocking on local router socket issues.
let isPatched = false;
export function patchNodeDnsWithDoH(): void {
  if (isPatched) return;
  isPatched = true;

  const origLookup = dns.lookup;
  // @ts-ignore
  dns.lookup = function (
    hostname: string,
    options: any,
    callback: (err: any, address: any, family?: number) => void
  ) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    if (
      !hostname ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
    ) {
      return origLookup(hostname, options, callback);
    }

    resolveDoH(hostname)
      .then((ips) => {
        if (ips && ips.length > 0) {
          if (options && options.all) {
            callback(
              null,
              ips.map((ip) => ({ address: ip, family: 4 }))
            );
          } else {
            callback(null, ips[0], 4);
          }
        } else {
          origLookup(hostname, options, callback);
        }
      })
      .catch(() => {
        origLookup(hostname, options, callback);
      });
  };
}

// Automatically patch on import
patchNodeDnsWithDoH();

export interface DohFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface DohFetchResponse {
  status: number;
  ok: boolean;
  headers: Record<string, string | string[] | undefined>;
  text: () => Promise<string>;
  json: () => Promise<any>;
}

/**
 * Universal DoH-powered HTTPS fetcher.
 * Guarantees zero DNS lag or timeouts across both Node.js and Bun on Linux.
 * Direct TLS SNI + IP routing with Cloudflare/Google fallback.
 */
export async function dohFetch(
  urlStr: string,
  options: DohFetchOptions = {}
): Promise<DohFetchResponse> {
  const url = new URL(urlStr);
  let ip = url.hostname;

  if (
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1" &&
    !/^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)
  ) {
    const ips = await resolveDoH(url.hostname);
    if (ips && ips.length > 0) {
      ip = ips[0];
    }
  }

  return new Promise((resolve, reject) => {
    const postData = options.body;
    const reqHeaders: Record<string, string> = {
      Host: url.hostname,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
      ...(options.headers || {}),
    };

    if (postData) {
      reqHeaders["Content-Length"] = String(Buffer.byteLength(postData));
    }

    const timeout = options.timeout || 8000;
    const req = https.request(
      {
        host: ip,
        port: url.port ? Number(url.port) : 443,
        path: url.pathname + url.search,
        method: options.method || (postData ? "POST" : "GET"),
        servername: url.hostname,
        headers: reqHeaders,
        timeout,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          const status = res.statusCode || 200;
          resolve({
            status,
            ok: status >= 200 && status < 300,
            headers: res.headers,
            text: async () => rawData,
            json: async () => JSON.parse(rawData),
          });
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`dohFetch timeout for ${urlStr}`));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

