# Phase 1 — Storefront UX/UI

## Context
With the foundation in place, build the modern, user-friendly shopping experience on top of the
Medusa Store API. This is the "fast, intuitive, few-clicks" UX the project is about. Built with
the frontend-design language ("Fresh Market Vibrancy": vibrant soothing gradients + Framer Motion).

## Goal
A shopper can find products fast, build a cart (and reusable shopping lists), and check out with
a delivery or store-pickup time slot — all themed per client, all driven by feature flags.

## Tasks (each TDD, each its own small spec if needed)
- [ ] Product listing + category navigation (Medusa categories) with filters/sort
- [ ] Instant search + autocomplete (debounced, keyboard-navigable, accessible)
- [ ] Product detail page (variants — e.g. clothing sizes for FreeStyleBD; quantity for grocery)
- [ ] Cart (persistent, optimistic add/remove, Medusa line items)
- [ ] Saved shopping lists (behind `featureFlags.shoppingLists`)
- [ ] Checkout: address, delivery vs **store-pickup time slots** (behind `featureFlags.pickupSlots`)
- [ ] Empty/loading/error states; reduced-motion support throughout

## Key files (anticipated)
`apps/storefront/src/app/(shop)/…`, `apps/storefront/src/lib/medusa.ts` (real SDK client),
new components in `packages/ui` (SearchBar, CartDrawer, ProductDetail, SlotPicker).

## Notes
- Replace the Phase 0 demo product data with live Medusa data (`getFeaturedProducts` already
  falls back to demo data when `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is unset — wire the real path).
- Respect per-client `featureFlags`; clothing (FreeStyleBD) turns `pickupSlots` off.

## Verification
- E2E (Playwright): search → add to cart → checkout reaches payment step, for both
  `finnish-grocer` and `freestylebd`.
- Unit tests for cart math and search filtering.
