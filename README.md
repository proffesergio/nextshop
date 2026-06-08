<div align="center">

# 🛍️ Storefront Factory

### One codebase. Infinite storefronts. Any product, any country.

**A config-driven, production-ready eCommerce PWA template** — spin up a fully branded
online store for a new company in minutes, run it from an admin panel, and deploy instantly.

Powered by **Medusa** (commerce engine) · **Next.js** (PWA storefront) · **Turborepo** (monorepo)

`Grocery 🥬 Finland` &nbsp;•&nbsp; `Clothing 🧵 Bangladesh` &nbsp;•&nbsp; `…your store next`

</div>

---

## ✨ What this gives you

| | |
|---|---|
| 🎨 **Re-brand without code** | Colors, vibrant gradients, fonts, logo, locale, currency — all from one `store.config.ts`. |
| 🌍 **Multi-store, multi-country** | Each company is a `clients/<id>` config. Switch with one env var. Grocery in 🇫🇮, clothing in 🇧🇩, anything next. |
| ⚡ **Instant new store** | `pnpm new:client <company>` clones a ready store. Edit, deploy, done. |
| 🛒 **Real commerce, included** | Medusa gives you cart, orders, **multi-warehouse inventory**, multi-region, payments, and an **admin panel** out of the box. |
| 📱 **PWA-first** | Installable, fast, SSR + service worker, ready for app stores later. |
| 🧩 **Built to grow** | Phased roadmap: search → tracking → payments → export compliance. Each phase ships independently. |

---

## 🚀 Quickstart (run it locally)

```bash
pnpm install            # install the whole monorepo
pnpm dev                # start storefront (:3000) + Medusa admin
```

Pick which company's store to run with the **`STORE_CLIENT`** env var:

```bash
STORE_CLIENT=finnish-grocer  pnpm --filter @nextshop/storefront dev   # 🥬 Tuore (grocery, FI)
STORE_CLIENT=freestylebd     pnpm --filter @nextshop/storefront dev   # 🧵 FreeStyleBD (clothing, BD)
```

> Same code. Different brand, palette, currency, language, payment methods. That's the whole idea.

---

## 🏪 Launch a new company's store in 4 steps

```bash
# 1. Scaffold a branded clone from the base template
pnpm new:client acme-foods
```

```ts
// 2. Open clients/acme-foods/store.config.ts and make it theirs
brand:   { name: "Acme Foods", logo: "🍎", gradients: { hero: { from: "#…", to: "#…" } } },
domains: { primary: "shop.acmefoods.com" },
locales: { supported: ["en"], default: "en" },
currency: "usd",
payments: { enabledProviders: ["stripe", "manual"] },
```

```bash
# 3. Point the deployment at this client
STORE_CLIENT=acme-foods

# 4. Deploy the storefront (Vercel) → add the domain → done.
```

🟢 **That's a live, branded, production store.** Full walkthrough — including domain DNS,
admin-panel setup, and payment keys — lives in **[docs/PLAYBOOK.md](docs/PLAYBOOK.md)**.

---

## 🗂️ How it's organized

```
apps/
  storefront/   → Next.js PWA (the customer-facing store)
  medusa/       → commerce engine + admin panel
packages/
  config/       → StoreConfig schema (the re-brand contract) + loader
  ui/           → "Fresh Market Vibrancy" design system (gradients + Framer Motion)
clients/
  _example/     → 📋 base clone — `pnpm new:client` copies this
  finnish-grocer/  → 🥬 grocery store (Finland, EUR)
  freestylebd/     → 🧵 clothing store (Bangladesh, BDT)
  index.ts      → registry of every store this repo manages
scripts/
  new-client.ts → the `pnpm new:client` scaffolder (tested)
docs/PLAYBOOK.md → 📖 the operator + developer handbook
writing-plans/   → 🧭 per-phase implementation plans
```

---

## 🧑‍💼 For store operators (no code)

Everything that runs the business day-to-day lives in the **Medusa admin panel**:
products, prices, stock across warehouses, orders, regions, and which payment
providers are switched on. See **[docs/PLAYBOOK.md → Admin instructions](docs/PLAYBOOK.md)**.

## 🧑‍💻 For developers

- Add a feature the continuation way: write a spec → a plan in `writing-plans/` → build (graph-first).
- `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:e2e`
- Roadmap & phase status: **[ROADMAP.md](ROADMAP.md)**

---

<div align="center">
<sub>Build a real eCommerce business, made easy. 🌱</sub>
</div>
