import * as schema from "./schema";
import path from "path";
import fs from "fs";

let db: any;
let sqlite: any;

const candidatePaths = [
  path.resolve(process.cwd(), "cheapchats/backend/sqlite.db"),
  path.resolve(__dirname, "../sqlite.db"),
  path.resolve(__dirname, "../../sqlite.db"),
  path.resolve(process.cwd(), "cheapchats/sqlite.db"),
  path.resolve(process.cwd(), "sqlite.db"),
];
const dbPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];

try {
  const { Database } = require("bun:sqlite");
  const { drizzle } = require("drizzle-orm/bun-sqlite");
  sqlite = new Database(dbPath, { create: true });
  db = drizzle(sqlite, { schema });
} catch (e) {
  const Database = require("better-sqlite3");
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
}

if (sqlite && !sqlite.run && typeof sqlite.exec === "function") {
  sqlite.run = (sql: string) => sqlite.exec(sql);
}

// Enable High-Performance SQLite Settings (WAL mode, memory cache, fast sync)
try {
  sqlite.run("PRAGMA journal_mode = WAL;");
  sqlite.run("PRAGMA synchronous = NORMAL;");
  sqlite.run("PRAGMA busy_timeout = 5000;");
  sqlite.run("PRAGMA cache_size = -64000;"); // 64MB cache
  sqlite.run("PRAGMA temp_store = MEMORY;");
} catch (e) {
  console.error("PRAGMA setup error:", e);
}

// Auto-migrate missing columns/tables on startup
try {
  sqlite.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    avatar TEXT,
    created_at INTEGER NOT NULL
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS conversations (
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
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS messages (
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
    attachments TEXT,
    created_at INTEGER NOT NULL
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS agents (
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
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    content TEXT NOT NULL,
    command TEXT,
    is_public INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS mcp_servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'stdio',
    url_or_command TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    tools_json TEXT NOT NULL DEFAULT '[]',
    accounts_json TEXT DEFAULT '[]',
    created_at INTEGER NOT NULL
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS global_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS provider_endpoints (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    base_url TEXT NOT NULL,
    api_key TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`);
  sqlite.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip TEXT NOT NULL DEFAULT '127.0.0.1',
    created_at INTEGER NOT NULL
  )`);
} catch (e) {
  console.error("Table creation error:", e);
}

try {
  sqlite.run("ALTER TABLE conversations ADD COLUMN project_id TEXT");
} catch {}
try {
  sqlite.run("ALTER TABLE conversations ADD COLUMN system_prompt TEXT");
} catch {}
try {
  sqlite.run("ALTER TABLE conversations ADD COLUMN agent_id TEXT");
} catch {}
try {
  sqlite.run("ALTER TABLE prompts ADD COLUMN command TEXT");
} catch {}
try {
  sqlite.run("ALTER TABLE messages ADD COLUMN attachments TEXT");
} catch {}
try {
  sqlite.run(`CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT,
    source_type TEXT NOT NULL DEFAULT 'text',
    file_name TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    is_always_active INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  )`);
} catch {}
try {
  sqlite.run("ALTER TABLE skills ADD COLUMN is_default INTEGER NOT NULL DEFAULT 0");
} catch {}
try {
  sqlite.run("ALTER TABLE skills ADD COLUMN is_always_active INTEGER NOT NULL DEFAULT 0");
} catch {}
try {
  sqlite.run("ALTER TABLE skills ADD COLUMN updated_at INTEGER");
} catch {}
try {
  sqlite.run(`CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    key TEXT,
    value TEXT,
    content TEXT NOT NULL,
    is_used INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  )`);
} catch {}
try {
  sqlite.run("ALTER TABLE messages ADD COLUMN attachments TEXT");
} catch {}
try {
  sqlite.run(`CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT,
    size INTEGER,
    type TEXT,
    mime_type TEXT,
    created_at INTEGER NOT NULL
  )`);
} catch {}
try {
  sqlite.run("ALTER TABLE attachments ADD COLUMN type TEXT");
} catch {}
try {
  sqlite.run("ALTER TABLE attachments ADD COLUMN mime_type TEXT");
} catch {}
try {
  sqlite.run("ALTER TABLE mcp_servers ADD COLUMN accounts_json TEXT DEFAULT '[]'");
} catch {}
try {
  sqlite.run(`CREATE TABLE IF NOT EXISTS notifications (
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
    created_at INTEGER NOT NULL
  )`);
} catch {}

// Create indexes for ultra-fast queries (0ms lookups)
try {
  sqlite.run(`CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at)`);
  sqlite.run(`CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, is_incognito, updated_at DESC)`);
  sqlite.run(`CREATE INDEX IF NOT EXISTS idx_skills_user ON skills(user_id)`);
  sqlite.run(`CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id)`);
  sqlite.run(`CREATE INDEX IF NOT EXISTS idx_prompts_user ON prompts(user_id)`);
} catch (e) {
  console.error("Index creation error:", e);
}

try {
  sqlite.run(`ALTER TABLE memories ADD COLUMN user_id TEXT NOT NULL DEFAULT 'usr_user1'`);
} catch {}

export { db, sqlite };
