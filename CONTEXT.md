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

**Phase 1 COMPLETE (green):** search **autocomplete** (`suggestProducts`) + `SearchAutocomplete`
combobox; **product detail page** `/products/[id]` + `ProductDetail`; `getProduct` in products.ts.

**Owner admin COMPLETE (green):** `/admin` (plan: `writing-plans/phase-admin-owner.md`).
Auth.js (next-auth@5 beta) Credentials over env `ADMIN_EMAIL`/`ADMIN_PASSWORD` (dev fallback
owner@nextshop.dev / nextshop-dev; see `apps/storefront/.env.example`); pure logic in
`src/lib/owner-auth.ts`. commerce-core: `nextOrderStatuses`/`canTransitionOrder`,
`validateProductInput`/`validateProductPatch`, `verifyOwnerCredentials`, `isLowStock`,
`Product.stock`. db: `stock` column. config: `featureFlags.ownerAdmin` (default true).
Storefront: `admin/(protected)` layout (flag + session gate), dashboard, products CRUD pages,
orders page with status mover; guarded `/api/admin/products[,(id)]` + `/api/admin/orders/[id]`.
120 tests green (commerce-core 56, storefront 43, db 6, config 10, scripts 5); typecheck 7/7,
lint 6/6, both clients build (all `/admin*` routes ƒ). Changeset `.changeset/owner-admin.md` added.

**Phase 2 COMPLETE (green):** live tracking at `/orders/[id]` (plan:
`writing-plans/phase-2-order-tracking.md`). commerce-core `tracking.ts`
(orderTimeline/trackingProgress/isValidCoordinates); `Order.courier` + db courier lat/lng cols +
`updateOrderLocation`; public `GET /api/orders/[id]`; owner `PATCH /api/admin/orders/[id]/location`;
ui `OrderTimeline` (animated gradient spine + pulsing live halo); `OrderTracking` polls every 10s,
OSM iframe map behind `featureFlags.gpsTracking` (on for finnish-grocer, off freestylebd);
checkout now links "Track your order"; admin orders row gets Set GPS for shipped orders.
139 tests green (commerce-core 61, storefront 56, db 7, config 10, scripts 5); typecheck 7/7,
lint 6/6, both builds (`/orders/[id]` present). `docs/DEPLOY.md` = local run + Vercel/Neon guide.

**Modern shop UI COMPLETE (green):** Amazon-style home (plan: `writing-plans/phase-ui-modern-shop.md`).
commerce-core `merchandising.ts` (discountPercent/isOnSale/dealProducts/topRated/relatedProducts;
Product gains compareAtAmount/rating/reviewCount); config `marketing` (announcement/usps/promos,
client-driven); ui: AnnouncementBar, UspStrip, CategoryShowcase, ProductShelf, PromoBanner,
NewsletterSignup, RatingStars, richer ProductCard (deal badge, stars, compare-at, stock urgency,
sold-out), multi-column Footer. StoreHome: announcement → hero → USPs → category tiles → Deals +
Top-rated shelves → catalog → promos → newsletter. ProductDetail: rating/discount/stock + related
shelf. 151 tests green; typecheck/lint/builds green. **Live MVP:** local prod server :3000 +
cloudflared tunnel (recipe `docs/DEPLOY.md` §1.5); admin demo owner@tuore.demo / tuore-demo-2026.

**Phase 3 payments COMPLETE (green):** provider-agnostic layer (plan:
`writing-plans/phase-3-payments.md`). commerce-core `payments.ts` (PAYMENT_PROVIDERS catalog:
stripe/card/klarna/mobilepay/bkash/nagad/cod/manual; availablePaymentMethods,
validatePaymentSelection, paymentForMethod — instant=paid (sandbox), cod=pending);
`Order.payment {method,status}` persisted (db cols + `updateOrderPayment`); ui
`PaymentMethodPicker`; checkout payment step driven by `payments.enabledProviders`
(FI: stripe/klarna/mobilepay/manual · BD: bkash/nagad/card/manual); tracking shows pay status;
admin orders: payment column + Mark paid (PATCH /api/admin/orders/[id]/payment, 409 if paid).
166 tests green (commerce-core 74, storefront 68, db 8, config 11, scripts 5). Real gateway
SDKs (Stripe/bKash) plug in later behind the same provider ids. Both demo storefronts live
(Tuore :3000, FreeStyleBD :3001 via NEXT_DIST_DIR; SaaS-pivot assessment: see graph memory).

**Next (in order):**
1. **Awaiting client approval** of the live MVP demo (tunnel URL is ephemeral; relaunch recipe
   `docs/DEPLOY.md` §1.5; admin demo owner@tuore.demo / tuore-demo-2026).
2. On approval → **go live**: Vercel project per client + Neon `DATABASE_URL` +
   `pnpm --filter @nextshop/db db:push` (`docs/DEPLOY.md` §2), then per-client feature requests.
3. **Phase 3 payments** (next roadmap build): Stripe/MobilePay/Klarna (FI) · bKash/Nagad/COD (BD),
   via `payments.enabledProviders` + featureFlags. Plans 1/1.5/2/UI all ✅ in `writing-plans/`.
4. Backlog: order notifications (email/SMS), courier geolocation page, customer order history,
   admin sales charts, i18n (Phase 5). One-time setup still pending: npm org + NPM_TOKEN secret.
