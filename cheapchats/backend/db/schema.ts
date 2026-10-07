import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("USER"), // 'USER' | 'ADMIN'
  status: text("status").notNull().default("ACTIVE"), // 'ACTIVE' | 'BANNED'
  avatar: text("avatar"),
  createdAt: integer("created_at").notNull(),
});

export const conversations = sqliteTable("conversations", {
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
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  sender: text("sender").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  parentId: text("parent_id"),
  model: text("model"),
  provider: text("provider"),
  tokens: integer("tokens").notNull().default(0),
  cost: real("cost").notNull().default(0),
  feedback: text("feedback"), // 'up' | 'down' | null
  attachments: text("attachments"), // JSON serialized attachments
  createdAt: integer("created_at").notNull(),
});

export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  systemPrompt: text("system_prompt").notNull(),
  temperature: real("temperature").notNull().default(0.7),
  model: text("model").notNull().default("openai/gpt-4o"),
  capabilities: text("capabilities").notNull().default("{}"), // JSON string
  isPublic: integer("is_public").notNull().default(0),
  isFeatured: integer("is_featured").notNull().default(0),
  status: text("status").notNull().default("APPROVED"), // 'APPROVED' | 'PENDING'
  createdAt: integer("created_at").notNull(),
});

export const prompts = sqliteTable("prompts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  content: text("content").notNull(),
  command: text("command"),
  isPublic: integer("is_public").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const mcpServers = sqliteTable("mcp_servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("stdio"), // 'stdio' | 'sse'
  urlOrCommand: text("url_or_command").notNull(),
  status: text("status").notNull().default("ACTIVE"), // 'ACTIVE' | 'INACTIVE'
  toolsJson: text("tools_json").notNull().default("[]"),
  createdAt: integer("created_at").notNull(),
});

export const globalConfig = sqliteTable("global_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const providerEndpoints = sqliteTable("provider_endpoints", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull(),
  baseUrl: text("base_url").notNull(),
  apiKey: text("api_key"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details").notNull(),
  ip: text("ip").notNull().default("127.0.0.1"),
  createdAt: integer("created_at").notNull(),
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content"),
  sourceType: text("source_type").notNull().default("text"),
  fileName: text("file_name"),
  isDefault: integer("is_default").notNull().default(0),
  isAlwaysActive: integer("is_always_active").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at"),
});

export const memories = sqliteTable("memories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  key: text("key"),
  value: text("value"),
  content: text("content").notNull(),
  isUsed: integer("is_used").notNull().default(1),
  createdAt: integer("created_at").notNull(),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  size: integer("size"),
  type: text("type"), // 'image' | 'document' | 'code' | 'audio' | 'video' | 'archive' | 'other'
  mimeType: text("mime_type"),
  createdAt: integer("created_at").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  connectorId: text("connector_id").notNull(), // 'github' | 'db' | 'whatsapp' | 'gmail' | 'workspace' | 'system'
  accountLabel: text("account_label"), // 'Clientsjobs/cheap_chat' or email/handle
  type: text("type").notNull().default("alert"), // 'pr' | 'issue' | 'dm' | 'comment' | 'alert'
  title: text("title").notNull(),
  content: text("content").notNull(),
  sender: text("sender").notNull(),
  senderAvatar: text("sender_avatar"),
  actionUrl: text("action_url"),
  isRead: integer("is_read").notNull().default(0),
  isReplied: integer("is_replied").notNull().default(0),
  replyContent: text("reply_content"),
  createdAt: integer("created_at").notNull(),
});
