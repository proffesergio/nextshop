<div align="center">

# 🛒 NextShop

### A factory for independent storefronts.

Build a production-ready eCommerce PWA **once**, then spin up a **fully isolated store for each
client** — its own repo, its own admin, its own backend — all sharing a versioned design system.

**Next.js** · **Neon Postgres** · **Drizzle** · **Turborepo** · **GitHub Packages**

`Tuore 🥬 Finland` &nbsp;•&nbsp; `FreeStyleBD 🧵 Bangladesh` &nbsp;•&nbsp; `…your client next`

</div>

---

## 🧠 The model: a factory + independent client repos

```
NextShop (THIS repo — the factory)
  packages/config · ui · tsconfig · eslint-config   ─► published to GitHub Packages (@nextshop/*)
  apps/storefront                                    ─► the base storefront template
  packages/db                                        ─► custom backend (repository + Neon/Drizzle)
  scripts/                                           ─► tooling to spin up client repos
        │
        ├──►  repo: tuore        ·  own Vercel  ·  own Neon DB  ·  own admin   🥬
        └──►  repo: freestylebd  ·  own Vercel  ·  own Neon DB  ·  own admin   🧵
```

- **Each client is its own repo + its own backend** → fully isolated. A change to one client can
  **never** break another, and each owner's admin/data is separate.
- **Shared design & logic live in published packages.** Clients pull improvements with
  `pnpm update @nextshop/ui @nextshop/config` — no copy-paste, no merge conflicts.
- **This repo is the control-plane**: the template, the shared packages, and the spin-up tooling.

> Why this and not "one codebase, many stores"? You chose **maximum independence** — different
> products, designs, admin features, and release timing per client, with zero cross-client conflict.
> See [`executing-plans/architecture-template-and-client-repos.md`](executing-plans/architecture-template-and-client-repos.md).

---

## ✨ What you get

| | |
|---|---|
| 🎨 **Re-brand from data** | Colors, vibrant gradients, fonts, logo, locale, currency — all in one `store.config.ts`. |
| 🧩 **Vertical-agnostic** | Same engine for grocery 🥬 and clothing 🧵; products/strategy differ per client. |
| 🛒 **Real commerce** | `@nextshop/db`: products, orders, inventory via Neon Postgres + Drizzle; owner admin (custom, planned). |
| 📦 **Shared, versioned UI** | "Fresh Market Vibrancy" design system (gradients + Framer Motion) published as a package. |
| 🔐 **Isolated admin** | Each client gets its own Neon DB + owner admin (custom, planned). |
| 📱 **PWA-first** | Installable, fast, SSR + service worker. |

---

## 🚀 Run the template locally

```bash
export PATH="$HOME/.npm-global/bin:$PATH"   # pnpm on PATH
pnpm install
```

Preview the demo storefronts (all at once, side by side):
```bash
./testservers/run-all.sh        # 🥬 :3000  ·  🧵 :3001  ·  base :3002
./testservers/stop-all.sh
```
Or one at a time:
```bash
STORE_CLIENT=finnish-grocer pnpm --filter @nextshop/storefront dev   # http://localhost:3000
```
Full run guide (incl. the backend/DB): [`testservers/README.md`](testservers/README.md).

---

## 🏪 Launch a new client (the factory workflow)

1. **Create the client's repo** from the template (own repo, isolated):
   ```bash
   gh repo create <client> --private --template <org>/nextshop-client-template
   ```
2. **Brand it** — edit `store.config.ts` (name, gradients, logo, locale, currency, payments, domains).
3. **Set up its own backend** — create a free Neon project, set `DATABASE_URL`, run `pnpm --filter @nextshop/db db:push` to create tables.
4. **Deploy** — storefront on Vercel (`STORE_CLIENT`, `DATABASE_URL`), add the domain.
5. **Stay current** — `pnpm update @nextshop/ui @nextshop/config` pulls shared fixes/features.

Step-by-step (domains, admin, payments): [`docs/PLAYBOOK.md`](docs/PLAYBOOK.md) ·
git & isolation strategy: [`executing-plans/git-and-admin-playbook.md`](executing-plans/git-and-admin-playbook.md).

---

## 📦 Shared packages (published to GitHub Packages)

| Package | What |
|---------|------|
| `@nextshop/config` | `StoreConfig` schema + loader + brand→CSS tokens |
| `@nextshop/ui` | "Fresh Market Vibrancy" design system (consume via Next `transpilePackages`) |
| `@nextshop/tsconfig` · `@nextshop/eslint-config` | shared dev config |

Versioned with **Changesets**; published by `.github/workflows/release.yml`. Run `pnpm changeset`
after a change to queue a version bump.

---

## 🗂️ Repo layout

```
apps/storefront      Next.js PWA (template base) + API route handlers (POST /api/orders, etc.)
packages/db          custom backend: repository layer over Neon serverless Postgres via Drizzle (in-memory fallback when DATABASE_URL is unset)
packages/            shared, published: config · ui · tsconfig · eslint-config
clients/             demo configs (finnish-grocer, freestylebd, _example) — template showcase
scripts/             new-client + (future) create-client-repo tooling
testservers/         run every storefront + admin locally
docs/PLAYBOOK.md     operator + developer handbook
writing-plans/       per-phase implementation plans
executing-plans/     architecture + git/admin playbooks
ROADMAP.md           phase status · CONTEXT.md  resume point
```

---

## 🧑‍💻 Developer commands

```bash
pnpm dev · pnpm build · pnpm lint · pnpm typecheck · pnpm test · pnpm test:e2e
pnpm new:client <name>     # add a demo client to the template (in-repo)
pnpm changeset             # queue a shared-package version bump
```

<div align="center"><sub>Build a real eCommerce business per client — isolated, brandable, made easy. 🌱</sub></div>
