# 📖 Playbook — NextShop

The operator + developer handbook. Everything you need to **launch, brand, and run** a
storefront for a new company, plus how to extend the platform.

> **Architecture model (canonical):** NextShop is a **factory** — each client is its **own repo**
> with its **own dedicated backend + DB** (custom: Next.js API routes over **Neon Postgres** via
> `@nextshop/db`), consuming the shared `@nextshop/*` packages from npm (`pnpm update` for fixes). See
> [`../executing-plans/architecture-template-and-client-repos.md`](../executing-plans/architecture-template-and-client-repos.md).
> In §2 below, `pnpm new:client` is the **in-repo/template** convenience (adds a demo client to this
> repo); for a real production client you instead **create its own repo** (`gh repo create <client>
> --template <org>/nextshop-client-template`) and give it a dedicated backend (§5, §7).

- [1. Phases & how we build](#1-phases--how-we-build)
- [2. New-client onboarding](#2-new-client-onboarding)
- [3. Domain configuration](#3-domain-configuration)
- [4. Theming (gradient palette & brand)](#4-theming)
- [5. Admin instructions (no code)](#5-admin-instructions-no-code)
- [6. Developer instructions](#6-developer-instructions)
- [7. Deployment](#7-deployment)

---

## 1. Phases & how we build

Work is split into independent **phases** (see [ROADMAP.md](../ROADMAP.md)). Each phase is built
with the **continuation method** so we never re-read the whole codebase:

1. Write a short spec, then an implementation plan in **`writing-plans/<phase>.md`**.
2. **Session start:** dual-graph `graph_continue` → `graph_scan(pwd)` if needed → `graph_read`
   only recommended files. No broad grep / whole-repo reads.
3. **During:** log decisions/tasks with `graph_add_memory`; `graph_register_edit` after edits.
4. **Session end:** update `CONTEXT.md` (Current Task / Key Decisions / Next Steps) + `ROADMAP.md`.

Phase plans live in [`writing-plans/`](../writing-plans). Phase 0 is the foundation; Phases 1–5
add UX, tracking, payments, compliance, and i18n/PWA hardening.

---

## 2. New-client onboarding

> Goal: a fully branded, deployable store for a new company in minutes.

```bash
pnpm new:client <company>      # e.g. pnpm new:client acme-foods
```

This **clones `clients/_example`** into `clients/<company>/`, rewrites the `id`, brand name,
and primary domain, and **registers the store** in `clients/index.ts`. Then:

| Step | What you do | Where |
|------|-------------|-------|
| 1 | Run the scaffolder | terminal |
| 2 | Set **brand** tokens, gradients, logo | `clients/<company>/store.config.ts` → `brand` |
| 3 | Set **locales**, **currency**, **regions** | same file |
| 4 | Choose **payment providers** | same file → `payments.enabledProviders` |
| 5 | Declare **warehouses** | same file → `warehouses` |
| 6 | Toggle **feature flags** | same file → `featureFlags` |
| 7 | Set **domain(s)** | same file → `domains` (see §3) |
| 8 | Set `STORE_CLIENT=<company>` + secrets | deployment env (see §7) |
| 9 | Deploy | Vercel + Neon DB (see §7) |

The config is validated by zod at build time, so a malformed store **fails fast** instead of
breaking in production.

**Verify locally before deploying:**
```bash
STORE_CLIENT=<company> pnpm --filter @nextshop/storefront dev
```

---

## 3. Domain configuration

Each client declares its hostnames in `store.config.ts`:

```ts
domains: {
  primary: "shop.company.com",     // production
  aliases: ["www.company.com"],     // extra hostnames that resolve here
  staging: "staging.company.com",   // preview
}
```

**Storefront (Vercel):**
1. Create/select the client's Vercel project; set env `STORE_CLIENT=<company>`.
2. Add `primary` + each `alias` as domains on that project.
3. At your registrar, point the domain to Vercel (CNAME `cname.vercel-dns.com`, or A record per
   Vercel's instructions).

**Backend (custom, embedded):** there is no separate backend service to point at — the storefront's
own API route handlers talk directly to **`@nextshop/db`** (a repository over **Neon Postgres**). Each
client gets its **own Neon database**; set that client's **`DATABASE_URL`** in its deployment env. With
no `DATABASE_URL` the store runs on in-memory demo data, so previews work with zero infra.

---

## 4. Theming

All visual identity is data in `store.config.ts` → `brand`. No component edits needed.

```ts
brand: {
  name: "Acme Foods",
  logo: "🍎",                         // emoji or "/logo.svg" (in storefront /public)
  colors: { primary, secondary, accent, background, foreground, muted },
  gradients: {
    hero: { from: "#15803d", via: "#65a30d", to: "#facc15", angle: 130 },
    card: { from: "#f0fdf4", to: "#ffffff", angle: 160 },
    cta:  { from: "#fb7185", to: "#f59e0b", angle: 115 },
  },
  font: { sans: "...", display: "..." },
  radius: 20,
}
```

These become CSS custom properties (`--color-*`, `--gradient-*`, `--font-*`, `--radius`) injected
by `<BrandStyle>`; the whole design system (`@nextshop/ui`) reads them live. **Switching
`STORE_CLIENT` re-skins the entire store with zero code changes** — that's the core proof of the
template. Keep gradients vibrant **but soothing** (the "Fresh Market Vibrancy" language).

---

## 5. Admin instructions (no code)

Day-to-day business will run from the **owner admin** — a custom panel at **`/admin`** inside the Next
app (Auth.js auth over `@nextshop/db`). **Status: planned** (next increment). It will cover:

- **Products & categories** — create items, images, variants (e.g. clothing sizes), prices.
- **Inventory** — stock levels per product.
- **Orders** — view, fulfil, refund; update status (drives Phase 2 real-time tracking).
- **Regions & currencies** — must match the client's `regions` in `store.config.ts`.
- **Payments & shipping** — enable providers; they should line up with `payments.enabledProviders`.

Until the admin ships, manage data directly in the database (Neon's SQL console) or via `@nextshop/db`.

> Operators never touch code. Developers wire a capability once; operators flip it on in admin.

---

## 6. Developer instructions

```bash
pnpm install            # install the monorepo
pnpm dev                # run everything (turbo)
pnpm build              # build all packages + apps
pnpm lint               # eslint across the workspace
pnpm typecheck          # tsc across the workspace
pnpm test               # unit tests (vitest)
pnpm test:e2e           # Playwright e2e
```

**Add a feature (the continuation way):**
1. Spec it, then write `writing-plans/<feature>.md`.
2. Build test-first (TDD). Keep units small and well-bounded.
3. `graph_register_edit` your changes; update `CONTEXT.md` + `ROADMAP.md`.

**Add a payment method / region rule:** extend `StoreConfig` in `packages/config/src/schema.ts`,
implement behind the relevant `featureFlags`/`payments` keys, and document it here.

---

## 7. Deployment

| Component | Recommended host | Notes |
|-----------|------------------|-------|
| Storefront + backend (`apps/storefront`) | **Vercel** | One project per client; the backend is embedded (API route handlers). Set `STORE_CLIENT` + `DATABASE_URL`. |
| Database | **Neon** (serverless Postgres) | One per client; free tier. `pnpm --filter @nextshop/db db:push` creates tables. |

**Required env:** `STORE_CLIENT` (which client config to serve) and `DATABASE_URL` (the client's Neon
connection string). With no `DATABASE_URL` the store serves in-memory demo data (handy for previews).

CI (GitHub Actions) runs lint → typecheck → unit tests → build → `pnpm audit` on every push, and
a Playwright smoke test. Merge to your main branch triggers deploy.
