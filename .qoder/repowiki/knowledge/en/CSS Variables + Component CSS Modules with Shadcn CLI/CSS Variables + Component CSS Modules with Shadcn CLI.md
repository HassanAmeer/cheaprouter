---
kind: frontend_style
name: CSS Variables + Component CSS Modules with Shadcn CLI
category: frontend_style
scope:
    - '**'
source_files:
    - src/app/globals.css
    - src/components/theme-provider.tsx
    - src/components/ui/primitives.tsx
    - src/components/ui/primitives.module.css
    - src/config/theme.ts
    - components.json
    - src/app/layout.tsx
---

The CheapModels frontend uses a hybrid styling approach built around CSS custom properties (design tokens) and per-component CSS Modules, with shadcn/ui configured for future primitive adoption.

**Design tokens and theming**
- All visual tokens live in `src/app/globals.css` as CSS variables under `:root` and `[data-theme="dark"]`. Tokens cover colors (primary, success, warning, danger, surfaces, text, borders), shadows, radii, spacing scale, type scale, and transitions.
- Theme switching is handled by a client-side `ThemeProvider` (`src/components/theme-provider.tsx`) that toggles the `data-theme` attribute on `<html>` and persists the choice in `localStorage`. The dark palette swaps primary to a brighter red and switches surface/text/border tokens accordingly.
- A minimal JS theme object exists at `src/config/theme.ts` but is not widely consumed; the single source of truth is the CSS variable set.

**Styling methodology**
- **Global base styles**: `globals.css` resets box-sizing, sets body typography via the Inter font injected through Next's `next/font/google`, defines accessible focus rings, and provides shared utility classes (`.container`, `.btn-primary`, `.card`, `.text-gradient`, `.glass-card`, grid backgrounds, floating animation).
- **Component-level CSS Modules**: Every UI component ships its own `.module.css` file (e.g. `primitives.module.css`, `space-button.module.css`, `toast.module.css`, `site-nav.module.css`, page-scoped files like `chat.module.css`, `pricing.module.css`). Components import these modules and compose class names via `clsx`/`tailwind-merge`'s `cn` helper from `@/lib/utils`.
- **Primitive layer**: `src/components/ui/primitives.tsx` wraps low-level elements (Button, Input, Select, Badge, Modal) and composes multiple module classes together, providing a typed API over the CSS Module surface.

**Shadcn/ui configuration**
- `components.json` configures shadcn/ui with RSC + TSX enabled, Tailwind integration pointing at `tailwind.config.ts` and `src/app/globals.css`, `slate` base color, CSS variables mode, and Lucide icons. It also registers the `reactbits.dev` registry under `@react-bits`. However, no `tailwind.config.ts` currently exists in the repo, so shadcn primitives are not actively used yet — the project instead maintains its own primitives.

**Animation and motion**
- Framer Motion (`framer-motion`, `motion`) is installed and used for interactive animations alongside pure CSS keyframes defined in globals and component modules (shimmer, float, modal entrance, rotating tooltip text).

**Icons and assets**
- Icons come from `lucide-react`, referenced directly inside components rather than via a centralized icon system.

**Conventions developers should follow**
1. Define new visual tokens as CSS variables in `globals.css` under both `:root` and `[data-theme="dark"]`; never hardcode hex values in components.
2. Style components with CSS Modules colocated next to the component file; avoid global CSS selectors beyond the token/utility layer.
3. Compose module classes through the primitive wrappers in `src/components/ui/` using the `cn()` helper rather than string concatenation.
4. When adding a new variant or size, extend the corresponding module class (e.g. `btn_sm`, `badge_success`) and expose it via the typed prop interface in the primitive.
5. Use the `ThemeProvider` context for any feature that needs to react to the current theme; do not read `document.documentElement` directly.