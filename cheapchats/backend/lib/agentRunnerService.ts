import { db } from "@cheapchats/backend/db";
import { agents, conversations, messages, memories } from "@cheapchats/backend/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  readWebPageWithReach,
  searchWebWithReach,
  getYoutubeTranscriptWithReach,
  callAgentReachCli,
} from "./agentReachService";
import { browsePage, captureScreenshot } from "./playwrightService";

export interface AgentTaskOptions {
  query?: string;
  projectId?: string | null;
  conversationId?: string | null;
  targetUrls?: string[];
  mode?: "background" | "tabs" | "both";
}

// In-memory active runner states for real-time play/pause status
const activeAgentStates: Map<
  string,
  {
    state: "idle" | "running" | "paused" | "completed";
    currentStep?: string;
    lastRunAt?: number;
    lastSummary?: string;
    timerId?: any;
  }
> = new Map();

export function getAgentStatus(agentId: string) {
  const current = activeAgentStates.get(agentId);
  if (current) return current;

  // Check saved DB capabilities
  const agentEntry = db.select().from(agents).where(eq(agents.id, agentId)).get();
  if (agentEntry?.capabilities) {
    try {
      const parsed = JSON.parse(agentEntry.capabilities);
      return {
        state: parsed.executionState || "idle",
        lastRunAt: parsed.lastRunAt || null,
        lastSummary: parsed.lastRunSummary || null,
      };
    } catch {}
  }

  return { state: "idle" as const };
}

export function pauseAgent(agentId: string) {
  const current = activeAgentStates.get(agentId) || { state: "idle" };
  if (current.timerId) {
    clearInterval(current.timerId);
    current.timerId = undefined;
  }
  current.state = "paused";
  current.currentStep = "Paused by user";
  activeAgentStates.set(agentId, current);

  // Persist to DB
  updateAgentCapabilityState(agentId, { executionState: "paused" });
  return current;
}

function updateAgentCapabilityState(agentId: string, updates: Record<string, any>) {
  try {
    const agentEntry = db.select().from(agents).where(eq(agents.id, agentId)).get();
    if (!agentEntry) return;

    let caps: Record<string, any> = {};
    try {
      caps = JSON.parse(agentEntry.capabilities || "{}");
    } catch {}

    const newCaps = { ...caps, ...updates };
    db.update(agents)
      .set({ capabilities: JSON.stringify(newCaps) })
      .where(eq(agents.id, agentId))
      .run();
  } catch (err) {
    console.warn("Failed to persist agent state:", err);
  }
}

/**
 * Execute automated multi-source research for a given agent
 */
export async function executeAgentResearch(agentId: string, options: AgentTaskOptions = {}) {
  const agentEntry = db.select().from(agents).where(eq(agents.id, agentId)).get();
  if (!agentEntry) {
    throw new Error(`Agent ${agentId} not found`);
  }

  let caps: Record<string, any> = {};
  try {
    caps = JSON.parse(agentEntry.capabilities || "{}");
  } catch {}

  const sources: string[] = Array.isArray(caps.sources) && caps.sources.length > 0
    ? caps.sources
    : ["google", "reddit", "youtube"];

  const mode = options.mode || caps.mode || "background";
  const targetUrls: string[] = options.targetUrls || caps.targetUrls || [];
  const searchQuery = options.query || caps.defaultQuery || agentEntry.name;

  // Mark running
  const stateObj = {
    state: "running" as const,
    currentStep: "Starting automated multi-platform research...",
    lastRunAt: Date.now(),
  };
  activeAgentStates.set(agentId, stateObj);
  updateAgentCapabilityState(agentId, { executionState: "running", lastRunAt: Date.now() });

  console.log(`[AGENT RUNNER] Agent ${agentEntry.name} (${agentId}) running on sources:`, sources);

  const collectedData: {
    platform: string;
    title: string;
    link?: string;
    content: string;
  }[] = [];

  try {
    const fetchTasks: Promise<void>[] = [];

    // 1. Google / Web Search
    if (sources.includes("google") || sources.includes("web")) {
      fetchTasks.push((async () => {
        try {
          const searchRes = await searchWebWithReach(searchQuery, 4, { isBackground: true, maxRetries: 5 });
          if (searchRes.results && searchRes.results.length > 0) {
            searchRes.results.forEach((r) => {
              collectedData.push({
                platform: "Google / Web Search",
                title: r.title,
                link: r.link,
                content: r.snippet,
              });
            });
          }
        } catch (e) {
          console.warn("[AgentRunner] Google search error:", e);
        }
      })());
    }

    // 2. Twitter / X Research
    if (sources.includes("twitter")) {
      fetchTasks.push((async () => {
        try {
          const twRes = await searchWebWithReach(`site:x.com OR site:twitter.com ${searchQuery}`, 3, { isBackground: true, maxRetries: 5 });
          twRes.results.forEach((r) => {
            collectedData.push({
              platform: "Twitter / X",
              title: r.title,
              link: r.link,
              content: r.snippet,
            });
          });
        } catch (e) {
          console.warn("[AgentRunner] Twitter search error:", e);
        }
      })());
    }

    // 3. Reddit Discussions
    if (sources.includes("reddit")) {
      fetchTasks.push((async () => {
        try {
          const redditRes = await searchWebWithReach(`site:reddit.com ${searchQuery}`, 3, { isBackground: true, maxRetries: 5 });
          redditRes.results.forEach((r) => {
            collectedData.push({
              platform: "Reddit",
              title: r.title,
              link: r.link,
              content: r.snippet,
            });
          });
        } catch (e) {
          console.warn("[AgentRunner] Reddit search error:", e);
        }
      })());
    }

    // 4. LinkedIn Insights
    if (sources.includes("linkedin")) {
      fetchTasks.push((async () => {
        try {
          const liRes = await searchWebWithReach(`site:linkedin.com/pulse OR site:linkedin.com/company ${searchQuery}`, 3, { isBackground: true, maxRetries: 5 });
          liRes.results.forEach((r) => {
            collectedData.push({
              platform: "LinkedIn",
              title: r.title,
              link: r.link,
              content: r.snippet,
            });
          });
        } catch (e) {
          console.warn("[AgentRunner] LinkedIn search error:", e);
        }
      })());
    }

    // 5. YouTube Video Transcripts
    if (sources.includes("youtube")) {
      fetchTasks.push((async () => {
        try {
          const ytSearch = await searchWebWithReach(`site:youtube.com/watch ${searchQuery}`, 2, { isBackground: true, maxRetries: 5 });
          for (const item of ytSearch.results) {
            if (item.link) {
              const transcriptData = await getYoutubeTranscriptWithReach(item.link);
              collectedData.push({
                platform: "YouTube",
                title: item.title,
                link: item.link,
                content: transcriptData.markdown ? transcriptData.markdown.slice(0, 1500) : item.snippet,
              });
            }
          }
        } catch (e) {
          console.warn("[AgentRunner] YouTube search error:", e);
        }
      })());
    }

    // 6. GitHub Repositories
    if (sources.includes("github")) {
      fetchTasks.push((async () => {
        try {
          const ghRes = await searchWebWithReach(`site:github.com ${searchQuery}`, 3, { isBackground: true, maxRetries: 5 });
          ghRes.results.forEach((r) => {
            collectedData.push({
              platform: "GitHub",
              title: r.title,
              link: r.link,
              content: r.snippet,
            });
          });
        } catch (e) {
          console.warn("[AgentRunner] GitHub search error:", e);
        }
      })());
    }

    // 7. Custom URLs / "Others" (Direct Crawl with Jina + Playwright)
    if (sources.includes("others") || targetUrls.length > 0) {
      for (const url of targetUrls) {
        if (url && url.startsWith("http")) {
          fetchTasks.push((async () => {
            try {
              const crawlRes = await readWebPageWithReach(url, { isBackground: true, maxRetries: 5 });
              if (crawlRes.success) {
                collectedData.push({
                  platform: "Custom Web Crawl",
                  title: crawlRes.title || url,
                  link: url,
                  content: crawlRes.markdown ? crawlRes.markdown.slice(0, 2000) : "Content scraped successfully.",
                });
              }
            } catch (e) {
              console.warn("[AgentRunner] Custom URL crawl error:", e);
            }
          })());
        }
      }
    }

    stateObj.currentStep = `Executing parallel scans across ${fetchTasks.length} channels...`;
    await Promise.allSettled(fetchTasks);

    // Construct the Synthesized Research Report
    stateObj.currentStep = "Compiling final briefing report...";

    const nowIso = new Date().toLocaleString();
    let reportMarkdown = `## 🦅 Agent Research Briefing: **${searchQuery}**\n\n`;
    reportMarkdown += `*Conducted autonomously by **${agentEntry.name}** at ${nowIso}*\n\n`;
    reportMarkdown += `### 📌 Executive Summary\n`;
    reportMarkdown += `Analyzed **${collectedData.length}** source points across platforms: **${sources.join(", ")}**.\n\n`;

    if (collectedData.length === 0) {
      reportMarkdown += `No live data could be retrieved for "${searchQuery}". Please check the search terms or platform permissions.\n`;
    } else {
      // Group by Platform
      const grouped: Record<string, typeof collectedData> = {};
      collectedData.forEach((item) => {
        if (!grouped[item.platform]) grouped[item.platform] = [];
        grouped[item.platform].push(item);
      });

      for (const [platform, items] of Object.entries(grouped)) {
        reportMarkdown += `### 🌐 ${platform}\n`;
        items.forEach((item) => {
          reportMarkdown += `- **[${item.title}](${item.link || "#"})**\n`;
          reportMarkdown += `  ${item.content.replace(/\n+/g, " ").trim()}\n\n`;
        });
      }

      reportMarkdown += `### 💡 Key Takeaways & Recommendations\n`;
      reportMarkdown += `1. **Cross-Platform Verification:** Data collected from ${Object.keys(grouped).join(", ")} shows active public interest and real-time activity.\n`;
      reportMarkdown += `2. **Action Item:** Review relevant links and verify latest updates.\n\n`;
    }

    // Append Live Browser Action Tag if Mode is "tabs" or "both"
    if (mode === "tabs" || mode === "both") {
      const primaryLink = collectedData[0]?.link || `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      reportMarkdown += `\n<cheapchatAgent action="open_browser" data="${primaryLink}" />\n`;
    }

    // DELIVER TO CHATS & PROJECTS
    stateObj.currentStep = "Delivering report to Chat & Project...";

    // Determine target conversation
    let targetConvId: string = options.conversationId || "";
    const targetProjectId = options.projectId || caps.targetProjectId || null;

    if (!targetConvId) {
      // Find existing chat for this agent or create new
      const existingConv = db
        .select()
        .from(conversations)
        .where(eq(conversations.agentId, agentId))
        .orderBy(desc(conversations.updatedAt))
        .get();

      if (existingConv) {
        targetConvId = existingConv.id;
      } else {
        targetConvId = `conv_agt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        db.insert(conversations)
          .values({
            id: targetConvId,
            userId: agentEntry.userId,
            title: `Research: ${searchQuery}`,
            model: agentEntry.model,
            provider: "Agent Runner",
            projectId: targetProjectId,
            agentId: agentId,
            systemPrompt: agentEntry.systemPrompt,
            isPinned: 0,
            isBookmarked: 0,
            isIncognito: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .run();
      }
    }

    // Insert assistant message in chat
    const messageId = `msg_agt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    db.insert(messages)
      .values({
        id: messageId,
        conversationId: targetConvId,
        sender: "assistant",
        content: reportMarkdown,
        model: agentEntry.model,
        provider: "Agent Runner",
        tokens: Math.ceil(reportMarkdown.length / 4),
        cost: 0,
        createdAt: Date.now(),
      })
      .run();

    // Update conversation timestamp
    if (targetConvId) {
      db.update(conversations)
        .set({ updatedAt: Date.now(), projectId: targetProjectId || undefined })
        .where(eq(conversations.id, targetConvId))
        .run();
    }

    // If attached to a Project, store a Project Memory Checkpoint
    if (targetProjectId) {
      try {
        const memKey = `project_research_${targetProjectId}_${agentId}`;
        const existingMem = db.select().from(memories).where(eq(memories.key, memKey)).get();
        const memValue = `Research Briefing [${agentEntry.name}]: ${searchQuery} (${collectedData.length} items)`;

        if (existingMem) {
          db.update(memories)
            .set({ value: memValue, content: reportMarkdown })
            .where(eq(memories.id, existingMem.id))
            .run();
        } else {
          db.insert(memories)
            .values({
              id: `mem_res_${Date.now()}`,
              userId: agentEntry.userId,
              key: memKey,
              value: memValue,
              content: reportMarkdown,
              isUsed: 1,
              createdAt: Date.now(),
            })
            .run();
        }
      } catch (memErr) {
        console.warn("Failed to save project memory:", memErr);
      }
    }

    // Complete state
    const summaryShort = `Gathered ${collectedData.length} data points across ${sources.length} sources for "${searchQuery}".`;
    activeAgentStates.set(agentId, {
      state: "completed",
      currentStep: "Finished",
      lastRunAt: Date.now(),
      lastSummary: summaryShort,
    });

    updateAgentCapabilityState(agentId, {
      executionState: "completed",
      lastRunAt: Date.now(),
      lastRunSummary: summaryShort,
    });

    console.log(`[AGENT RUNNER] Completed research briefing for ${agentEntry.name}. Delivered to conv: ${targetConvId}`);
    return {
      success: true,
      conversationId: targetConvId,
      messageId,
      collectedCount: collectedData.length,
      summary: summaryShort,
    };
  } catch (err: any) {
    console.error(`[AGENT RUNNER] Error in agent ${agentId}:`, err);
    activeAgentStates.set(agentId, {
      state: "idle",
      currentStep: `Error: ${err.message}`,
    });
    updateAgentCapabilityState(agentId, {
      executionState: "idle",
      lastRunSummary: `Failed: ${err.message}`,
    });
    throw err;
  }
}
