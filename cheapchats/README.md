# 🌐 CheapChats: Web Automation, Search & Agent Reach Engine

Comprehensive guide and architectural documentation for the **Web Automation**, **Multi-Engine Search**, and **Autonomous Agent Research** system implemented inside `cheapchats`.

---

## 📌 Quick Answers & Resources

| Service / Tool | Name & Link | API Key Needed? | Free Limit / Pricing |
| :--- | :--- | :---: | :--- |
| **Tier 1 Reader** | [**Jina Reader**](https://jina.ai/reader)<br>GitHub: [jina-ai/reader](https://github.com/jina-ai/reader) | ❌ **No API Key Needed** | **200 requests / min** (Free forever) |
| **Agent Reach** | [**Agent Reach**](https://github.com/Panniantong/agent-reach) | ❌ **No API Key Needed** | Open-source Python & API engine |
| **Tier 2 Browser** | [**Playwright**](https://playwright.dev)<br>GitHub: [microsoft/playwright](https://github.com/microsoft/playwright) | ❌ **No API Key Needed** | Local Headless Chromium / Google Chrome |
| **Web Search** | **Multi-Engine (DuckDuckGo, Bing, Google, Wikipedia)** | ❌ **No API Key Needed** | Free real-time scraping & public APIs |

> 💡 **Key Takeaway:** You do **NOT** need any paid subscriptions or API keys to use this entire system. Everything works out of the box with zero external cost.

---

## 🚀 Architecture: Multi-Tier Strategy

To handle high traffic smoothly and maintain zero server strain, the system operates across two optimized tiers:

```
                  ┌──────────────────────────────────────────────┐
                  │           User Prompt / Agent Task           │
                  └──────────────────────┬───────────────────────┘
                                         │
                   ┌─────────────────────▼──────────────────────┐
                   │    Tier 1 Rate Limiter & Priority Queue     │
                   │           (200 Requests / Minute)          │
                   └─────────────────────┬──────────────────────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
       ┌───────────────────────────┐           ┌───────────────────────────┐
       │     TIER 1 (Fast & Free)  │           │   TIER 2 (Deep & Dynamic) │
       │        Jina Reader        │           │    Playwright Chromium    │
       ├───────────────────────────┤           ├───────────────────────────┤
       │ • 0 MB Browser RAM        │ Fallback  │ • Dynamic JavaScript/SPAs │
       │ • Instant clean Markdown  ├──────────►│ • Full-page Screenshots   │
       │ • 1-2 second response     │           │ • Live browser tabs       │
       └───────────────────────────┘           └───────────────────────────┘
```

---

## ⚡ Tier 1: Jina Reader (`r.jina.ai`)

- **What is it?** Jina Reader is a zero-setup proxy that turns any website URL into clean, readable Markdown that LLMs can digest immediately.
- **How it works:** Prefixing `https://r.jina.ai/` before any URL strips ads, popups, tracking scripts, and stylesheets, returning pure text and links.
- **Example:**
  ```bash
  curl https://r.jina.ai/https://en.wikipedia.org/wiki/Artificial_intelligence
  ```
- **Rate Limiting & Queue Mechanism (`tier1RateLimiter.ts`):**
  - **Limit:** 200 requests in a sliding 60-second window.
  - **Queueing:** If the 200-request threshold is crossed or an HTTP 429 response is received, requests do **not** fail. They are placed into a high-performance in-memory queue.
  - **Auto-Retry (Background):** Background agent runs automatically wait with exponential backoff (`1.5s ➔ 3s ➔ 6s ➔ 12s`) and retry up to 5 times.
  - **Interactive User Retry (Frontend):** Interactive chats display a live Queue Card indicating rate limits, along with a **"⚡ Retry Now"** button.

---

## 🎭 Tier 2: Playwright Headless Browser Automation

- **Implementation:** [`cheapchats/backend/lib/playwrightService.ts`](file:///home/hasan/Documents/reactjs/cheaprouter/cheapchats/backend/lib/playwrightService.ts)
- **Features:**
  1. **Single-Page Application Scraping:** Scrapes complex React, Vue, Angular, and JavaScript-rendered web pages that Jina Reader cannot parse statically.
  2. **Page Screenshots:** Captures full-page screenshots and saves them to `/public/uploads/screenshots/` with immediate Markdown image embeds.
  3. **Headless Search:** Scrapes Bing and DuckDuckGo without being blocked by bot detection.
  4. **Low RAM Footprint:** Uses `/usr/bin/google-chrome` with `--no-sandbox --disable-gpu --disable-dev-shm-usage` flags. Automatically closes browser pages to free memory in under 2 seconds.

---

## 🦅 Agent Reach Engine

- **Implementation:** [`cheapchats/backend/lib/agentReachService.ts`](file:///home/hasan/Documents/reactjs/cheaprouter/cheapchats/backend/lib/agentReachService.ts)
- **Features:**
  1. **Universal Search:** Runs queries across DuckDuckGo, Bing, Google, and Wikipedia.
  2. **YouTube Video Transcripts:** Extracts video captions and transcripts from any YouTube URL for video summarization.
  3. **GitHub Explorer:** Reads repository structures, READMEs, file trees, and specific source code files.
  4. **CLI Bridge:** Integrates directly with the `agent-reach` Python CLI installed on the server.

---

## 🤖 Autonomous Multi-Source Agent Runner

- **Implementation:** [`cheapchats/backend/lib/agentRunnerService.ts`](file:///home/hasan/Documents/reactjs/cheaprouter/cheapchats/backend/lib/agentRunnerService.ts)
- **Supported Sources:**
  - `Google / Web Search`
  - `Twitter / X`
  - `Reddit Discussions`
  - `LinkedIn Insights`
  - `YouTube Transcripts`
  - `GitHub Repositories`
  - `Facebook & Instagram`
  - `Others / Custom Target URLs`
- **Execution Workflow:**
  1. **Parallel Execution:** Uses `Promise.allSettled` to scan all selected platforms simultaneously in under 5 seconds.
  2. **Play / Pause Controls:** Manage agent runs live via the Agent Sidebar (`/api/agents/[id]/play` and `/api/agents/[id]/pause`).
  3. **Live Status Indicators:**
     - 🟢 **Running:** Shows live step (*"Researching Google...", "Scanning Reddit..."*).
     - 🟡 **Paused:** Temporarily halted.
     - ⚪ **Idle / Ready:** Ready for execution.
  4. **Automatic Delivery:**
     - Synthesizes a structured briefing report.
     - Creates or appends to a Chat thread under the agent's name.
     - If the agent is linked to a Project (`projectId`), stores a permanent research checkpoint in **Project Memory**.

---

## 🔌 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/tools/agent-reach` | `GET` | Get real-time Tier 1 metrics (RPM, Queue count, Throttle status). |
| `/api/tools/agent-reach` | `POST` | Read web pages, search, extract YouTube transcripts, or query GitHub. |
| `/api/tools/websearch` | `POST` | Execute fast multi-engine web search with queue support. |
| `/api/tools/playwright` | `POST` | Run headless browser browse, screenshot, or search tasks. |
| `/api/agents/[id]/play` | `POST` | Launch autonomous agent research in background (non-blocking). |
| `/api/agents/[id]/pause` | `POST` | Pause an active agent background task. |
| `/api/agents/[id]/status`| `GET` | Get live agent state (`running`, `paused`, `completed`, `idle`). |

---

## 💾 RAM Consumption & Execution Timing Breakdown

Detailed breakdown of memory footprint, duration, and triggering conditions:

| Tier / Feature | RAM Used | When is it Triggered? (Kab Chalta Hai?) | Duration (Kitni Der?) |
| :--- | :---: | :--- | :---: |
| **Tier 1: Jina Reader** | **0 MB** | **Default Primary (95% of requests):** Regular web pages, articles, documentation, blogs. | 1 – 2 Seconds |
| **Tier 2: Headless Webpage Scrape** | **~100 MB – 150 MB** | **Fallback Only:** Triggered only if Tier 1 fails (e.g. dynamic React/Vue SPAs, bot-protected sites). | 1.5 – 3 Seconds (Auto-closed immediately) |
| **Tier 2: Full-Page Screenshot** | **~120 MB – 180 MB** | Triggered only when the user or AI explicitly requests a visual screenshot (`playwright_screenshot`). | ~2 Seconds (Auto-closed immediately) |
| **Tier 2: Idle State (No Tasks)** | **0 MB** | When no browser scraping is actively running, Chromium is completely closed. | 0 Seconds (Zero idle memory) |

### 🔍 Real-World VPS Scenarios:
- **Single Active Scrape:** Uses **~120 MB RAM** for 2 seconds, then immediately frees it back to the OS via `await browser.close()`.
- **5 Concurrent Scrapes:** Consumes `5 × 120 MB = ~600 MB RAM` for 2–3 seconds.
- **Why It's Safe for a 2GB / 4GB VPS:** Because Tier 1 absorbs 95% of traffic with **0 MB RAM**, Tier 2 only spikes momentarily for difficult pages and never lingers in memory.

---

## 🏢 10,000 Users Production Scaling Strategy

To support 10,000 users without running out of server RAM:

1. **Tier 1 Absorbs 95% of Load:**
   - Jina Reader processes all standard blogs, articles, and documentation.
   - **RAM usage: 0 MB.**
2. **Controlled Concurrency for Tier 2:**
   - Browser tasks are limited to a concurrency pool of 10–15 simultaneous headless instances.
   - Each browser instance uses ~120 MB RAM for 2–3 seconds and is immediately destroyed.
   - Total RAM consumed by browsers never exceeds **2 GB to 4 GB**.
3. **Containerized Production Setup (Optional):**
   - Run `browserless/chrome` in Docker on an isolated container:
     ```bash
     docker run -d -p 3000:3000 --restart always -e "CONCURRENT=15" ghcr.io/browserless/chromium
     ```
   - Connect Playwright via `browserType.connect(wsEndpoint)` for unlimited horizontal scaling.
