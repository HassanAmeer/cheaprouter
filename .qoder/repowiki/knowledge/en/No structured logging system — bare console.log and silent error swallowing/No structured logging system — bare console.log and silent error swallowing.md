---
kind: logging_system
name: No structured logging system — bare console.log and silent error swallowing
category: logging_system
scope:
    - '**'
source_files:
    - backend/src/index.ts
    - src/app/api/auth/login/route.ts
---

This repository does not implement a logging system. There is no dedicated logger framework (e.g., pino, winston, bun:log), no log-level configuration, no structured log fields, and no centralized logging middleware or utility module.

Evidence:
- The Bun-hosted Hono backend (`backend/src/index.ts`) uses only a single `console.log` to print the server startup address; all other code paths return JSON responses without emitting any logs.
- Next.js App Router API routes (`src/app/api/*/route.ts`) catch errors in try/catch blocks but immediately return `{ error: 'Internal server error' }` with a 500 status — they do not log the caught exception anywhere.
- A standalone `check.js` script at the repo root uses `console.log` for its own validation output, unrelated to application runtime logging.
- No files named `logger`, `logging`, `log`, or similar exist under `src/`, `backend/src/`, or any subdirectory.
- No imports of third-party logging packages appear in any `.ts`/`.js` file.

As a result, developers have no conventions to follow because none are defined. Errors surface only as HTTP error responses; there is no audit trail, request correlation, or observability hook.