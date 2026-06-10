# Modern Shop UI (Amazon/Alibaba-style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Checkbox steps.

**Goal:** Turn the minimal home page into a complete modern shop: merchandised product shelves (Deals, Top rated), category showcase tiles, rich product cards (ratings, discount badges, stock urgency), USP/trust strip, announcement bar, promo banners, newsletter capture, multi-column footer, and related products on the detail page.

**Architecture:** Merchandising logic (discounts, deals, top-rated, related) in `@nextshop/commerce-core` (TDD). Marketing content (announcement, USPs, promos) added to `StoreConfig` so every client drives its own messaging. New presentational components in `@nextshop/ui`. StoreHome recomposed; demo catalogs enriched with `compareAtAmount`/`rating`/`reviewCount`/`stock`.

---

### Task 1 — commerce-core `merchandising.ts` (TDD)
- [ ] Product type: add `compareAtAmount?: number; rating?: number; reviewCount?: number`.
- [ ] `discountPercent(p)` (0 unless `compareAtAmount > amount`; rounded %), `isOnSale(p)`, `dealProducts(list)`, `topRated(list, min=4.5)` (sorted desc), `relatedProducts(p, list, limit=4)` (same category, excl. self). Tests in `__tests__/merchandising.test.ts`. Export from index. Commit.

### Task 2 — config `marketing` section (TDD)
- [ ] `marketingSchema`: `announcement?: string`, `usps: {icon,title,text}[] = []`, `promos: {icon?,title,text,cta,href}[] = []`; `marketing` defaults to `{}` on StoreConfig. Test defaults parse. Commit.

### Task 3 — ui: new components + card/footer upgrades
- [ ] `RatingStars` (★ row + count, accent color), `AnnouncementBar`, `UspStrip`, `CategoryShowcase` (gradient tiles w/ icon), `ProductShelf` (h-scroll, snap, title + See all), `PromoBanner`, `NewsletterSignup` (visual; onSubmit→thanks state).
- [ ] `ProductCard`: optional `compareAtPrice`, `discountPercent` (corner badge), `rating`/`reviewCount` (stars), `stockHint` (accent text). Backward compatible.
- [ ] `Footer`: multi-column (brand blurb · Shop · Help · payment icons row · copyright). Export all. Typecheck. Commit.

### Task 4 — clients: marketing content + richer demo catalogs
- [ ] finnish-grocer + freestylebd + `_example`: add `marketing` (announcement, 4 USPs, 2 promos each, vertical-appropriate).
- [ ] `lib/products.ts` demo data: add `compareAtAmount` (sale items), `rating`/`reviewCount` (all), `stock` (varied incl. low-stock). Commit.

### Task 5 — StoreHome recomposition (+tests)
- [ ] Order: AnnouncementBar → Header → Hero → UspStrip → CategoryShowcase → 🔥 Deals shelf → ⭐ Top rated shelf → full catalog (search/tabs/sort/grid, existing) → PromoBanners → NewsletterSignup → Footer(new).
- [ ] `toCard` computes formatted compare price, discount %, stock hint ("Only N left"/"Out of stock").
- [ ] Tests: existing 6 stay green; add: announcement renders; deals shelf lists discounted product; USP strip renders. Commit.

### Task 6 — ProductDetail: rating + related products shelf
- [ ] Page passes `related = relatedProducts(product, all)`; detail shows RatingStars, compare-at strikethrough + discount badge, stock hint, related shelf linking to `/products/[id]`. Test: related titles render. Commit.

### Task 7 — ship
- [ ] Root gates + both client builds; changeset (`ui` minor, `commerce-core` minor, `config` minor); rebuild + restart live demo server (tunnel persists); ROADMAP/CONTEXT/memory; push.
