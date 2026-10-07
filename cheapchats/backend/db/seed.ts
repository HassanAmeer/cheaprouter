import { db, sqlite } from "./index";
import { users, conversations, messages, agents, prompts, mcpServers, globalConfig, auditLogs } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@cheapchats/backend/lib/auth";

async function seed() {
  console.log("🌱 Creating database tables if needed...");

  // Initialize SQLite tables if they do not exist
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      avatar TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT 'openai/gpt-4o',
      provider TEXT NOT NULL DEFAULT 'OpenRouter',
      project_id TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_bookmarked INTEGER NOT NULL DEFAULT 0,
      is_incognito INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      parent_id TEXT,
      model TEXT,
      provider TEXT,
      tokens INTEGER NOT NULL DEFAULT 0,
      cost REAL NOT NULL DEFAULT 0,
      feedback TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      avatar TEXT,
      system_prompt TEXT NOT NULL,
      temperature REAL NOT NULL DEFAULT 0.7,
      model TEXT NOT NULL DEFAULT 'openai/gpt-4o',
      capabilities TEXT NOT NULL DEFAULT '{}',
      is_public INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      created_at INTEGER NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      content TEXT NOT NULL,
      command TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS mcp_servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'stdio',
      url_or_command TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      tools_json TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS global_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip TEXT NOT NULL DEFAULT '127.0.0.1',
      created_at INTEGER NOT NULL
    );
  `);

  console.log("🌱 Seeding Users...");

  const now = Date.now();
  const testUsers = [
    { id: "usr_user1", username: "user1", password: hashPassword("1234"), role: "USER", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user1", createdAt: now - 86400000 * 5 },
    { id: "usr_user2", username: "user2", password: hashPassword("1234"), role: "USER", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user2", createdAt: now - 86400000 * 3 },
    { id: "usr_user3", username: "user3", password: hashPassword("1234"), role: "USER", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user3", createdAt: now - 86400000 * 2 },
    { id: "usr_admin", username: "admin", password: hashPassword("1234"), role: "ADMIN", status: "ACTIVE", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin", createdAt: now - 86400000 * 10 },
  ];

  for (const user of testUsers) {
    const existing = db.select().from(users).where(eq(users.username, user.username)).get();
    if (!existing) {
      db.insert(users).values(user).run();
      console.log(`  └─ Created user: ${user.username} (${user.role})`);
    } else {
      console.log(`  └─ User already exists: ${user.username}`);
    }
  }

  console.log("🌱 Seeding Global Config & Capabilities Matrix...");
  const initialConfigs = [
    { key: "OPENROUTER_API_KEY", value: "" },
    { key: "OPENAI_API_KEY", value: "" },
    { key: "ANTHROPIC_API_KEY", value: "" },
    { key: "GEMINI_API_KEY", value: "" },
    { key: "DEFAULT_MODEL", value: "openai/gpt-4o" },
    {
      key: "PERMISSIONS_MATRIX",
      value: JSON.stringify({
        USER: { webSearch: true, mcpTools: true, fileUploads: true, customPrompts: true, agentBuilder: true },
        ADMIN: { webSearch: true, mcpTools: true, fileUploads: true, customPrompts: true, agentBuilder: true, fullModeration: true }
      })
    }
  ];

  for (const cfg of initialConfigs) {
    const existing = db.select().from(globalConfig).where(eq(globalConfig.key, cfg.key)).get();
    if (!existing) {
      db.insert(globalConfig).values({ key: cfg.key, value: cfg.value, updatedAt: now }).run();
    }
  }

  console.log("🌱 Seeding Sample Conversations & Messages...");
  const convId1 = "conv_welcome_01";
  const existingConv = db.select().from(conversations).where(eq(conversations.id, convId1)).get();
  if (!existingConv) {
    db.insert(conversations).values({
      id: convId1,
      userId: "usr_user1",
      title: "Welcome to CheapChat",
      model: "openai/gpt-4o",
      provider: "OpenRouter",
      isPinned: 1,
      isBookmarked: 1,
      isIncognito: 0,
      createdAt: now - 3600000 * 2,
      updatedAt: now - 3600000 * 2,
    }).run();

    db.insert(messages).values([
      {
        id: "msg_01",
        conversationId: convId1,
        sender: "user",
        content: "Hello! What can you do?",
        model: "openai/gpt-4o",
        provider: "OpenRouter",
        tokens: 12,
        cost: 0.0001,
        createdAt: now - 3600000 * 2,
      },
      {
        id: "msg_02",
        conversationId: convId1,
        sender: "assistant",
        content: "Welcome! I am your AI assistant built on Next.js, Bun, and SQLite, with full CheapChat feature parity and an A-to-Z Admin Management Panel.\n\nHere are some things I support:\n- 🚀 **Multi-Provider AI Models**: OpenRouter, OpenAI, Anthropic, Gemini, Custom Endpoints\n- 🔍 **Web & File Search**\n- 🛠️ **MCP (Model Context Protocol) Connectors**\n- 📊 **Artifacts Viewer & Debug Drawer**\n- 🔐 **Full Admin Management Panel** at `/admin`\n\nHow can I help you today?",
        model: "openai/gpt-4o",
        provider: "OpenRouter",
        tokens: 145,
        cost: 0.0014,
        createdAt: now - 3600000 * 2 + 1000,
      }
    ]).run();
  }

  console.log("🌱 Seeding Featured Agents & Prompts...");
  const agent1 = "agent_code_assistant";
  if (!db.select().from(agents).where(eq(agents.id, agent1)).get()) {
    db.insert(agents).values({
      id: agent1,
      userId: "usr_admin",
      name: "Senior Software Architect",
      description: "Expert in Next.js, TypeScript, Rust, and scalable system design.",
      avatar: "⚡",
      systemPrompt: "You are a principal software architect. Provide ultra-precise, modular, clean code solutions with clear markdown structure.",
      temperature: 0.2,
      model: "anthropic/claude-3.5-sonnet",
      capabilities: JSON.stringify({ webSearch: true, mcpTools: true, artifacts: true }),
      isPublic: 1,
      isFeatured: 1,
      status: "APPROVED",
      createdAt: now - 86400000,
    }).run();
  }

  const prompt1 = "prm_code_review";
  if (!db.select().from(prompts).where(eq(prompts.id, prompt1)).get()) {
    db.insert(prompts).values({
      id: prompt1,
      userId: "usr_admin",
      title: "Comprehensive Code Review",
      description: "Analyzes code for bugs, security issues, performance bottlenecks, and readability.",
      category: "Coding",
      content: "Please review the following code snippet carefully. Identify potential security flaws, edge case bugs, memory/performance optimizations, and code quality improvements:\n\n```typescript\n\n```",
      isPublic: 1,
      createdAt: now - 86400000,
    }).run();
  }

  console.log("🌱 Seeding Default MCP Servers...");
  const mcp1 = "mcp_filesystem";
  if (!db.select().from(mcpServers).where(eq(mcpServers.id, mcp1)).get()) {
    db.insert(mcpServers).values({
      id: mcp1,
      name: "Filesystem & Workspace Connector",
      type: "stdio",
      urlOrCommand: "npx -y @modelcontextprotocol/server-filesystem ./",
      status: "ACTIVE",
      toolsJson: JSON.stringify([
        { name: "read_file", description: "Read workspace file content" },
        { name: "write_file", description: "Write workspace file content" },
        { name: "list_directory", description: "List contents of workspace directory" }
      ]),
      createdAt: now - 86400000,
    }).run();
  }

  console.log("🌱 Seeding Audit Logs...");
  db.insert(auditLogs).values({
    id: `log_${now}`,
    userId: "usr_admin",
    action: "SYSTEM_INITIALIZED",
    details: "Database created and pre-seeded with test accounts user1, user2, user3, and admin (pass: 1234).",
    ip: "127.0.0.1",
    createdAt: now,
  }).run();

  console.log("✅ Database seeding completed successfully!");
}

seed().catch(err => {
  console.error("❌ Database seeding failed:", err);
  process.exit(1);
});
