# 🧭 Roadmap

Single source of truth for **what's built and what's next**. Each phase is its own
spec → plan (`writing-plans/`) → build cycle, so any session can resume by reading this file.

| Phase | Scope | Status |
|-------|-------|--------|
| **0 — Foundation** | Monorepo, config-driven theming, design system, storefront shell, clients + `new:client`, docs, CI | 🟡 In progress |
| **1 — Storefront UX/UI** | Search + **autocomplete**, category nav, sort, cart drawer, saved shopping lists, checkout w/ delivery & pickup slots, **product detail page** ✅ | ✅ Done |
| **1.5 — Owner admin** | `/admin` (Auth.js credentials): product CRUD, inventory (stock), order-status flow; `ownerAdmin` flag | ✅ Done |
| **2 — Order tracking** | Real-time status (packing/shipped) + GPS map | ✅ Done |
| **3 — Payments** | Stripe cards, MobilePay, Klarna (FI) · bKash, Nagad, COD (BD) — region-driven via config; provider-agnostic layer (sandbox capture; real gateway SDKs plug in per client) | ✅ Done |
| **4 — Compliance / logistics** | Multi-warehouse routing (FI + BD supplier), GSP/preferential-origin duties, PEPPOL e-invoicing, phytosanitary docs | ⬜ Not started |
| **5 — i18n / GDPR / PWA hardening** | Finnish + English (+ Bangla for FreeStyleBD), GDPR consent, offline caching, Lighthouse perf | ⬜ Not started |

## Phase 0 checklist

- [x] Turborepo + pnpm monorepo (`turbo.json`, `pnpm-workspace.yaml`)
- [x] `packages/config` — typed `StoreConfig` + zod loader + brand→CSS tokens (tests pass)
- [x] `packages/ui` — "Fresh Market Vibrancy" design system (gradients + Framer Motion)
- [x] `apps/storefront` — Next.js PWA shell (themed home + product grid)
- [x] `clients/` — `_example`, `finnish-grocer` (grocery/FI), `freestylebd` (clothing/BD) + registry
- [x] `scripts/new-client.ts` — `pnpm new:client <company>` (TDD, 5/5 tests)
- [x] Crash-recovery: `CONTEXT.md`, dual-graph memory, decorated `README.md`
- [x] `docs/PLAYBOOK.md` + `writing-plans/` phase plans
- [x] custom backend (`@nextshop/db`) + Neon (replaces Medusa)
- [ ] CI (GitHub Actions) + storefront RTL test + Playwright smoke
- [ ] Full verification (build, theme switch, `pnpm new:client demo-co`)

## Active clients (storefronts this repo manages)

| id | Brand | Vertical | Country | Currency |
|----|-------|----------|---------|----------|
| `finnish-grocer` | Tuore 🥬 | Grocery | 🇫🇮 Finland | EUR |
| `freestylebd` | FreeStyleBD 🧵 | Clothing | 🇧🇩 Bangladesh | BDT |
| `_example` | Example Co | (base clone) | — | EUR |
