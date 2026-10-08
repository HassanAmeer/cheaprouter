import { pgTable, text, integer, doublePrecision, bigint } from "drizzle-orm/pg-core";

// Unified Users Table (Shared with CheapRouter)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("free"),
  role: text("role").default("USER"),
  status: text("status").default("Active"),
  avatar: text("profile_picture"),
  createdAt: text("created_at"),
});

// CheapChats dedicated tables (prefixed with cheapchats_ for clean separation in PostgreSQL)
export const conversations = pgTable("cheapchats_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  model: text("model").notNull().default("openai/gpt-4o"),
  provider: text("provider").notNull().default("OpenRouter"),
  projectId: text("project_id"),
  systemPrompt: text("system_prompt"),
  agentId: text("agent_id"),
  isPinned: integer("is_pinned").notNull().default(0),
  isBookmarked: integer("is_bookmarked").notNull().default(0),
  isIncognito: integer("is_incognito").notNull().default(0),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const messages = pgTable("cheapchats_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  sender: text("sender").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  parentId: text("parent_id"),
  model: text("model"),
  provider: text("provider"),
  tokens: integer("tokens").notNull().default(0),
  cost: doublePrecision("cost").notNull().default(0),
  feedback: text("feedback"),
  attachments: text("attachments"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const agents = pgTable("cheapchats_agents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  systemPrompt: text("system_prompt").notNull(),
  temperature: doublePrecision("temperature").notNull().default(0.7),
  model: text("model").notNull().default("openai/gpt-4o"),
  capabilities: text("capabilities").notNull().default("{}"),
  isPublic: integer("is_public").notNull().default(0),
  isFeatured: integer("is_featured").notNull().default(0),
  status: text("status").notNull().default("APPROVED"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const prompts = pgTable("cheapchats_prompts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  content: text("content").notNull(),
  command: text("command"),
  isPublic: integer("is_public").notNull().default(0),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const mcpServers = pgTable("cheapchats_mcp_servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("stdio"),
  urlOrCommand: text("url_or_command").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  toolsJson: text("tools_json").notNull().default("[]"),
  accountsJson: text("accounts_json").default("[]"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const globalConfig = pgTable("cheapchats_global_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const providerEndpoints = pgTable("cheapchats_provider_endpoints", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull(),
  baseUrl: text("base_url").notNull(),
  apiKey: text("api_key"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const auditLogs = pgTable("cheapchats_audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details").notNull(),
  ip: text("ip").notNull().default("127.0.0.1"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const skills = pgTable("cheapchats_skills", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content"),
  sourceType: text("source_type").notNull().default("text"),
  fileName: text("file_name"),
  isDefault: integer("is_default").notNull().default(0),
  isAlwaysActive: integer("is_always_active").notNull().default(0),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }),
});

export const memories = pgTable("cheapchats_memories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  key: text("key"),
  value: text("value"),
  content: text("content").notNull(),
  isUsed: integer("is_used").notNull().default(1),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const attachments = pgTable("cheapchats_attachments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  size: integer("size"),
  type: text("type"),
  mimeType: text("mime_type"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const notifications = pgTable("cheapchats_notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  connectorId: text("connector_id").notNull(),
  accountLabel: text("account_label"),
  type: text("type").notNull().default("alert"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sender: text("sender").notNull(),
  senderAvatar: text("sender_avatar"),
  actionUrl: text("action_url"),
  isRead: integer("is_read").notNull().default(0),
  isReplied: integer("is_replied").notNull().default(0),
  replyContent: text("reply_content"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
