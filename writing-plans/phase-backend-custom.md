# Phase: Custom backend (replace Medusa)

## Context
Medusa's engine is free but self-hosting one backend **per shop** (Node + Postgres + Redis) is heavy
for a solo dev. Decision: a **custom lightweight backend embedded in the Next.js app**, on free
**Neon** serverless Postgres, reusing `@nextshop/commerce-core`. One deployable per shop, free DB,
fully owned. `commerce-core` (cart/checkout/search/lists/money) is backend-agnostic and unchanged.

## Design — repository pattern
A single **`CommerceRepository`** interface; two implementations behind it so the app runs with or
without a database:
- **`InMemoryRepository`** — seeded demo data; used in dev/tests and when `DATABASE_URL` is unset.
- **`NeonRepository`** (Drizzle ORM + `@neondatabase/serverless`) — used when `DATABASE_URL` is set.

`getRepository()` picks based on env. Domain types (`Order`, `OrderStatus`, `buildOrderDraft`) live in
`commerce-core` (tested); persistence lives in `@nextshop/db`.

```
@nextshop/commerce-core  order.ts  → buildOrderDraft(cart, checkout) (pure, TDD)
@nextshop/db
  repository.ts   CommerceRepository interface + types
  memory.ts       InMemoryRepository (TDD)
  schema.ts       Drizzle pg schema (products, orders)
  neon.ts         NeonRepository (Drizzle + Neon)
  factory.ts      getRepository() — env-selected
apps/storefront
  lib/products.ts → getRepository().listProducts()
  app/api/orders  → POST creates an order via the repo
  app/admin/*     → owner admin (NEXT increment)
```

## Tasks
- [x] commerce-core `order.ts`: `OrderStatus`, `OrderDraft`, `buildOrderDraft` (items snapshot + total) — TDD.
- [x] `@nextshop/db`: `CommerceRepository`, `InMemoryRepository` (products + orders) — TDD.
- [x] Drizzle `schema.ts` + `NeonRepository` + `getRepository()` factory (env-selected).
- [x] Storefront: product listing via repo (replaces Medusa fetch); seed demo products into in-memory.
- [ ] Order API route (`POST /api/orders`) + checkout persists the order. *(next)*
- [ ] Owner admin (`/admin`, Auth.js): product + order CRUD, inventory. *(next)*
- [x] Remove `apps/medusa`; update workspace/CI/changeset/docs.

## DB setup (when going live)
1. Create a free **Neon** project → copy its `DATABASE_URL`.
2. Set `DATABASE_URL` in the app env (local `.env.local`, Vercel/host env).
3. `pnpm --filter @nextshop/db db:push` (Drizzle Kit) to create tables; seed.

## Verification
- `pnpm test` green incl. new commerce-core order tests + db in-memory repo tests.
- Storefront lists products from the repo with no `DATABASE_URL` (in-memory demo) and builds.
- With `DATABASE_URL` set + pushed, products/orders persist in Neon.
