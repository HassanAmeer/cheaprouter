# CheapModels — Design-Side Gap Analysis

> Scope: **Design & UX only** (layout, visual polish, consistency, missing pages/sections, flows).
> Status of each listed item: ✅ present / ⚠️ stub or inconsistent / ❌ missing.

---

## 1. Broken / Dangling Links (flows not complete)

The marketing homepage links to routes that **do not exist** and will 404:

| Link in code | Target | Status |
|---|---|---|
| Hero CTA `Try chat` | `/chat` | ❌ missing route |
| Hero CTA `Try cheap CLI` | `/cli` | ❌ missing route |
| Footer `About Us`, `Privacy Policy`, `Terms of Service` | `/#` anchors | ⚠️ dead anchors |
| Navbar `Pricing` | `#pricing` | ⚠️ only works on home |
| ModelsTable "Providers" dropdown | (no handler) | ⚠️ non-functional select |
| Settings "Save Changes" / "Manage Billing" | — | ⚠️ no handler / no feedback |
| API Keys "Generate New Key" | — | ⚠️ no handler / no modal |

**Impact:** The first impression is broken — two of three primary CTAs lead nowhere.

---

## 2. Page Inventory & Depth

| Route | Depth | Notes |
|---|---|---|
| `/` home | ✅ rich | Heavy, but well-built |
| `/login`, `/signup` | ✅ good | Mirror each other, consistent |
| `/docs` | ⚠️ basic | Single page, no real nav tree, no multi-section routing |
| `/dashboard` | ⚠️ decent | CSS-dummy bar chart, no real chart lib |
| `/dashboard/overview` (index) | ✅ | |
| `/dashboard/keys` | ⚠️ stub | Static table, no generate/copy/revoke logic |
| `/dashboard/providers` | ✅ richest | Recently built |
| `/dashboard/analytics` | ❌ placeholder | Literal `[Chart Visualization Goes Here]` |
| `/dashboard/settings` | ⚠️ stub | Inputs don't submit, no state |
| `/chat` | ❌ missing | Referenced by hero + BranchFeatures |
| `/cli` | ❌ missing | Referenced by hero CTA |

---

## 3. Visual / Design System Gaps

1. **No dark mode.** Globals + components are light-only. The hero uses dark particles/laser/splash over a light background, creating a tonal clash (dark effect layers on a near-white page). A proper dark theme (or a true dark hero section) would unify the "developer tool" aesthetic.
2. **Inconsistent color usage.** `--color-text-muted` is often hardcoded as `#666` / `#888` in components instead of the token; some text uses literal `black`. Tokens exist but aren't consistently applied.
3. **No design-system primitives.** Buttons, cards, inputs, badges, tooltips are hand-rolled inline per file. There is no shared `Button`/`Input`/`Badge`/`Modal` component — leading to drift (e.g. `btn-primary` vs `btn-secondary` vs inline styles).
4. **No charting.** Analytics + dashboard use CSS bars or empty placeholders. No `recharts`/SVG-based real charts (line, area, donut for cost breakdown).
5. **No loading / empty / error states.** Every view assumes data exists. No skeletons, no empty states, no toasts.
6. **No responsive pass.** Home hero is a fixed `40% / 55%` flex split; navbar has no mobile menu; dashboard sidebar is fixed-width with no collapse. Likely broken below ~900px.
7. **No global toast / modal system.** Needed for "copy key", "revoke", "generate key", "contact sales".
8. **Inconsistent typography scale.** Sizes are ad-hoc (`36px`, `40px`, `28px`, `24px`, `18px`) with no type-scale tokens.
9. **No favicon/OG image / metadata per page.** Only root metadata exists; no per-route `title`/`description`, no social cards.
10. **No lightbox / copy-to-clipboard feedback globally.** Copy exists in `InstallBox` and `keys` only, inconsistent.

---

## 4. Missing Pages / Tabs to Add (suggested)

Marketing site:
- **`/chat`** — interactive chat playground (compare models side-by-side). Strongly implied by hero + BranchFeatures.
- **`/cli`** — CLI/product page with install, commands, examples (currently only a hero `InstallBox`).
- **`/pricing`** — dedicated pricing page (currently an anchor on home; footer/nav imply a route).
- **`/blog` or `/changelog`** — optional, for "Systems Operational" / product updates.
- **Legal pages** — `/privacy`, `/terms` (footer links are dead).

Dashboard (new tabs):
- **`/dashboard/usage`** or merge into analytics with real charts.
- **`/dashboard/billing`** — plans, invoices, upgrade (implied by settings "Manage Billing").
- **`/dashboard/team`** — optional, org/invite members.
- **`/dashboard/logs`** — request logs / API activity feed.

---

## 5. Flows to Complete (end-to-end)

1. **Auth flow:** login → dashboard should be gated; currently any link jumps straight in. Add a mock auth context + protected routes.
2. **Signup → onboarding:** after signup, a welcome / "create first key" step.
3. **API Key lifecycle:** generate (modal + copy) → list → revoke → confirm. Currently all static.
4. **BYOK provider connect:** providers page exists; wire "add provider" modal with validation + save state.
5. **Chat playground flow:** pick model(s) → send message → stream response → compare. (new page)
6. **Contact sales / support:** form with validation + success state (currently a dead button).
7. **Pricing → checkout/upgrade:** plan selection → mock checkout → settings reflects new plan.

---

## 6. Polish / Quality Items

- Add a **sticky, blur-on-scroll navbar** with mobile hamburger menu.
- Add **scroll-reveal animations** (framer-motion already installed) to home sections consistently.
- Add **hover micro-interactions** to table rows, pricing cards, review cards.
- Replace CSS-dummy charts with real responsive charts.
- Add **focus states / a11y** (keyboard nav, aria labels, contrast check) — inputs have no focus ring.
- Add **consistent spacing scale** tokens (sections use mixed `paddingTop: 0 / 20px`).
- Add **dark hero treatment** so laser/splash/particle layers read correctly.
- Add **error boundaries** and a global 404 page.

---

## 7. Suggested Priority Order

1. Fix dangling routes: build `/chat`, `/cli`, `/pricing` (highest ROI, unblocks CTAs).
2. Introduce shared UI primitives (`Button`, `Input`, `Modal`, `Toast`, `Badge`) + dark theme tokens.
3. Complete dashboard flows (keys generate/revoke, providers add, analytics real charts, settings save).
4. Responsive + a11y pass.
5. Polish: animations, empty/loading states, metadata/OG.
