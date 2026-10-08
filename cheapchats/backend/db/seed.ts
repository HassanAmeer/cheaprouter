import { db, sql } from "./index";
import { users, conversations, messages, agents, prompts, mcpServers, globalConfig, auditLogs } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@cheapchats/backend/lib/auth";

async function seed() {
  console.log("🌱 Creating PostgreSQL tables if needed...");

  await sql`
    CREATE TABLE IF NOT EXISTS cheapchats_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT 'openai/gpt-4o',
      provider TEXT NOT NULL DEFAULT 'OpenRouter',
      project_id TEXT,
      system_prompt TEXT,
      agent_id TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_bookmarked INTEGER NOT NULL DEFAULT 0,
      is_incognito INTEGER NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cheapchats_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      parent_id TEXT,
      model TEXT,
      provider TEXT,
      tokens INTEGER NOT NULL DEFAULT 0,
      cost DOUBLE PRECISION NOT NULL DEFAULT 0,
      feedback TEXT,
      attachments TEXT,
      created_at BIGINT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cheapchats_agents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      avatar TEXT,
      system_prompt TEXT NOT NULL,
      temperature DOUBLE PRECISION NOT NULL DEFAULT 0.7,
      model TEXT NOT NULL DEFAULT 'openai/gpt-4o',
      capabilities TEXT NOT NULL DEFAULT '{}',
      is_public INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      created_at BIGINT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cheapchats_prompts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      content TEXT NOT NULL,
      command TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cheapchats_mcp_servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'stdio',
      url_or_command TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      tools_json TEXT NOT NULL DEFAULT '[]',
      accounts_json TEXT DEFAULT '[]',
      created_at BIGINT NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cheapchats_global_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `;

  console.log("🌱 Seeding Users into PostgreSQL...");
  const now = Date.now();
  const testUsers = [
    { id: "usr_user1", name: "user1", email: "user1@cheapchats.internal", passwordHash: hashPassword("1234"), role: "USER", status: "Active", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user1" },
    { id: "usr_user2", name: "user2", email: "user2@cheapchats.internal", passwordHash: hashPassword("1234"), role: "USER", status: "Active", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user2" },
    { id: "usr_user3", name: "user3", email: "user3@cheapchats.internal", passwordHash: hashPassword("1234"), role: "USER", status: "Active", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user3" },
    { id: "usr_admin", name: "admin", email: "admin@cheapchats.internal", passwordHash: hashPassword("1234"), role: "ADMIN", status: "Active", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin" },
  ];

  for (const user of testUsers) {
    const existing = await db.select().from(users).where(eq(users.id, user.id)).get();
    if (!existing) {
      await db.insert(users).values(user).run();
      console.log(`  └─ Created user: ${user.name} (${user.role})`);
    } else {
      console.log(`  └─ User already exists: ${user.name}`);
    }
  }

  console.log("🌱 Seeding Global Config in PostgreSQL...");
  const initialConfigs = [
    { key: "OPENROUTER_API_KEY", value: "" },
    { key: "OPENAI_API_KEY", value: "" },
    { key: "DEFAULT_MODEL", value: "openai/gpt-4o" },
    { key: "DEFAULT_PROVIDER", value: "OpenRouter" },
    { key: "SYSTEM_PROMPT", value: "You are an intelligent, helpful AI assistant built with CheapChats." },
    { key: "SEARCH_PROVIDER", value: "tavily" },
  ];

  for (const cfg of initialConfigs) {
    const existing = await db.select().from(globalConfig).where(eq(globalConfig.key, cfg.key)).get();
    if (!existing) {
      await db.insert(globalConfig).values({ key: cfg.key, value: cfg.value, updatedAt: now }).run();
      console.log(`  └─ Config set: ${cfg.key}`);
    }
  }

  console.log("✅ CheapChats PostgreSQL Seeding Complete!");
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
