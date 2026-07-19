---
kind: configuration_system
name: Environment-based Configuration with No Central Loader
category: configuration_system
scope:
    - '**'
source_files:
    - backend/src/index.ts
    - backend/src/auth.ts
    - backend/src/db.ts
    - src/lib/api.ts
    - src/app/api/stream/route.ts
    - src/app/api/v1/chat/completions/route.ts
    - src/config/theme.ts
---

The repository uses a flat, process.env-driven configuration approach with no centralized config loader, schema validation, or environment-file framework. Each module reads the variables it needs directly at import time and falls back to hardcoded defaults.

**What is used**
- Plain `process.env` access throughout both the Next.js frontend and the Bun/Hono backend.
- `.env.local` (gitignored) for local overrides; no `.env`, `.env.development`, `.env.production`, or dotenv library is imported anywhere.
- A single static TypeScript file (`src/config/theme.ts`) exports UI theme constants — not runtime configuration.

**Where configuration lives**
- Backend server settings: `backend/src/index.ts` reads `PORT` and `CORS_ORIGIN`.
- Authentication secret: `backend/src/auth.ts` reads `JWT_SECRET`.
- Database path: `backend/src/db.ts` reads `BACKEND_DB`.
- Frontend API base URL: `src/lib/api.ts` reads `NEXT_PUBLIC_API_URL` (Next.js public env var).
- Provider API keys: `src/app/api/stream/route.ts` and `src/app/api/v1/chat/completions/route.ts` read `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` as fallbacks when no BYOK provider is configured in the DB.

**Architecture & conventions**
- There is no shared configuration package or module — every file that needs a setting imports `process.env` directly.
- Every required variable has an inline default value (e.g. `?? 'dev-cheapmodels-secret-change-me'`, `?? './cheapmodels.db'`, `?? '*'`, `?? 4000`, `?? ''`), so the app runs without any env file present.
- Secrets are never validated or typed; missing values silently fall back to dev defaults.
- The only non-env constant surface is `src/config/theme.ts`, which exports a plain object consumed by the UI layer.

**Rules developers should follow**
- Put per-environment secrets in `.env.local` (already gitignored); do not commit `.env*` files.
- When adding a new setting, read it via `process.env.X ?? <default>` at the point of use rather than creating a central config module — keep the current pattern consistent.
- Prefer `NEXT_PUBLIC_`-prefixed vars for anything exposed to the browser (see `NEXT_PUBLIC_API_URL`).
- For provider API keys, prefer storing them via the Dashboard's BYOK flow (DB-backed providers table); env vars are only a demo fallback.