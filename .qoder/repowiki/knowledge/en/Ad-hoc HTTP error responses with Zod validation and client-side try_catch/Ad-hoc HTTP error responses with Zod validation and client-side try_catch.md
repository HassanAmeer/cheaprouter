---
kind: error_handling
name: Ad-hoc HTTP error responses with Zod validation and client-side try/catch
category: error_handling
scope:
    - '**'
source_files:
    - backend/src/index.ts
    - backend/src/auth.ts
    - src/lib/api.ts
    - src/app/not-found.tsx
---

This repository uses a lightweight, ad-hoc error-handling approach across its Next.js frontend and Hono/Bun backend. There is no centralized error type system, sentinel errors, or global exception handler — errors are represented as plain strings in JSON bodies and thrown as `Error` objects on the client.

**Backend (Hono + Bun)**
- Input validation: every mutating route is guarded by `@hono/zod-validator` (`zValidator`) with inline Zod schemas. Validation failures are handled by the validator middleware; successful routes receive already-typed request bodies via `c.req.valid('json')`.
- Business errors: handlers return explicit JSON bodies with an `error` field and an appropriate HTTP status code (401 Unauthorized, 404 Not Found, 409 Conflict). Example patterns:
  - `return c.json({ error: 'Unauthorized' }, 401)`
  - `return c.json({ error: 'Email already registered' }, 409)`
  - `return c.json({ error: 'Not found' }, 404)`
- Auth middleware (`requireAuth`) rejects missing/invalid tokens at 401 before reaching any route handler.
- No global error middleware exists; unhandled exceptions inside route handlers will propagate to Bun's default error response.
- The JWT verification function (`verifyToken`) swallows parse/signature errors by returning `null`, letting callers treat them as "not authenticated" rather than throwing.

**Frontend (Next.js App Router)**
- Centralized fetch wrapper (`src/lib/api.ts`): the internal `request<T>` helper checks `res.ok`; on failure it reads the JSON body (with `.catch(() => ({})`) and throws `new Error(body.error ?? \`Request failed (${res.status})\`)`. All typed API methods (`api.login`, `api.createKey`, etc.) delegate through this wrapper, so callers always see a single `Error` object whose `message` is the server-supplied `error` string.
- SSE streaming (`streamChat`) catches per-chunk JSON parse errors silently (`try { JSON.parse(data) } catch {}`) and treats stream termination as normal completion.
- Page components handle errors locally with `try/catch` around individual calls and surface messages via a small toast primitive (`toast(e.message, 'error')`). For read-only data loads, many pages fall back to empty defaults using `.catch(() => setDefault(...))`.
- Route-level error pages: a custom `src/app/not-found.tsx` renders a friendly 404 UI for unmatched Next.js routes.

**Conventions developers should follow**
1. **Validate inputs with Zod** — wrap POST/PUT bodies with `zValidator(json, schema)` so malformed requests never reach business logic.
2. **Return `{ error: string }` with correct HTTP codes** from route handlers for all user-facing failure cases (auth, not-found, conflict).
3. **Do not throw raw exceptions** from route handlers; prefer explicit JSON error responses so the client wrapper can normalize them.
4. **On the client**, call the typed `api.*` helpers and catch `Error` objects; use the message directly in toasts or fallback defaults. Avoid calling `fetch` directly outside `api.ts` so error normalization stays consistent.