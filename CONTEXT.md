# CONTEXT — resume point

**Project:** NextShop — a factory monorepo (Turborepo + pnpm) for spinning up many isolated client
storefronts. Repo: github.com/proffesergio/nextshop (pushed, main).

**Architecture (current):**
- Storefront = Next.js PWA (`apps/storefront`). **Custom backend, NOT Medusa.**
- **Backend = `@nextshop/db`** repository pattern: `getRepository(seed?)` returns a **Neon/Drizzle**
  Postgres repo when `DATABASE_URL` is set, else an **in-memory** repo seeded with demo products.
  Interface covers products + orders (incl. `updateOrderStatus` for Phase 2 tracking).
- Shared **published** packages (npm public, scope `@nextshop`): `config`, `ui`, `commerce-core`,
  `db`, `tsconfig`, `eslint-config`. Each client = its own repo consuming these via `pnpm update`.
- `clients/<id>/store.config.ts` + `STORE_CLIENT` = template demo data (finnish-grocer, freestylebd,
  _example). Per-feature plans → `writing-plans/`, architecture/ops → `executing-plans/`.

**Why custom backend:** Medusa Cloud costs $/mo and self-hosting one Medusa per client is heavy.
Decision: lightweight backend embedded in the Next app on free Neon Postgres, reusing commerce-core.
Plan: `writing-plans/phase-backend-custom.md`.

**Done & green (67 tests · typecheck 7/7 · lint 6/6 · builds):**
- `commerce-core` (TDD): cart, search, money, lists, checkout (slots/total/validate), order (buildOrderDraft).
- `ui`: SearchBar, CategoryTabs, QuantityStepper, CartDrawer, ListsDrawer, FulfillmentToggle, SlotPicker.
- Storefront: search/filter/sort, cart drawer, saved shopping lists (`featureFlags.shoppingLists`),
  `/checkout` with delivery/pickup slots (`featureFlags.pickupSlots`), products via `@nextshop/db`,
  order persisted via `POST /api/orders` (fire-and-forget from CheckoutForm).
- `apps/medusa` REMOVED; `@nextshop/medusa` dropped from changeset ignore; `.medusa` out of turbo.
- Publishing: npm public, Changesets, `release.yml` (NPM_TOKEN). Repo pushed.

**Pending one-time setup (user):** npm org `nextshop` + `NPM_TOKEN` GitHub secret (to publish);
Neon project + `DATABASE_URL` + `pnpm --filter @nextshop/db db:push` (to go live with a real DB).

**Phase 1 COMPLETE (green):** search **autocomplete** (`suggestProducts` in commerce-core, TDD) +
`SearchAutocomplete` combobox (ui, ARIA + keyboard); **product detail page** `/products/[id]` +
`ProductDetail` (add-to-cart, qty); ProductCard links to detail; `getProduct` in products.ts.
82 tests green (commerce-core 42, storefront 21, db 5, config 9, scripts 5); typecheck 7/7, lint 6/6,
both clients build (`/products/[id]` route present). Medusa fully removed; docs swept to custom backend.

**Next:**
- Build the **owner admin** (`/admin`, Auth.js over `@nextshop/db`: product/order/inventory CRUD) — so
  shop owners can manage their store. (Backend exists; no admin UI yet.)
- Phase 2: real-time order tracking (status timeline + GPS) — `updateOrderStatus` already exists in db.
- Optional: go live with a real DB (Neon `DATABASE_URL` + `pnpm --filter @nextshop/db db:push`).
