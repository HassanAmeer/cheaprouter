import { exec } from "child_process";
import util from "util";
import { browsePage, searchWithPlaywright, SearchResultItem } from "./playwrightService";

const execPromise = util.promisify(exec);

export interface AgentReachResponse {
  source: "jina_reader" | "playwright" | "agent_reach_cli" | "tavily" | "wikipedia" | "github_api";
  success: boolean;
  title?: string;
  url?: string;
  markdown: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface WebSearchEngineResult {
  query: string;
  source: string;
  summary?: string;
  results: SearchResultItem[];
}

/**
 * Read any web page into clean, LLM-ready markdown using Jina Reader (zero API fee),
 * with seamless automatic fallback to Playwright for JS-heavy web apps.
 */
export async function readWebPageWithReach(url: string): Promise<AgentReachResponse> {
  if (!url || !url.startsWith("http")) {
    return {
      source: "jina_reader",
      success: false,
      markdown: "",
      error: "Invalid URL provided",
    };
  }

  // Tier 1: Jina Reader (Zero API key required, converts live HTML to clean markdown)
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(jinaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        Accept: "text/plain, text/markdown",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 50 && !text.includes("403 Forbidden") && !text.includes("Access Denied")) {
        const titleMatch = text.match(/^Title:\s*(.+)$/m);
        return {
          source: "jina_reader",
          success: true,
          title: titleMatch ? titleMatch[1].trim() : url,
          url,
          markdown: text.slice(0, 15000), // Cap at 15k chars for optimal LLM context
        };
      }
    }
  } catch (jinaErr: any) {
    console.warn("[Agent Reach] Jina reader failed, trying Playwright fallback:", jinaErr.message);
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
 * Universal Multi-Engine Web Search:
 * 1. Tavily API (if TAVILY_API_KEY is configured)
 * 2. Playwright Headless Browser Real Search (Free, live real-time web results)
 * 3. Wikipedia API (Fallback)
 */
export async function searchWebWithReach(
  query: string,
  limit = 5
): Promise<WebSearchEngineResult> {
  const q = query.trim();
  if (!q) return { query: "", source: "none", results: [] };

  // Tier 1: Tavily API
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

  // Tier 2: Playwright Live Web Search (bypasses blocks via Chromium session)
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
    console.warn("[Agent Reach] Playwright search failed, falling back to Wikipedia:", pwErr);
  }

  // Tier 3: Wikipedia API fallback
  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        q
      )}&utf8=&format=json`
    );
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
  } catch (wikiErr) {
    console.warn("[Agent Reach] Wikipedia search fallback failed:", wikiErr);
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
