# Master Prompt & System Architecture: Next.js + Bun AI Chat Platform

> **Goal**: Build a high-performance, pixel-perfect AI Chat Application using **Next.js (App Router)**, **Bun**, and **SQLite Database**, cloning the full feature set, theme colors, visual layout of LibreChat, and adding an **A to Z Admin Management Panel** with exact UI styling and full route parity.

---

## 🤖 1. System Prompt for AI Generation

*Copy and paste the following master prompt into your AI assistant or use it as the blueprint for building the application:*

```text
You are a senior principal full-stack engineer building a modern, pixel-perfect AI Chat Platform using Next.js (App Router), Bun runtime/package manager, TypeScript, SQLite database (bun:sqlite / Drizzle ORM), and Tailwind CSS (or Vanilla CSS design system).

Your objective is to replicate and modernize the complete Chat UI and feature ecosystem of LibreChat with 100% feature parity, exact top-header layout, theme colors, visual polish, pre-seeded temporary accounts, and a full A to Z Admin Panel matching the dark mode glassmorphic UI.

### Core Stack & Database Requirements:
- Framework: Next.js (latest App Router, React 19 Client & Server Components)
- Runtime & Package Manager: Bun (`bun install`, `bun dev`, `bun build`)
- Database: SQLite (`sqlite.db` using `bun:sqlite` or Drizzle ORM / Prisma)
- Language: TypeScript (Strict mode)
- Styling: Modern sleek dark mode design system (Glassmorphic dark slate, curated HSL color palette, smooth 60fps micro-animations)

### Pre-Seeded Temporary Test Accounts (Seed Script):
Automatically seed the SQLite database with 4 ready-to-use temporary accounts:
1. Username: `user1` | Password: `1234` | Role: `USER`
2. Username: `user2` | Password: `1234` | Role: `USER`
3. Username: `user3` | Password: `1234` | Role: `USER`
4. Username: `admin` | Password: `1234` | Role: `ADMIN`

### Design System, Theme & Aesthetics Specification:
- Dark Mode Palette (Identical to LibreChat / Modern Glassmorphism):
  - Primary Background: #0f172a (Deep Slate) / #090d16 (Space Dark)
  - Secondary Surface / Cards: #1e293b (Slate 800) with backdrop-blur-md overlay
  - Hover States: #334155 (Slate 700) / surface-active-alt
  - Border Accents: rgba(255, 255, 255, 0.08) / border-light
  - Primary Text: #f8fafc (Slate 50)
  - Secondary Text: #94a3b8 (Slate 400)
  - Brand Accent Colors: Emerald (#10b981), Electric Violet (#8b5cf6), Sky Blue (#0284c7)
- Typography: Inter / Outfit font family with crisp antialiased rendering.
- Micro-Animations: 60fps transitions (200ms ease-in-out), smooth dropdown expansions, glowing border highlights on hover.

### Complete Feature Ecosystem (A to Z Detailed Specification):

1. Top Header & Navigation Layout:
   - Left Side: Sidebar collapse/expand trigger button + Provider/Model Selector button explicitly defaulting to "Select a provider" (NOT "Select a model").
   - Select Provider Dropdown: Clicking displays Provider List first (OpenRouter, OpenAI, Anthropic, Google Gemini, Custom Endpoints, Agents). Hovering/clicking a provider expands a submenu showing live dynamic models (fetched via OpenRouter API `https://openrouter.ai/api/v1/models` with fallback default models).
   - Top Right Controls Bar (Header Options):
     - **Temporary / Incognito Chat Toggle Button**: Top-right toggle icon/switch (prevents saving conversation history when active).
     - **Debug Mode / Debug Console Toggle Button**: Top-right button/icon to toggle the Debug Console drawer (inspect raw prompt, token usage, latency, model parameters).
     - **Share Conversation Button**: Generates public share link.
     - **Fork / Branch Conversation Button**.
     - **Artifacts Panel Toggle Button**: Toggles side-panel overlay for code/markdown artifacts.

2. Sidebar & Conversation Management:
   - Collapsible left sidebar with smooth slide animations.
   - "New Chat" button (`Ctrl/Cmd + K` shortcut).
   - Live search conversation history input.
   - Chronological chat history grouping: Today, Yesterday, Previous 7 Days, Older.
   - Per-chat menu options: Rename title, Bookmark chat, Pin to top, Delete, Export conversation (JSON / Markdown).
   - Bottom User Account section: Admin Panel button (for Admin role), Settings Modal trigger, Provider API Keys manager, Theme switcher.

3. Complete Admin Management Panel (`/admin` Sub-Routes - Protected for ADMIN Role):
   - **Matching UI/UX**: Same dark slate glassmorphic theme, top bar navigation, and collapsible admin sidebar.
   - **Route `/admin` (Dashboard Overview)**:
     - Real-time statistics widgets: Total Registered Users, Active Conversations Today, Total Tokens Consumed, Total Estimated API Cost, Active MCP Servers.
     - Interactive usage charts (Token usage over time, Model usage distribution pie chart).
     - Live System Health & Error Logs stream.
   - **Route `/admin/users` (User Management)**:
     - Filterable Users Data Table: ID, Avatar, Username, Role Badge (USER / ADMIN), Status (ACTIVE / BANNED), Joined Date, Action Menu.
     - User Actions: Change Role, Reset Password to `1234`, Toggle Ban/Unban, View User's Total Tokens & Chat History, Delete User.
     - "Create New User" modal.
   - **Route `/admin/chats` (Conversation Moderation & Inspection)**:
     - Conversations Data Table: Chat ID, Owner Username, Model/Provider Used, Message Count, Created Date, Last Activity.
     - Actions: Read-Only Chat Transcript Drawer (inspect messages), Delete Conversation, Flag/Unflag conversation.
   - **Route `/admin/endpoints` (Global Keys & Provider Config)**:
     - Manage and test Global API Keys: OpenRouter (`OPENROUTER_API_KEY`), OpenAI, Anthropic, Google Gemini.
     - Configure Default Fallback Models for custom endpoints.
     - Add/Edit custom endpoint definitions (baseURL, headers, model aliases).
   - **Route `/admin/groups` (Roles & Capabilities Matrix)**:
     - Permissions matrix per role (USER vs ADMIN): Toggle access to Agents, MCP Servers, Web Search, File Uploads, Custom Prompts.
   - **Route `/admin/agents` (Agent & Prompt Moderation)**:
     - Marketplace Moderation: Approve, Feature on Marketplace, Edit, or Delete public agents and prompt templates.
   - **Route `/admin/logs` (Audit & System Logs)**:
     - Detailed audit log of admin actions, API requests, rate-limit hits, and error tracebacks.

4. Agent & Agent Builder System:
   - Custom Agent Builder Modal: Name, Description, Avatar upload, System Prompt instructions, Temperature, Model assignment.
   - Agent Capability toggles: Web Search, MCP Tools, Skills, File Search, Artifacts.
   - Agent Marketplace / Library: Discover, search, clone, edit, and share custom agents (Public/Private toggle).

5. MCP (Model Context Protocol) & Connectors:
   - MCP Server Connector Hub: Register stdio or SSE MCP servers.
   - Tool discovery & real-time tool execution status badges in chat thread.
   - Connectors for external data sources & document stores.

6. Skills & Prompts Library:
   - Skills system: SKILL.md instruction sets parser and dynamic execution.
   - Prompts Library: System prompts templates manager (Create, Edit, Share, Categories).
   - Quick prompt trigger using `/` slash commands in the message textarea.

7. Interactive Message Thread & Multi-Modal Controls:
   - Input Box: Auto-expanding textarea with character counter.
   - Pinned Tools Bar: Quick buttons for Web Search, File Search, Skills, Artifacts.
   - Attachments: Upload Images, PDFs, CSVs, Code files with preview thumbnails.
   - Voice Input (Mic / Speech-to-Text via Web Speech API / Whisper).
   - Message Item Actions:
     - Copy text / Copy code snippet button
     - Edit user message (creates a new conversation branch)
     - Regenerate assistant response / Try again
     - Thumbs Up / Thumbs Down feedback rating
     - Text-to-Speech (Audio play button with wave animation)
     - Debug Console drawer (inspect raw system prompt, raw messages JSON, latency, model parameters)
     - Token Usage & Cost counter per message

8. Artifacts Engine & Rich Content Rendering:
   - Side-by-side or full overlay Artifacts Viewer for code snippets, HTML previews, SVG rendering, Markdown reports, and Mermaid diagrams.
   - GFM Markdown parser with syntax highlighting, line numbers, tables, alerts, and sequential carousels.

9. Settings & Account Management:
   - Provider API Keys Modal: Manage user keys for OpenRouter, OpenAI, Anthropic, Google Gemini.
   - System Preferences: Font size, Interface language, Memory management, Incognito defaults.

Ensure strict TypeScript typing, modular component architecture, and responsive design across all screen sizes.
```

---

## 📁 2. Recommended Next.js + Bun Project Structure

```
nextjs-bun-aichat/
├── app/
│   ├── layout.tsx                  # Root layout with providers & global CSS
│   ├── page.tsx                    # Landing / redirect to chat
│   ├── login/page.tsx              # Login page (user1/user2/user3/admin | pass: 1234)
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with admin sidebar & header
│   │   ├── page.tsx                # Admin Dashboard (Analytics & Health)
│   │   ├── users/page.tsx          # User Management table & actions
│   │   ├── chats/page.tsx          # Conversation Moderation & Transcript viewer
│   │   ├── endpoints/page.tsx      # Global API keys & model config
│   │   ├── groups/page.tsx         # Capabilities & Permissions matrix
│   │   ├── agents/page.tsx         # Agent & prompt moderation
│   │   └── logs/page.tsx           # Audit logs & error stream
│   ├── (chat)/
│   │   ├── c/[id]/page.tsx         # Active conversation thread
│   │   ├── new/page.tsx            # New conversation page
│   ├── api/
│   │   ├── chat/route.ts           # Unified streaming API (OpenRouter/OpenAI/Anthropic)
│   │   ├── models/route.ts         # Dynamic model fetcher & fallback
│   │   ├── agents/route.ts         # Agent CRUD operations
│   │   ├── admin/
│   │   │   ├── users/route.ts      # Admin User Management API
│   │   │   ├── chats/route.ts      # Admin Conversation Moderation API
│   │   │   └── config/route.ts     # Admin System Config API
│   │   ├── mcp/route.ts            # MCP Server proxy & execution
│   │   └── prompts/route.ts        # Prompts library API
├── db/
│   ├── schema.ts                   # SQLite Database schema (Users, Conversations, Messages, Agents, Logs)
│   ├── seed.ts                     # Pre-seeds user1, user2, user3, admin (password: 1234)
│   └── index.ts                    # bun:sqlite / Drizzle connection
├── components/
│   ├── Admin/
│   │   ├── AdminSidebar.tsx        # Collapsible admin sidebar menu
│   │   ├── UserTable.tsx           # Admin user management table
│   │   ├── ChatTable.tsx           # Conversation moderation table
│   │   ├── UsageAnalytics.tsx      # Token & cost metrics charts
│   │   ├── PermissionsMatrix.tsx   # Capabilities matrix component
│   │   └── ConfigForm.tsx          # Global keys configuration form
│   ├── Chat/
│   │   ├── ChatInput.tsx           # Textarea, mic STT, file attach, tools bar
│   │   ├── MessageThread.tsx       # Message history scrolling list
│   │   ├── MessageItem.tsx         # Message row with TTS, copy, edit, feedback
│   │   ├── DebugConsole.tsx        # Token usage & raw prompt drawer
│   │   └── ArtifactsViewer.tsx     # Side-panel rendering engine
│   ├── Header/
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── ModelSelector.tsx       # Provider -> Model nested menu
│   │   ├── IncognitoToggle.tsx     # Top-right temporary chat toggle
│   │   ├── DebugConsoleToggle.tsx  # Top-right debug mode toggle
│   │   └── HeaderOptions.tsx       # Share, Fork, Artifacts panel toggles
│   ├── Sidebar/
│   │   ├── Sidebar.tsx             # Main chat drawer menu
│   │   ├── ConversationList.tsx    # Filterable chat history
│   │   └── UserAccountMenu.tsx     # Admin panel link, Settings & Keys modal trigger
│   ├── Modals/
│   │   ├── AgentBuilderModal.tsx   # Agent builder UI
│   │   ├── MCPServerModal.tsx      # MCP servers configuration
│   │   ├── PromptsModal.tsx        # Prompt library
│   │   └── SettingsModal.tsx       # App settings & API keys
├── lib/
│   ├── ai/                         # OpenRouter client, SSE parser, MCP client
│   ├── hooks/                      # Speech-to-text, TTS, Keyboard shortcuts
│   └── utils/                      # Helper utilities & HSL color tokens
└── bun.lock
```

---

## ⚡ 3. Commands to Build & Seed with Bun

```bash
# Initialize Next.js app using Bun
bun create next-app nextjs-bun-aichat --typescript --tailwind --app

# Navigate into directory
cd nextjs-bun-aichat

# Install core packages & SQLite ORM
bun add ai lucide-react @tanstack/react-query zustand clsx tailwind-merge drizzle-orm
bun add -D drizzle-kit

# Run database seed script (creates user1, user2, user3, admin with password '1234')
bun run db/seed.ts

# Start dev server
bun dev
```
