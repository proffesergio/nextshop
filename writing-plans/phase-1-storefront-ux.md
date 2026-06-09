# Phase 1 — Storefront UX/UI

## Context
With the foundation in place, build the modern, user-friendly shopping experience on top of the
**`@nextshop/db`** repository (custom backend; in-memory demo data when `DATABASE_URL` is unset, Neon
Postgres when set). The "fast, intuitive, few-clicks" UX, built with the frontend-design language
("Fresh Market Vibrancy": vibrant soothing gradients + Framer Motion).

## Goal
A shopper can find products fast, build a cart (and reusable shopping lists), and check out with
a delivery or store-pickup time slot — all themed per client, all driven by feature flags.

## Tasks (each TDD, each its own small spec if needed)
- [x] Product listing + category navigation with filters/sort
- [ ] Instant search + **autocomplete** (debounced, keyboard-navigable, accessible)  ← next
- [ ] Product detail page (variants — e.g. clothing sizes for FreeStyleBD; quantity for grocery)  ← next
- [x] Cart (persistent via localStorage, optimistic add/remove)
- [x] Saved shopping lists (behind `featureFlags.shoppingLists`)
- [x] Checkout: address, delivery vs **store-pickup time slots** (behind `featureFlags.pickupSlots`)
- [ ] Empty/loading/error states; reduced-motion support throughout

## Key files
`apps/storefront/src/components/StoreHome.tsx`, `apps/storefront/src/components/CheckoutForm.tsx`,
`apps/storefront/src/lib/{products,useCart,useShoppingLists}.ts`, `apps/storefront/src/app/api/orders/route.ts`,
shared logic in `@nextshop/commerce-core` + components in `@nextshop/ui`.

## Notes
- Products come from `getRepository(...).listProducts()` (`@nextshop/db`). The repo returns demo data
  when `DATABASE_URL` is unset and live Neon data when it is set — same code path either way.
- Orders persist via `POST /api/orders` (server route handler → `getRepository().createOrder(draft)`).
- Respect per-client `featureFlags`; clothing (FreeStyleBD) turns `pickupSlots` off.

## Verification
- E2E (Playwright): search → add to cart → checkout reaches confirmation, for both
  `finnish-grocer` and `freestylebd`.
- Unit tests for cart math, search filtering, checkout, and order building (in `commerce-core`).
