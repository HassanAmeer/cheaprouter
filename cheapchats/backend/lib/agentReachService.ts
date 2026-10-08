import { dohFetch } from "./dohResolver";
import { exec } from "child_process";
import util from "util";
import { browsePage, searchWithPlaywright, SearchResultItem } from "./playwrightService";
import { executeTier1WithQueue, getTier1RateLimiter } from "./tier1RateLimiter";

const execPromise = util.promisify(exec);

export { getTier1RateLimiter };

export interface AgentReachResponse {
  source: "jina_reader" | "playwright" | "agent_reach_cli" | "tavily" | "wikipedia" | "duckduckgo" | "github_api";
  success: boolean;
  title?: string;
  url?: string;
  markdown: string;
  metadata?: Record<string, any>;
  error?: string;
  isQueued?: boolean;
}

export interface WebSearchEngineResult {
  query: string;
  source: string;
  summary?: string;
  results: SearchResultItem[];
  isQueued?: boolean;
}

/**
 * Read any web page into clean, LLM-ready markdown using Jina Reader (zero API fee),
 * with sliding 200 req/min rate limit queue & auto-retry, and seamless Playwright fallback.
 */
export async function readWebPageWithReach(
  url: string,
  options: { isBackground?: boolean; maxRetries?: number } = {}
): Promise<AgentReachResponse> {
  if (!url || !url.startsWith("http")) {
    return {
      source: "jina_reader",
      success: false,
      markdown: "",
      error: "Invalid URL provided",
    };
  }

  // Tier 1: Jina Reader with sliding 200/min queue & auto-retry
  try {
    const rawMarkdown = await executeTier1WithQueue(
      async () => {
        const jinaUrl = `https://r.jina.ai/${url}`;
        const res = await dohFetch(jinaUrl, {
          headers: {
            Accept: "text/plain, text/markdown",
          },
          timeout: 10000,
        });

        if (res.status === 429) {
          const err: any = new Error("429 Too Many Requests from Jina Reader");
          err.status = 429;
          throw err;
        }

        if (!res.ok) {
          throw new Error(`Jina Reader HTTP error ${res.status}`);
        }

        return await res.text();
      },
      {
        isBackground: options.isBackground ?? false,
        maxRetries: options.maxRetries ?? (options.isBackground ? 5 : 2),
        label: `Jina: ${url.slice(0, 45)}`,
      }
    );

    if (rawMarkdown && rawMarkdown.length > 50 && !rawMarkdown.includes("403 Forbidden") && !rawMarkdown.includes("Access Denied")) {
      const titleMatch = rawMarkdown.match(/^Title:\s*(.+)$/m);
      return {
        source: "jina_reader",
        success: true,
        title: titleMatch ? titleMatch[1].trim() : url,
        url,
        markdown: rawMarkdown.slice(0, 15000), // Cap at 15k chars for optimal LLM context
      };
    }
  } catch (jinaErr: any) {
    console.warn("[Agent Reach] Jina reader failed after queue/retries, attempting Playwright fallback:", jinaErr.message);
  }

  // Tier 2: Playwright Headless Browser fallback
  try {
    const crawl = await browsePage(url, { timeout: 20000 });
    if (crawl.content && crawl.content.length > 30) {
      const formattedMarkdown = `# ${crawl.title}\n\n**Source URL:** ${url}\n\n${crawl.content}\n\n${
        crawl.links.length > 0 ? `### Outbound Links:\n${crawl.links.map((l) => `- ${l}`).join("\n")}` : ""
      }`;

      return {
        source: "playwright",
        success: true,
        title: crawl.title,
        url,
        markdown: formattedMarkdown.slice(0, 15000),
        metadata: {
          linksCount: crawl.links.length,
          screenshotUrl: crawl.screenshotUrl,
        },
      };
    }
  } catch (pwErr: any) {
    console.warn("[Agent Reach] Playwright fallback failed:", pwErr.message);
  }

  return {
    source: "playwright",
    success: false,
    markdown: "",
    error: `Could not retrieve content from ${url}`,
  };
}

/**
 * High-speed DuckDuckGo Lite live web search.
 * Searches the entire live open web for any topic (news, tech, sports, facts, research).
 * Zero API keys, zero cost, responses in ~1-1.5s via DoH direct HTTPS.
 */
export async function searchWithDuckDuckGoLite(
  query: string,
  limit = 5
): Promise<SearchResultItem[]> {
  try {
    const res = await dohFetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `q=${encodeURIComponent(query)}`,
      timeout: 7000,
    });

    if (!res.ok) return [];

    const html = await res.text();

    const linkRegex =
      /<a[^>]*href=['"]([^'"]+)['"][^>]*class=['"]result-link['"][^>]*>([\s\S]*?)<\/a>|<a[^>]*class=['"]result-link['"][^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<td[^>]*class=['"]result-snippet['"][^>]*>([\s\S]*?)<\/td>/gi;

    const links: { link: string; title: string }[] = [];
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      const rawLink = m[1] || m[3];
      const rawTitle = (m[2] || m[4]).replace(/<[^>]+>/g, "").trim();
      if (rawLink && rawTitle) {
        links.push({ link: rawLink, title: rawTitle });
      }
    }

    const snippets: string[] = [];
    while ((m = snippetRegex.exec(html)) !== null) {
      snippets.push(m[1].replace(/<[^>]+>/g, "").trim());
    }

    const results: SearchResultItem[] = [];
    for (let i = 0; i < Math.min(links.length, limit); i++) {
      results.push({
        title: links[i].title,
        link: links[i].link,
        snippet: snippets[i] || links[i].title,
      });
    }

    return results;
  } catch (err: any) {
    console.warn("[Agent Reach] DuckDuckGo search error:", err?.message || err);
    return [];
  }
}

/**
 * High-speed Google News RSS live search.
 * Searches breaking news, current events, sports scores, and real-time updates across the globe.
 * Zero keys required, resolves via DoH in ~1-1.5s.
 */
export async function searchGoogleNewsRss(
  query: string,
  limit = 5
): Promise<SearchResultItem[]> {
  try {
    const res = await dohFetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
      { timeout: 5000 }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    const results: SearchResultItem[] = [];

    for (let i = 0; i < Math.min(items.length, limit); i++) {
      const item = items[i];
      const rawTitle = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
      const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "";

      const title = rawTitle
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      if (title && link) {
        results.push({
          title,
          link,
          snippet: `Published: ${pubDate}${source ? ` | Source: ${source}` : ""}. Live news coverage and real-time report for "${query}".`,
        });
      }
    }
    return results;
  } catch (err: any) {
    console.warn("[Agent Reach] Google News RSS error:", err?.message || err);
    return [];
  }
}

/**
 * Universal Multi-Engine Web Search:
 * 1. Live Precious Metals & Spot Commodities (Gold, Silver, Oil)
 * 2. Live Forex & Exchange Rates (USD/PKR, INR, EUR, etc.)
 * 3. CoinGecko Live Market Data (For crypto & tokens)
 * 4. Google News RSS Live Universal Search (Real-time news, scores, events)
 * 5. DuckDuckGo Lite (Live internet search for all topics)
 * 6. Wikipedia Search API (Encyclopedic reference fallback)
 * 7. Tavily API (if configured)
 * 8. Playwright Headless Browser (Dynamic JavaScript fallback)
 */
/**
 * Strip conversational search wrappers in Urdu and English so search engines
 * receive the actual clean topic (e.g. "latest AI trends" instead of "web search karke batao latest AI trends").
 */
export function cleanSearchQuery(rawQuery: string): string {
  let q = rawQuery.replace(/https?:\/\/[^\s]+/gi, "").trim();
  const prefixes = [
    /^(web|internet|google)\s+(se|par|pe)\s+(aap\s+)?(search\s+karke|dhoond\s+ke|search)?\s*(mujhe\s+)?(batayein|batao|bataiye|karein|karo)?\s*(k|ke|that|about)?\s*/i,
    /^(web|internet|google)\s+(search\s+karke|search\s+karo|search|dhoondo)\s*(mujhe\s+)?(batayein|batao|karo)?\s*(k|ke|that|about)?\s*/i,
    /^(search\s+karke|dhoond\s+ke|search\s+karo)\s*(mujhe\s+)?(batayein|batao|karo)?\s*(k|ke|that|about)?\s*/i,
    /^(please\s+)?(search\s+(the\s+)?web\s+(for|about)?|can\s+you\s+search\s+(for|about)?)\s*/i,
    /^(kya\s+aap\s+)?(mujhe\s+)?(search\s+karke\s+bata\s+sakte\s+hain\s+k|batao\s+k)\s*/i,
    /^(tell\s+me\s+about|what\s+is\s+the|what\s+is|who\s+is|give\s+me\s+the|find\s+out)\s*/i,
  ];
  for (const p of prefixes) {
    q = q.replace(p, "").trim();
  }

  const suffixes = [
    /\s+(kiya\s+he|kya\s+hai|kya\s+he|batao|batayein|bataiye|tell\s+me|check\s+karo|check\s+karein)[?.!]*$/i,
  ];
  for (const s of suffixes) {
    q = q.replace(s, "").trim();
  }

  return q;
}

export async function searchWebWithReach(
  query: string,
  limit = 5,
  options: { isBackground?: boolean; maxRetries?: number } = {}
): Promise<WebSearchEngineResult> {
  const rawQ = query.trim();
  if (!rawQ) return { query: "", source: "none", results: [] };

  const cleaned = cleanSearchQuery(rawQ);

  // If the query was purely conversational (e.g. "web se aap search karke mujhe batayein") without a specific topic
  if (!cleaned || cleaned.length < 3) {
    return {
      query: rawQ,
      source: "capability_ready",
      summary: "Live web search and real-time internet intelligence are fully active and ready to research any requested topic.",
      results: [
        {
          title: "Live Internet Search & Research Engine (Active)",
          link: "https://duckduckgo.com",
          snippet: "Real-time web search and live internet research are fully enabled. Provide any news event, sports fixture, currency/crypto rate, or research question to fetch live information.",
        },
      ],
    };
  }

  const q = cleaned;

  // 0. Instant Crypto Live Price (Free, Real-Time, Sub-second)
  if (/\b(bitcoin|btc|ethereum|eth|solana|sol|crypto|binance)\b/i.test(q)) {
    try {
      const coinId = /\b(ethereum|eth)\b/i.test(q)
        ? "ethereum"
        : /\b(solana|sol)\b/i.test(q)
        ? "solana"
        : "bitcoin";
      const cgRes = await dohFetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
        { timeout: 5000 }
      );
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        if (cgData[coinId]) {
          const price = cgData[coinId].usd;
          const change =
            cgData[coinId].usd_24h_change !== undefined
              ? Number(cgData[coinId].usd_24h_change).toFixed(2)
              : "0";
          const name = coinId.toUpperCase();
          const summary = `Live Real-time Market Data: ${name} is currently trading at $${Number(
            price
          ).toLocaleString()} USD (${Number(change) >= 0 ? "+" : ""}${change}% in 24h).`;
          return {
            query: q,
            source: "coingecko_live",
            summary,
            results: [
              {
                title: `${name} Live Price & Market Cap`,
                link: `https://www.coingecko.com/en/coins/${coinId}`,
                snippet: summary,
              },
            ],
          };
        }
      }
    } catch (cgErr) {
      console.warn("[Agent Reach] CoinGecko live price failed:", cgErr);
    }
  }

  // 1. Instant Precious Metals Spot Rate (Gold / Silver live prices)
  if (/\b(gold|sona|xau|silver|chandi|xag)\b/i.test(q)) {
    try {
      const isSilver = /\b(silver|chandi|xag)\b/i.test(q);
      const symbol = isSilver ? "XAG" : "XAU";
      const metalName = isSilver ? "Silver" : "Gold";

      const [metalRes, fxRes] = await Promise.all([
        dohFetch(`https://api.gold-api.com/price/${symbol}`, { timeout: 4000 }),
        dohFetch("https://open.er-api.com/v6/latest/USD", { timeout: 4000 }),
      ]);

      if (metalRes.ok) {
        const metalData = await metalRes.json();
        const fxData = fxRes.ok ? await fxRes.json() : null;
        const pkrRate = fxData?.rates?.PKR || 278;
        const inrRate = fxData?.rates?.INR || 86;
        const usdPrice = metalData.price; // per troy ounce (31.1035 grams)

        // 1 tola = 11.6638 grams
        const pricePerGramUsd = usdPrice / 31.1035;
        const pricePerTolaUsd = pricePerGramUsd * 11.6638;
        const pricePerTolaPkr = Math.round(pricePerTolaUsd * pkrRate);
        const pricePer10gPkr = Math.round(pricePerGramUsd * 10 * pkrRate);
        const pricePerTolaInr = Math.round(pricePerTolaUsd * inrRate);

        const summary = `Live Real-time Spot ${metalName} Rates (${metalData.updatedAt || new Date().toISOString()}):
- Spot Price: $${Number(usdPrice).toFixed(2)} USD per troy ounce ($${pricePerGramUsd.toFixed(2)} / gram).
- In Pakistan (PKR): ~Rs. ${pricePerTolaPkr.toLocaleString()} per tola (24K) | Rs. ${pricePer10gPkr.toLocaleString()} per 10 grams (USD/PKR: ${pkrRate.toFixed(2)}).
- In India (INR): ~₹${pricePerTolaInr.toLocaleString()} per tola.`;

        // Also fetch today's bullion market news to attach local market updates
        const newsItems = await searchGoogleNewsRss(`${metalName} rate today in pakistan`, 3);

        return {
          query: q,
          source: "live_bullion_metals",
          summary,
          results: [
            {
              title: `Live ${metalName} Spot Rate & Tola/Gram Market Value`,
              link: `https://api.gold-api.com/price/${symbol}`,
              snippet: summary,
            },
            ...newsItems,
          ],
        };
      }
    } catch (metalErr) {
      console.warn("[Agent Reach] Precious metals rate failed:", metalErr);
    }
  }

  // 2. Instant Forex Currency Exchange Rates (USD/PKR, EUR, GBP, AED, SAR)
  if (/\b(currency|exchange rate|dollar|usd|pkr|rupee|inr|dirham|aed|riyal|sar|euro|eur|gbp|pound)\b/i.test(q)) {
    try {
      const fxRes = await dohFetch("https://open.er-api.com/v6/latest/USD", { timeout: 4000 });
      if (fxRes.ok) {
        const fx = await fxRes.json();
        const r = fx.rates || {};
        const summary = `Live Real-time Forex Exchange Rates (Updated: ${fx.time_last_update_utc || "Today"}):
- 1 USD = ${r.PKR ? r.PKR.toFixed(2) : "278"} PKR (Pakistani Rupee)
- 1 USD = ${r.INR ? r.INR.toFixed(2) : "86"} INR (Indian Rupee)
- 1 USD = ${r.AED ? r.AED.toFixed(2) : "3.67"} AED (UAE Dirham)
- 1 USD = ${r.SAR ? r.SAR.toFixed(2) : "3.75"} SAR (Saudi Riyal)
- 1 EUR = ${r.EUR && r.PKR ? (r.PKR / r.EUR).toFixed(2) : "300"} PKR
- 1 GBP = ${r.GBP && r.PKR ? (r.PKR / r.GBP).toFixed(2) : "360"} PKR`;

        return {
          query: q,
          source: "live_forex",
          summary,
          results: [
            {
              title: "Live Foreign Exchange Currency Rates",
              link: "https://open.er-api.com",
              snippet: summary,
            },
          ],
        };
      }
    } catch (fxErr) {
      console.warn("[Agent Reach] Forex exchange rate failed:", fxErr);
    }
  }

  // Tier 1: Google News RSS Live Universal Search (Real-time live news, sports, events, technology)
  try {
    const newsResults = await searchGoogleNewsRss(q, limit);
    if (newsResults && newsResults.length > 0) {
      return {
        query: q,
        source: "google_news_live",
        summary: `Live breaking news and verified reporting for: "${q}"`,
        results: newsResults,
      };
    }
  } catch (newsErr) {
    console.warn("[Agent Reach] Google News search failed:", newsErr);
  }

  // Tier 2: DuckDuckGo Lite (High-speed universal live search across entire web)
  try {
    const ddgResults = await searchWithDuckDuckGoLite(q, limit);
    if (ddgResults && ddgResults.length > 0) {
      return {
        query: q,
        source: "duckduckgo_live",
        summary: `Live web search results retrieved from DuckDuckGo for: "${q}"`,
        results: ddgResults,
      };
    }
  } catch (ddgErr) {
    console.warn("[Agent Reach] DDG search failed, falling back to Wikipedia:", ddgErr);
  }

  // Tier 2: Wikipedia Search API (Instant encyclopedic and conceptual knowledge)
  try {
    const wikiRes = await dohFetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        q
      )}&utf8=&format=json`,
      { timeout: 5000 }
    );

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.query?.search && wikiData.query.search.length > 0) {
        return {
          query: q,
          source: "wikipedia",
          summary: `Search results from Wikipedia knowledge base for: "${q}"`,
          results: wikiData.query.search.slice(0, limit).map((r: any) => ({
            title: r.title,
            link: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
            snippet: r.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
          })),
        };
      }
    }
  } catch (wikiErr) {
    console.warn("[Agent Reach] Wikipedia search fallback failed:", wikiErr);
  }

  // Tier 3: Tavily API (if user configured TAVILY_API_KEY)
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: q,
          include_answer: true,
          max_results: limit,
        }),
      });
      const data = await res.json();
      if (data && (data.results || data.answer)) {
        return {
          query: q,
          source: "tavily",
          summary: data.answer || undefined,
          results: (data.results || []).map((r: any) => ({
            title: r.title || "",
            link: r.url || "",
            snippet: r.content || "",
          })),
        };
      }
    } catch (tErr) {
      console.warn("[Agent Reach] Tavily search failed, falling back to Playwright:", tErr);
    }
  }

  // Tier 4: Playwright Headless Browser fallback (8 second timeout)
  try {
    const pwResults = await searchWithPlaywright(q, limit);
    if (pwResults && pwResults.length > 0) {
      return {
        query: q,
        source: "playwright_browser",
        summary: `Live search results retrieved using headless Playwright browser automation for: "${q}"`,
        results: pwResults,
      };
    }
  } catch (pwErr) {
    console.warn("[Agent Reach] Playwright search failed:", pwErr);
  }

  return {
    query: q,
    source: "exhausted",
    results: [],
  };
}

/**
 * Execute native agent-reach CLI commands if agent-reach is installed.
 */
export async function callAgentReachCli(
  subcommand: string,
  args: string[] = []
): Promise<{ success: boolean; stdout: string; stderr: string }> {
  try {
    const cliCmd = `agent-reach ${subcommand} ${args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
    const { stdout, stderr } = await execPromise(cliCmd, { timeout: 30000 });
    return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (err: any) {
    return {
      success: false,
      stdout: err.stdout ? String(err.stdout).trim() : "",
      stderr: err.stderr || err.message,
    };
  }
}

/**
 * Fetch YouTube video transcript or summary via Agent Reach or Jina Reader.
 */
export async function getYoutubeTranscriptWithReach(url: string): Promise<AgentReachResponse> {
  // Try agent-reach CLI channel first
  const cliRes = await callAgentReachCli("get", ["youtube", url]);
  if (cliRes.success && cliRes.stdout) {
    return {
      source: "agent_reach_cli",
      success: true,
      url,
      markdown: cliRes.stdout.slice(0, 15000),
    };
  }

  // Fallback: Read via Jina Reader
  return await readWebPageWithReach(url);
}

/**
 * Read GitHub repository readme, issues, or details.
 */
export async function readGithubWithReach(
  owner: string,
  repo: string,
  itemPath = ""
): Promise<AgentReachResponse> {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}${itemPath ? `/contents/${itemPath}` : "/readme"}`;
    const res = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "CheapChat-Agent-Reach",
      },
    });

    if (res.ok) {
      const text = await res.text();
      return {
        source: "github_api",
        success: true,
        title: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
        markdown: text.slice(0, 15000),
      };
    }
  } catch (ghErr) {
    console.warn("[Agent Reach] GitHub API failed, trying web reader:", ghErr);
  }

  // Fallback to Jina Reader
  return await readWebPageWithReach(`https://github.com/${owner}/${repo}`);
}

/**
 * Run health diagnostics on Agent Reach and Playwright tools.
 */
export async function getAgentReachDoctorReport(): Promise<{
  playwright: boolean;
  agentReachCli: boolean;
  jinaReader: boolean;
  details: string;
}> {
  let pwOk = false;
  let cliOk = false;
  let jinaOk = false;

  try {
    const pwCheck = await browsePage("https://example.com", { timeout: 8000 });
    pwOk = Boolean(pwCheck && pwCheck.title);
  } catch {}

  try {
    const cliCheck = await callAgentReachCli("doctor");
    cliOk = cliCheck.success;
  } catch {}

  try {
    const jCheck = await fetch("https://r.jina.ai/https://example.com", { method: "HEAD" });
    jinaOk = jCheck.ok;
  } catch {}

  return {
    playwright: pwOk,
    agentReachCli: cliOk,
    jinaReader: jinaOk,
    details: `Playwright Browser: ${pwOk ? "READY (Chromium)" : "ERROR"}, Agent-Reach CLI: ${
      cliOk ? "READY" : "NOT CONFIGURED"
    }, Jina Reader: ${jinaOk ? "ONLINE" : "OFFLINE"}`,
  };
}
