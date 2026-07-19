---
kind: build_system
name: Monorepo Build & Artifact Management
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - next.config.ts
    - tsconfig.json
    - backend/package.json
    - backend/tsconfig.json
---

This repository is a monorepo with two independently built packages — a Next.js frontend and a Bun-hosted Hono backend — each managed by its own `package.json` and lockfile. There is no shared build orchestration (no Makefile, Dockerfile, CI pipeline, or root-level workspace script); builds are invoked per-package via npm/Bun scripts.

**Frontend (Next.js)**
- Root `package.json` defines `dev`, `build`, and `start` scripts that delegate to `next dev`, `next build`, and `next start`.
- TypeScript is configured at the repo root (`tsconfig.json`) with `moduleResolution: "bundler"`, strict mode, path alias `@/* → ./src/*`, and the Next.js compiler plugin; it explicitly excludes `backend/` from compilation.
- `next.config.ts` is present but empty (all defaults).
- Artifacts are produced in `.next/` (generated) and served via `next start`.
- Lockfile: `bun.lock` at the root (Bun used for dependency resolution despite npm-style `package-lock.json` also present).

**Backend (Hono + Bun)**
- `backend/package.json` provides `dev` (`bun --watch src/index.ts`), `start` (`bun src/index.ts`), and `seed` (`bun src/seed.ts`).
- Backend TypeScript config (`backend/tsconfig.json`) targets ES2022, uses `bun-types`, and includes only `src/**/*.ts`.
- Runtime artifacts: SQLite database files (`cheapmodels.db*`) live alongside the backend source.
- Lockfile: `backend/bun.lock`.

**Conventions & constraints**
- No cross-compilation, containerization, or CI configuration exists in this snapshot.
- Each subproject is self-contained: separate package manifests, lockfiles, and tsconfigs.
- The frontend and backend share no build-time tooling; they communicate over HTTP at runtime.