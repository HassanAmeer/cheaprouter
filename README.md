# CheapModels

Unified API for all premium AI models — one key, every provider. This repo is a monorepo:

```
cheapmodels/
├── backend/      # Bun + Hono + SQLite REST API
├── src/          # Next.js 16 frontend (App Router)
└── public/
```

## Architecture

- **Backend** (`/backend`): Bun runtime, [Hono](https://hono.dev) HTTP framework, native
  `bun:sqlite` database. Exposes a REST API on port `4000` (configurable via `PORT`).
  - `src/db.ts` — SQLite schema + connection (users, api_keys, providers, usage, conversations, messages)
  - `src/auth.ts` — password hashing + HMAC-JWT sign/verify
  - `src/keys.ts`, `src/providers.ts`, `src/usage.ts`, `src/conversations.ts` — data layers
  - `src/index.ts` — Hono routes (auth, keys, providers, analytics, chat + SSE stream, models)
- **Frontend** (`/src`): Next.js 16 + React 19 + Tailwind-ish CSS modules. Talks to the
  backend through `src/lib/api.ts`. Shared/reused pieces live in `src/components/`:
  - `ui/primitives.tsx` — Button, Input, Select, Badge, Modal
  - `ui/toast.tsx` + `toast.module.css` — global toast system
  - `ui/charts.tsx` — SVG Bar / Area / Donut charts (no extra deps)
  - `theme-provider.tsx`, `theme-toggle.tsx` — dark/light theme
  - `auth-provider.tsx` — token-based auth context
  - `site-nav.tsx` — responsive navbar (mobile hamburger)
  - `logo.tsx` — brand logo

## Running locally

### 1. Backend
```bash
cd backend
bun install
bun run dev        # http://localhost:4000
```
First run auto-creates `backend/cheapmodels.db`.

### 2. Frontend
```bash
# from repo root
bun install
cp .env.local .env.local   # already present: NEXT_PUBLIC_API_URL=http://localhost:4000
bun run dev        # http://localhost:3000
```

## API reference (backend)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Create account, returns JWT |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/me` | ✅ | Current user |
| GET | `/api/models` | ❌ | Model catalog |
| GET/POST/DELETE | `/api/keys` `/api/keys/:id` | ✅ | Manage API keys |
| GET/POST/PUT/DELETE | `/api/providers` `(/:id)` | ✅ | BYOK provider management |
| GET | `/api/analytics` `/api/summary` | ✅ | Usage analytics |
| GET/POST | `/api/conversations` | ✅ | Create + list chats |
| POST | `/api/conversations/:id/messages` | ✅ | Send message |
| GET | `/api/stream?prompt=&model=` | ✅ | SSE token streaming |

Auth header: `Authorization: Bearer <token>`.

> Note: chat responses are canned/mocked server-side (`fakeModelReply` in `src/index.ts`).
> Swap this for a real provider proxy to go live.
