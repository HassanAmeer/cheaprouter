# WEB_GEN Architectural Rules & Guidelines

This document defines the strict architectural rules, package management policy, and routing guidelines for the `web_gen` module integrated into the `cheaprouter` Next.js + Bun project.

---

## 📜 Core Architectural Rules

### Rule 1: Root-Level Package Management (Single `package.json`)
- **ALL npm/bun dependencies** for both the `cheaprouter` application and the `web_gen` module must be defined **exclusively** in the main root [`package.json`](file:///home/hasan/Documents/reactjs/cheaprouter/package.json).
- Do **NOT** create a sub `package.json` or `pnpm-lock.yaml` inside the `web_gen/` directory.
- The root [`package.json`](file:///home/hasan/Documents/reactjs/cheaprouter/package.json) contains clearly categorized dependency sections:
  - `// === CORE / COMMON PACKAGES ===` (React, Next.js, Framer Motion, Tailwind, Lucide Icons)
  - `// === CHEAPROUTER MAIN APP PACKAGES ===` (OpenAI, Anthropic, Three.js, UUID)
  - `// === WEB_GEN BUILDER PACKAGES ===` (CodeMirror, Nanostores, Xterm, Diff, Shiki, Sonner)

---

### Rule 2: Route Endpoint Definition (`/web`)
- The `web_gen` Web Builder interface must be accessible under the **`/web`** route.
- Route implementation: [`src/app/web/page.tsx`](file:///home/hasan/Documents/reactjs/cheaprouter/src/app/web/page.tsx).
- When navigating to `http://localhost:3000/web`, the Next.js App Router renders the `web_gen` workbench interface.

---

### Rule 3: Modular Code Isolation
- All code, components, hooks, styles, and assets specific to the web generator must remain **strictly isolated** within the [`web_gen/`](file:///home/hasan/Documents/reactjs/cheaprouter/web_gen) directory.
- Do not place `web_gen`-specific code inside `src/components/` or `src/lib/`.
- Future updates or feature modifications related to `web_gen` must be made solely inside [`web_gen/`](file:///home/hasan/Documents/reactjs/cheaprouter/web_gen).

---

### Rule 4: Bun & TypeScript Runtime Compatibility
- Run the project using Bun:
  ```bash
  bun --bun run dev
  ```
- All components must maintain strict TypeScript (`.ts` / `.tsx`) type safety.

---

## 📁 Workspace Directory Layout

```text
cheaprouter/                             <--- Workspace Root
├── package.json                        <--- SINGLE Root Package Manager (All Dependencies)
├── WEB_GEN_RULES.md                    <--- Architecture & Rules Document
├── src/                                <--- Cheaprouter Main App Code
│   └── app/
│       ├── page.tsx                    <--- Main App Home
│       └── web/
│           └── page.tsx                <--- /web Route Page for Web_Gen
└── web_gen/                            <--- Web Builder Module (Isolated Code, Components, Assets)
    ├── app/                            <--- Devonz React Components & Logic
    ├── docs/
    └── public/
```
