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
 * Universal Multi-Engine Web Search:
 * 1. DuckDuckGo Lite (Live internet search for all topics: news, articles, research)
 * 2. Wikipedia Search API (Encyclopedic & factual reference fallback)
 * 3. CoinGecko Live Market Data (For crypto & financial currency checks)
 * 4. Tavily API (if configured)
 * 5. Playwright Headless Browser (Dynamic JavaScript fallback)
 */
export async function searchWebWithReach(
  query: string,
  limit = 5,
  options: { isBackground?: boolean; maxRetries?: number } = {}
): Promise<WebSearchEngineResult> {
  const q = query.trim();
  if (!q) return { query: "", source: "none", results: [] };

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

  // Tier 1: DuckDuckGo Lite (High-speed universal live search across entire web)
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
