import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { mcpServers } from "@cheapchats/backend/db/schema";
import { eq, desc } from "drizzle-orm";

export interface ConnectedAccount {
  id: string;
  label: string;
  username?: string;
  repo?: string;
  uri?: string;
  isDefault?: boolean;
  createdAt: number;
}

export interface ConnectorInfo {
  id: string;
  name: string;
  type: string; // 'builtin' | 'stdio' | 'sse' | 'oauth'
  icon: string; // 'Globe' | 'FileCode' | 'Github' | 'Database' | 'Server' | 'MessageCircle' | 'Mail'
  status: "connected" | "disconnected" | "connecting";
  color: string;
  description: string;
  urlOrCommand?: string;
  accounts: ConnectedAccount[];
  tools?: string[];
  createdAt?: number;
}

// Built-in connector defaults
const defaultConnectors: ConnectorInfo[] = [
  {
    id: "web",
    name: "Web Search",
    type: "builtin",
    icon: "Globe",
    status: "connected",
    color: "text-blue-400",
    description: "Live real-time search across Google & Tavily API for up-to-date information.",
    accounts: [
      {
        id: "acc_web_1",
        label: "Live Google & Tavily Search",
        createdAt: Date.now(),
      },
    ],
    tools: ["web_search", "fetch_url_content"],
  },
  {
    id: "local",
    name: "Local Workspace",
    type: "builtin",
    icon: "FileCode",
    status: "connected",
    color: "text-emerald-400",
    description: "Direct workspace code & filesystem inspector to analyze files and project architecture.",
    accounts: [
      {
        id: "acc_local_1",
        label: `Workspace (${process.cwd()})`,
        uri: process.cwd(),
        createdAt: Date.now(),
      },
    ],
    tools: ["read_file", "list_dir", "grep_search"],
  },
  {
    id: "github",
    name: "GitHub Integration",
    type: "oauth",
    icon: "Github",
    status: "disconnected",
    color: "text-slate-300",
    description: "Connect GitHub repos to inspect commits, pull requests, issues, and branch code.",
    accounts: [],
    tools: ["github_list_repos", "github_read_file", "github_create_issue", "github_search_code"],
  },
  {
    id: "db",
    name: "PostgreSQL DB",
    type: "builtin",
    icon: "Database",
    status: "disconnected",
    color: "text-indigo-400",
    description: "Query PostgreSQL databases, inspect table schemas, and execute read queries safely.",
    accounts: [],
    tools: ["pg_list_tables", "pg_describe_table", "pg_execute_query"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Connector",
    type: "oauth",
    icon: "MessageCircle",
    status: "disconnected",
    color: "text-emerald-400",
    description: "Connect WhatsApp Web / Business API to auto-receive and send WhatsApp messages directly.",
    accounts: [],
    tools: ["send_whatsapp_message", "get_whatsapp_chats", "auto_reply_whatsapp"],
  },
  {
    id: "gmail",
    name: "Gmail Integration",
    type: "oauth",
    icon: "Mail",
    status: "disconnected",
    color: "text-red-400",
    description: "Connect Gmail to read unread emails, compose drafts, and auto-dispatch emails.",
    accounts: [],
    tools: ["send_email", "get_unread_emails", "reply_to_email"],
  },
  {
    id: "playwright",
    name: "Playwright Automation",
    type: "builtin",
    icon: "Globe",
    status: "connected",
    color: "text-amber-400",
    description: "Headless browser automation engine for dynamic JavaScript SPAs, web scraping, screenshot capture, and interactive web flows.",
    accounts: [
      {
        id: "acc_playwright_1",
        label: "Headless Chromium / Google Chrome Engine",
        createdAt: Date.now(),
      },
    ],
    tools: ["playwright_browse", "playwright_screenshot", "playwright_search", "playwright_automate"],
  },
  {
    id: "agent_reach",
    name: "Agent Reach",
    type: "builtin",
    icon: "Globe",
    status: "connected",
    color: "text-teal-400",
    description: "Give your AI agent eyes across the whole internet: Jina Reader, YouTube transcripts, GitHub, and live multi-source web search with zero API fees.",
    accounts: [
      {
        id: "acc_agent_reach_1",
        label: "Panniantong/agent-reach + Jina Reader Hub",
        createdAt: Date.now(),
      },
    ],
    tools: ["agent_reach_read", "agent_reach_search", "agent_reach_youtube", "agent_reach_github"],
  },
];

export async function GET() {
  try {
    // Read all custom MCP servers from database
    const serverRows: any = await db.select().from(mcpServers).orderBy(desc(mcpServers.createdAt));
    const customServers: any[] = Array.isArray(serverRows) ? serverRows : [];

    // Map default connectors with database override status and accounts if saved
    const mergedConnectors: ConnectorInfo[] = defaultConnectors.map((connector) => {
      const dbEntry = customServers.find((s: any) => s.id === `conn_${connector.id}` || s.id === connector.id);
      
      let accounts: ConnectedAccount[] = connector.accounts || [];
      let status = connector.status;
      let urlOrCommand = connector.urlOrCommand;
      let tools: string[] = connector.tools || [];

      if (dbEntry) {
        status = dbEntry.status === "ACTIVE" || dbEntry.status === "CONNECTED" ? "connected" : "disconnected";
        urlOrCommand = dbEntry.urlOrCommand;

        try {
          if (dbEntry.toolsJson) tools = JSON.parse(dbEntry.toolsJson);
        } catch {}

        try {
          if (dbEntry.accountsJson) {
            const parsed = JSON.parse(dbEntry.accountsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              accounts = parsed;
            } else if (status === "connected" && (urlOrCommand || dbEntry.name)) {
              // Fallback account from urlOrCommand
              accounts = [
                {
                  id: `acc_${dbEntry.id}_1`,
                  label: urlOrCommand || dbEntry.name,
                  createdAt: dbEntry.createdAt,
                },
              ];
            }
          }
        } catch {}
      }

      return {
        ...connector,
        status,
        urlOrCommand,
        accounts,
        tools,
      };
    });

    // Add any custom user-added MCP servers that aren't built-in
    for (const server of customServers) {
      if (!mergedConnectors.some((c) => c.id === server.id || `conn_${c.id}` === server.id)) {
        let tools: string[] = [];
        let accounts: ConnectedAccount[] = [];

        try {
          if (server.toolsJson) tools = JSON.parse(server.toolsJson);
        } catch {}

        try {
          if (server.accountsJson) accounts = JSON.parse(server.accountsJson);
        } catch {}

        if (accounts.length === 0 && server.status === "ACTIVE") {
          accounts = [
            {
              id: `acc_${server.id}_1`,
              label: server.urlOrCommand || server.name,
              createdAt: server.createdAt,
            },
          ];
        }

        mergedConnectors.push({
          id: server.id,
          name: server.name,
          type: server.type,
          icon: "Server",
          status: server.status === "ACTIVE" ? "connected" : "disconnected",
          color: "text-amber-400",
          description: `Custom ${server.type.toUpperCase()} Model Context Protocol Server endpoint.`,
          urlOrCommand: server.urlOrCommand,
          accounts,
          tools: tools.length > 0 ? tools : ["mcp_call_tool", "mcp_list_resources"],
          createdAt: server.createdAt,
        });
      }
    }

    return NextResponse.json({ connectors: mergedConnectors });
  } catch (error: any) {
    console.error("Failed to fetch connectors:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch connectors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, name, type, urlOrCommand, accountLabel, repo, username, tools } = body;

    const targetId = id.startsWith("conn_") || id.startsWith("mcp_") ? id : `conn_${id}`;
    const existing = db.select().from(mcpServers).where(eq(mcpServers.id, targetId)).get();

    let currentAccounts: ConnectedAccount[] = [];
    if (existing?.accountsJson) {
      try {
        currentAccounts = JSON.parse(existing.accountsJson);
      } catch {}
    }

    if (action === "connect" || action === "add_account") {
      const newAccount: ConnectedAccount = {
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        label: accountLabel || urlOrCommand || repo || `${name || id} Account`,
        repo: repo || (urlOrCommand?.includes("/") ? urlOrCommand : undefined),
        username: username,
        isDefault: currentAccounts.length === 0,
        createdAt: Date.now(),
      };

      // Avoid exact duplicate labels
      const updatedAccounts = [...currentAccounts.filter((a) => a.label !== newAccount.label), newAccount];

      if (existing) {
        db.update(mcpServers)
          .set({
            status: "ACTIVE",
            urlOrCommand: urlOrCommand || existing.urlOrCommand,
            accountsJson: JSON.stringify(updatedAccounts),
            toolsJson: tools ? JSON.stringify(tools) : existing.toolsJson,
          })
          .where(eq(mcpServers.id, targetId))
          .run();
      } else {
        db.insert(mcpServers)
          .values({
            id: targetId,
            name: name || id,
            type: type || "builtin",
            urlOrCommand: urlOrCommand || "",
            status: "ACTIVE",
            toolsJson: JSON.stringify(tools || ["read_context", "execute_action"]),
            accountsJson: JSON.stringify(updatedAccounts),
            createdAt: Date.now(),
          })
          .run();
      }

      return NextResponse.json({ success: true, status: "connected", accounts: updatedAccounts });
    }

    if (action === "remove_account") {
      const accountIdToRemove = body.accountId;
      const filteredAccounts = currentAccounts.filter((a) => a.id !== accountIdToRemove);
      const newStatus = filteredAccounts.length === 0 ? "INACTIVE" : "ACTIVE";

      if (existing) {
        db.update(mcpServers)
          .set({
            status: newStatus,
            accountsJson: JSON.stringify(filteredAccounts),
          })
          .where(eq(mcpServers.id, targetId))
          .run();
      }

      return NextResponse.json({ success: true, status: newStatus === "ACTIVE" ? "connected" : "disconnected", accounts: filteredAccounts });
    }

    if (action === "disconnect") {
      if (existing) {
        db.update(mcpServers)
          .set({
            status: "INACTIVE",
            accountsJson: "[]",
          })
          .where(eq(mcpServers.id, targetId))
          .run();
      }
      return NextResponse.json({ success: true, status: "disconnected", accounts: [] });
    }

    if (action === "test") {
      const existing = db.select().from(mcpServers).where(eq(mcpServers.id, targetId)).get();
      if (!existing || existing.status !== "ACTIVE") {
        return NextResponse.json({ success: false, message: "Connector is not connected" }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        latencyMs: 0,
        message: "Connection is enabled locally; live network latency is not measured.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process connector request" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Connector ID required" }, { status: 400 });

    const targetId = id.startsWith("conn_") || id.startsWith("mcp_") ? id : `conn_${id}`;
    db.delete(mcpServers).where(eq(mcpServers.id, targetId)).run();

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete connector" }, { status: 500 });
  }
}
