import { chromium, Browser, BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

export interface PageCrawlResult {
  url: string;
  title: string;
  content: string;
  markdown?: string;
  links: string[];
  screenshotUrl?: string;
  error?: string;
}

export interface SearchResultItem {
  title: string;
  link: string;
  snippet: string;
}

export interface AutomationStep {
  action: "goto" | "click" | "fill" | "wait" | "screenshot" | "evaluate" | "press";
  url?: string;
  selector?: string;
  value?: string;
  timeout?: number;
  script?: string;
}

// Determine best browser executable path
function getExecutablePath(): string | undefined {
  if (fs.existsSync("/usr/bin/google-chrome")) {
    return "/usr/bin/google-chrome";
  }
  if (fs.existsSync("/usr/bin/chromium-browser")) {
    return "/usr/bin/chromium-browser";
  }
  if (fs.existsSync("/usr/bin/chromium")) {
    return "/usr/bin/chromium";
  }
  return undefined;
}

export async function launchBrowser(): Promise<Browser> {
  const executablePath = getExecutablePath();
  const launchOptions: any = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
    ],
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  return await chromium.launch(launchOptions);
}

/**
 * Browse a web page, render dynamic JavaScript, and extract content & links.
 */
export async function browsePage(
  url: string,
  options: { timeout?: number; waitForSelector?: string; takeScreenshot?: boolean } = {}
): Promise<PageCrawlResult> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();
    const timeout = options.timeout || 25000;

    await page.goto(url, { waitUntil: "domcontentloaded", timeout });

    if (options.waitForSelector) {
      try {
        await page.waitForSelector(options.waitForSelector, { timeout: 5000 });
      } catch (err) {
        console.warn(`[Playwright] Selector ${options.waitForSelector} timeout, continuing anyway`);
      }
    } else {
      // Allow dynamic client hydration
      await page.waitForTimeout(1500);
    }

    const title = await page.title();

    // Extract page metadata, text content, and meaningful links
    const extracted = await page.evaluate(() => {
      // Remove unwanted elements
      const clone = document.body.cloneNode(true) as HTMLElement;
      const removeSelectors = ["script", "style", "noscript", "svg", "canvas", "iframe"];
      removeSelectors.forEach((sel) => {
        clone.querySelectorAll(sel).forEach((el) => el.remove());
      });

      // Extract raw text
      const rawText = clone.innerText || clone.textContent || "";
      const cleanedText = rawText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join("\n");

      // Extract unique outbound links
      const anchorList: string[] = [];
      document.querySelectorAll("a[href]").forEach((a) => {
        const href = (a as HTMLAnchorElement).href;
        if (href && href.startsWith("http") && !anchorList.includes(href)) {
          anchorList.push(href);
        }
      });

      return {
        text: cleanedText.slice(0, 10000), // Cap at 10k chars for optimal token budgeting
        links: anchorList.slice(0, 15),
      };
    });

    let screenshotUrl: string | undefined;
    if (options.takeScreenshot) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "screenshots");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `screenshot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.png`;
        const filePath = path.join(uploadsDir, fileName);
        await page.screenshot({ path: filePath, fullPage: false });
        screenshotUrl = `/uploads/screenshots/${fileName}`;
      } catch (sErr) {
        console.warn("[Playwright] Screenshot capture failed:", sErr);
      }
    }

    return {
      url,
      title: title || url,
      content: extracted.text,
      links: extracted.links,
      screenshotUrl,
    };
  } catch (err: any) {
    console.error(`[Playwright] Browse failed for ${url}:`, err);
    return {
      url,
      title: url,
      content: "",
      links: [],
      error: err.message || "Failed to browse page",
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Capture a screenshot of a web page using headless Playwright.
 */
export async function captureScreenshot(
  url: string,
  options: { fullPage?: boolean; width?: number; height?: number } = {}
): Promise<{ success: boolean; screenshotUrl?: string; base64?: string; error?: string }> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      viewport: {
        width: options.width || 1280,
        height: options.height || 800,
      },
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(1500);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "screenshots");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileName = `screenshot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.png`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = await page.screenshot({
      path: filePath,
      fullPage: Boolean(options.fullPage),
    });

    const base64 = buffer.toString("base64");
    return {
      success: true,
      screenshotUrl: `/uploads/screenshots/${fileName}`,
      base64: `data:image/png;base64,${base64}`,
    };
  } catch (err: any) {
    console.error("[Playwright] Screenshot error:", err);
    return { success: false, error: err.message || "Screenshot capture failed" };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Perform live web search using headless Playwright browser automation
 * Bypasses API keys and bot blocks by using full Chromium browser session.
 */
export async function searchWithPlaywright(
  query: string,
  maxResults = 5
): Promise<SearchResultItem[]> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();
    // Search using Bing which renders fast clean results without complex bot walls in headless
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    const results = await page.evaluate((max) => {
      const items: { title: string; link: string; snippet: string }[] = [];
      const resultElements = document.querySelectorAll("li.b_algo");

      resultElements.forEach((el) => {
        if (items.length >= max) return;
        const titleEl = el.querySelector("h2 a");
        const snippetEl = el.querySelector(".b_caption p, .b_lineclamp");
        if (titleEl) {
          const title = (titleEl.textContent || "").trim();
          const link = (titleEl as HTMLAnchorElement).href || "";
          const snippet = snippetEl ? (snippetEl.textContent || "").trim() : "";
          if (title && link) {
            items.push({ title, link, snippet });
          }
        }
      });
      return items;
    }, maxResults);

    return results;
  } catch (err: any) {
    console.warn("[Playwright] Search error:", err);
    return [];
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

export interface YouTubeSearchResult {
  title: string;
  link: string;
  videoId?: string;
}

/**
 * Search YouTube using Playwright browser automation with fallback to multi-engine search.
 * Returns direct video titles, links, and video IDs.
 */
export async function searchYouTubeWithPlaywright(
  query: string,
  maxResults = 5
): Promise<YouTubeSearchResult[]> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);

    const videos = await page.evaluate((max) => {
      const items: { title: string; link: string; videoId?: string }[] = [];
      const seen = new Set<string>();
      document.querySelectorAll("a#video-title").forEach((a) => {
        if (items.length >= max) return;
        const href = (a as HTMLAnchorElement).href || "";
        const title = ((a as HTMLElement).title || a.textContent || "").trim();
        if (href && href.includes("/watch?v=") && title && !seen.has(href)) {
          seen.add(href);
          const match = href.match(/[?&]v=([^&]+)/);
          items.push({
            title,
            link: href,
            videoId: match ? match[1] : undefined,
          });
        }
      });
      return items;
    }, maxResults);

    if (videos && videos.length > 0) {
      return videos;
    }
  } catch (err: any) {
    console.warn("[Playwright] YouTube direct scrape error, attempting fallback:", err.message);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }

  // Fallback: search Bing for YouTube videos
  try {
    const fallbackResults = await searchWithPlaywright(`site:youtube.com/watch ${query}`, maxResults);
    return fallbackResults
      .filter((r) => r.link && r.link.includes("youtube.com/watch"))
      .map((r) => ({
        title: r.title.replace(/ - YouTube$/, ""),
        link: r.link,
        videoId: r.link.match(/[?&]v=([^&]+)/)?.[1],
      }));
  } catch (fbErr) {
    console.warn("[Playwright] YouTube fallback search failed:", fbErr);
    return [];
  }
}

/**
 * Execute multi-step browser automation script.
 */
export async function executeAutomation(
  steps: AutomationStep[]
): Promise<{ success: boolean; results: any[]; error?: string }> {
  let browser: Browser | null = null;
  const results: any[] = [];
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      switch (step.action) {
        case "goto":
          if (step.url) {
            await page.goto(step.url, { waitUntil: "domcontentloaded", timeout: 25000 });
            results.push({ step: i, action: "goto", url: step.url, title: await page.title() });
          }
          break;
        case "click":
          if (step.selector) {
            await page.click(step.selector, { timeout: step.timeout || 5000 });
            results.push({ step: i, action: "click", selector: step.selector });
          }
          break;
        case "fill":
          if (step.selector && step.value !== undefined) {
            await page.fill(step.selector, step.value, { timeout: step.timeout || 5000 });
            results.push({ step: i, action: "fill", selector: step.selector, value: step.value });
          }
          break;
        case "press":
          if (step.selector && step.value) {
            await page.press(step.selector, step.value);
            results.push({ step: i, action: "press", key: step.value });
          }
          break;
        case "wait":
          await page.waitForTimeout(step.timeout || 1000);
          results.push({ step: i, action: "wait", duration: step.timeout || 1000 });
          break;
        case "screenshot": {
          const uploadsDir = path.join(process.cwd(), "public", "uploads", "screenshots");
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const fileName = `step_${i}_${Date.now()}.png`;
          await page.screenshot({ path: path.join(uploadsDir, fileName) });
          results.push({ step: i, action: "screenshot", url: `/uploads/screenshots/${fileName}` });
          break;
        }
        case "evaluate":
          if (step.script) {
            const evalResult = await page.evaluate(step.script);
            results.push({ step: i, action: "evaluate", result: evalResult });
          }
          break;
      }
    }

    return { success: true, results };
  } catch (err: any) {
    return { success: false, results, error: err.message };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
