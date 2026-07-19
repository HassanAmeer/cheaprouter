---
kind: external_dependency
name: Next.js 16 App Router frontend
slug: nextjs-app-router
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
---

Frontend is a Next.js 16 App Router project (React 19). Routes live under `src/app/` with server-side API routes under `src/app/api/`. Auth state is held in a React context (`auth-provider.tsx`). CSS Modules are used throughout instead of Tailwind classes despite `tailwind-merge` being present. This is mostly code-visible; the App Router layout structure is already derivable from the tree.