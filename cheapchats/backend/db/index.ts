import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const DB_URL =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/cheapmodels";

// Shared PostgreSQL Client (Same as CheapRouter)
export const sql = postgres(DB_URL, { max: 10, onnotice: () => {} });
export const pgDb = sql;

const baseDb = drizzle(sql, { schema });

// Wrap query builders to support .all(), .get(), and .run() while remaining standard awaitable Promises
function wrapBuilder(builder: any) {
  if (!builder) return builder;
  builder.all = function () {
    return builder.then((res: any) => (Array.isArray(res) ? res : [res].filter(Boolean)));
  };
  builder.get = function () {
    return builder.then((res: any) => (Array.isArray(res) ? res[0] : res));
  };
  builder.run = function () {
    return builder.then((res: any) => res);
  };
  return builder;
}

const dbProxyHandler: ProxyHandler<any> = {
  get(target, prop, receiver) {
    const orig = target[prop];
    if (typeof orig === "function") {
      return function (...args: any[]) {
        const res = orig.apply(target, args);
        if (res && typeof res.then === "function") {
          return wrapBuilder(res);
        }
        if (res && typeof res === "object") {
          return new Proxy(res, dbProxyHandler);
        }
        return res;
      };
    }
    return orig;
  },
};

export const db: any = new Proxy(baseDb, dbProxyHandler);

// SQLite shim for legacy references
export const sqlite: any = {
  run: (query: string) => {
    try {
      sql.unsafe(query).catch(() => {});
    } catch {}
  },
  exec: (query: string) => {
    try {
      sql.unsafe(query).catch(() => {});
    } catch {}
  },
  query: () => ({ all: () => [], get: () => null, run: () => {} }),
};

// Auto-initialize CheapChats PostgreSQL tables on load
async function initCheapChatsPostgres() {
  try {
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
      CREATE TABLE IF NOT EXISTS cheapchats_skills (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        content TEXT,
        source_type TEXT NOT NULL DEFAULT 'text',
        file_name TEXT,
        is_default INTEGER NOT NULL DEFAULT 0,
        is_always_active INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL,
        updated_at BIGINT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cheapchats_memories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        key TEXT,
        value TEXT,
        content TEXT NOT NULL,
        is_used INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cheapchats_attachments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT,
        size INTEGER,
        type TEXT,
        mime_type TEXT,
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

    await sql`
      CREATE TABLE IF NOT EXISTS cheapchats_provider_endpoints (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        base_url TEXT NOT NULL,
        api_key TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cheapchats_audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        ip TEXT NOT NULL DEFAULT '127.0.0.1',
        created_at BIGINT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cheapchats_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        connector_id TEXT NOT NULL,
        account_label TEXT,
        type TEXT NOT NULL DEFAULT 'alert',
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        sender TEXT NOT NULL,
        sender_avatar TEXT,
        action_url TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        is_replied INTEGER NOT NULL DEFAULT 0,
        reply_content TEXT,
        created_at BIGINT NOT NULL
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_cheapchats_msgs_conv ON cheapchats_messages(conversation_id, created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cheapchats_convs_user ON cheapchats_conversations(user_id, is_incognito, updated_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cheapchats_skills_user ON cheapchats_skills(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cheapchats_memories_user ON cheapchats_memories(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cheapchats_prompts_user ON cheapchats_prompts(user_id);`;
  } catch (err) {
    console.error("[CheapChats Postgres] Table initialization warning:", err);
  }
}

// Trigger table creation non-blocking
initCheapChatsPostgres().catch(() => {});
