---
kind: dependency_management
name: Dual-Workspace Bun Dependency Management (Frontend + Backend)
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - bun.lock
    - backend/package.json
    - backend/bun.lock
---

This monorepo uses a dual-workspace dependency strategy driven by Bun, with the Next.js frontend and Hono/Bun backend each maintaining their own package.json plus a top-level bun.lock that resolves both workspaces. There is no npm/yarn/pnpm lockfile at the root — only package-lock.json exists alongside bun.lock, indicating a past or parallel npm usage, but the active resolver is Bun.

Systems and tools
- Bun is the package manager for both workspaces (bun install / bun.lock). The root bun.lock declares two workspace entries: cheapmodels (Next.js) and cheapmodels-backend (Hono).
- Next.js (next@16.2.10) drives the frontend build; its optional native dependencies (sharp, @next/swc-*) are gated via Bun's ignoreScripts/trustedDependencies fields to avoid unnecessary native builds in CI.
- Hono + Zod power the backend API; the backend has its own isolated backend/package.json and backend/bun.lock.

Key files
- package.json — root workspace manifest (frontend-only deps, scripts, trusted/ignored native packages).
- bun.lock — root lockfile pinning all transitive resolutions across both workspaces.
- backend/package.json — backend runtime manifest (hono, zod, @hono/zod-validator).
- backend/bun.lock — backend-specific lockfile (present but superseded by the root lockfile for installs).

Architecture and conventions
- Single lockfile, two manifests: instead of a true pnpm-style pnpm-workspace.yaml, Bun's root bun.lock enumerates both workspaces under workspaces[""], so one bun install at the repo root resolves everything.
- Version ranges: all public dependencies use caret ranges (^x.y.z), allowing minor/patch updates while keeping major boundaries explicit.
- Native binary gating: sharp and unrs-resolver are listed under both ignoreScripts and trustedDependencies so they can be installed without running postinstall hooks unless explicitly trusted.
- No vendoring: there is no vendor/ or node_modules committed; backend/node_modules appears on disk but is not tracked. No private registry or .npmrc/.bunfig.toml overrides are present.

Rules developers should follow
- Add new dependencies to the correct manifest: root package.json for frontend-only packages, backend/package.json for server-only ones.
- Run bun install at the repository root so the shared bun.lock stays in sync across workspaces.
- Prefer caret ranges (^) for third-party libraries; pin exact versions only for platform-native binaries when necessary.
- Do not commit node_modules; rely on the lockfile for reproducible installs.
- When adding native dependencies, consider whether they need to be added to trustedDependencies/ignoreScripts to keep CI fast.