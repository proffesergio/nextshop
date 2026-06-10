# Phase 2 — Real-time Order Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customers follow their order live at `/orders/[id]` — an animated status timeline (pending → packing → shipped → delivered, with cancellation) plus a courier GPS map (behind `featureFlags.gpsTracking`) — updated by polling; the owner drives status (exists) and courier location (new) from `/admin`.

**Architecture:** Timeline derivation + coordinate validation in `@nextshop/commerce-core` (TDD). `@nextshop/db` orders gain courier lat/lng/updatedAt + `updateOrderLocation`. Storefront adds public `GET /api/orders/[id]` (the order id is the capability token), owner-only `PATCH /api/admin/orders/[id]/location`, and the tracking page. The timeline UI is a new `@nextshop/ui` `OrderTimeline` — "living delivery journey": a gradient spine that grows to the current step with a pulsing live halo, themed entirely by client CSS vars.

**Tech Stack:** framer-motion (already in ui), OpenStreetMap embed iframe (free, no key), 10s polling.

---

### Task 1: commerce-core — timeline derivation (`tracking.ts`)

**Files:** Create `packages/commerce-core/src/tracking.ts`, test `packages/commerce-core/src/__tests__/tracking.test.ts`, export from `index.ts`.

- [ ] Failing test:

```ts
import { describe, it, expect } from "vitest";
import { orderTimeline, trackingProgress, isValidCoordinates } from "../tracking.js";

describe("orderTimeline", () => {
  it("marks done/current/upcoming around the active status", () => {
    expect(orderTimeline("shipped")).toEqual([
      { status: "pending", state: "done" },
      { status: "packing", state: "done" },
      { status: "shipped", state: "current" },
      { status: "delivered", state: "upcoming" },
    ]);
  });

  it("delivered completes every step", () => {
    expect(orderTimeline("delivered").every((s, i, a) => (i < a.length - 1 ? s.state === "done" : s.state === "current"))).toBe(true);
  });

  it("cancelled collapses to received → cancelled", () => {
    expect(orderTimeline("cancelled")).toEqual([
      { status: "pending", state: "done" },
      { status: "cancelled", state: "current" },
    ]);
  });
});

describe("trackingProgress", () => {
  it("maps the flow onto 0..1", () => {
    expect(trackingProgress("pending")).toBe(0);
    expect(trackingProgress("packing")).toBeCloseTo(1 / 3);
    expect(trackingProgress("delivered")).toBe(1);
    expect(trackingProgress("cancelled")).toBe(1);
  });
});

describe("isValidCoordinates", () => {
  it("accepts real lat/lng and rejects out-of-range or non-numbers", () => {
    expect(isValidCoordinates(60.17, 24.94)).toBe(true);
    expect(isValidCoordinates(91, 0)).toBe(false);
    expect(isValidCoordinates(0, 181)).toBe(false);
    expect(isValidCoordinates(Number.NaN, 0)).toBe(false);
  });
});
```

- [ ] Implement `tracking.ts`:

```ts
import type { OrderStatus } from "./types.js";

/** The happy-path fulfilment flow shown on the tracking timeline. */
export const ORDER_FLOW: OrderStatus[] = ["pending", "packing", "shipped", "delivered"];

export interface TimelineStep {
  status: OrderStatus;
  state: "done" | "current" | "upcoming";
}

/** Derive the tracking timeline for an order status. */
export function orderTimeline(status: OrderStatus): TimelineStep[] {
  if (status === "cancelled") {
    return [
      { status: "pending", state: "done" },
      { status: "cancelled", state: "current" },
    ];
  }
  const idx = ORDER_FLOW.indexOf(status);
  return ORDER_FLOW.map((s, i) => ({
    status: s,
    state: i < idx ? "done" : i === idx ? "current" : "upcoming",
  }));
}

/** 0..1 progress along the flow (drives the animated timeline spine). */
export function trackingProgress(status: OrderStatus): number {
  if (status === "cancelled") return 1;
  return ORDER_FLOW.indexOf(status) / (ORDER_FLOW.length - 1);
}

/** Validate courier GPS coordinates. */
export function isValidCoordinates(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    typeof lng === "number" && Number.isFinite(lng) && lng >= -180 && lng <= 180
  );
}
```

Add `export * from "./tracking.js";` to index. Run, PASS, commit `feat(commerce-core): order tracking timeline + coordinate validation`.

---

### Task 2: types + db — courier location

**Files:** `packages/commerce-core/src/types.ts`, `packages/db/src/{repository,schema,memory,neon}.ts`, test `packages/db/src/__tests__/memory.test.ts`.

- [ ] `types.ts` — add to `Order` (NOT OrderDraft):

```ts
/** Live courier position (Phase 2 GPS tracking). */
export interface CourierLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}
```
and on `Order`: `courier?: CourierLocation;`

- [ ] Failing db test:

```ts
it("stores and returns the courier location", async () => {
  const repo = new InMemoryRepository();
  const order = await repo.createOrder(draft);
  const updated = await repo.updateOrderLocation(order.id, { lat: 60.17, lng: 24.94 });
  expect(updated?.courier?.lat).toBe(60.17);
  expect(updated?.courier?.updatedAt).toBeTruthy();
  expect(await repo.updateOrderLocation("missing", { lat: 0, lng: 0 })).toBeNull();
});
```

- [ ] Implement: `repository.ts` adds `updateOrderLocation(id: string, loc: { lat: number; lng: number }): Promise<Order | null>;`
  `memory.ts`: set `courier = { ...loc, updatedAt: new Date().toISOString() }`.
  `schema.ts` orders: `courierLat: doublePrecision("courier_lat")`, `courierLng: doublePrecision("courier_lng")`, `courierUpdatedAt: timestamp("courier_updated_at", { withTimezone: true })`.
  `neon.ts`: map in `rowToOrder` (`r.courierLat != null && r.courierLng != null` → courier), implement update with `.returning()`.
  Run db tests + typecheck, commit `feat(db): courier location on orders`.

---

### Task 3: storefront — public order lookup API

**Files:** `apps/storefront/src/app/api/orders/[id]/route.ts`, test `apps/storefront/src/app/api/orders/get.test.ts`.

- [ ] Failing test (no auth mock — public):

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { resetRepository, getRepository } from "@nextshop/db";
import { GET } from "./[id]/route";
// draft fixture as in admin orders test
beforeEach(() => resetRepository());

it("returns an order by id", async () => {
  const order = await getRepository().createOrder(draft);
  const res = await GET(new Request("http://test"), { params: { id: order.id } });
  expect(res.status).toBe(200);
  expect((await res.json()).id).toBe(order.id);
});

it("404s for unknown ids", async () => {
  expect((await GET(new Request("http://test"), { params: { id: "nope" } })).status).toBe(404);
});
```

- [ ] Implement:

```ts
import { getStoreRepository } from "@/lib/products";

/** GET /api/orders/:id — public order tracking lookup (the id is the capability). */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const order = await getStoreRepository().getOrder(params.id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(order);
}
```

Run, PASS, commit `feat(storefront): public order lookup API`.

---

### Task 4: storefront — courier location admin API

**Files:** `apps/storefront/src/app/api/admin/orders/[id]/location/route.ts`, extend `apps/storefront/src/app/api/admin/orders/route.test.ts`.

- [ ] Failing tests: 401 unauthenticated; 400 for `{lat: 91}`; 200 sets courier on an existing order; 404 unknown order.
- [ ] Implement:

```ts
import { isValidCoordinates } from "@nextshop/commerce-core";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

/** PATCH /api/admin/orders/:id/location — owner/courier pushes a GPS fix. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { lat?: unknown; lng?: unknown } | null;
  if (!body || !isValidCoordinates(body.lat, body.lng)) {
    return Response.json({ error: "lat/lng must be valid coordinates" }, { status: 400 });
  }
  const updated = await getStoreRepository().updateOrderLocation(params.id, {
    lat: body.lat as number,
    lng: body.lng as number,
  });
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}
```

Run, PASS, commit `feat(storefront): courier location API`.

---

### Task 5: ui — `OrderTimeline` (the showpiece)

**Files:** `packages/ui/src/components/OrderTimeline.tsx`, export in `packages/ui/src/index.ts`. Tested from the storefront in Task 6 (ui package has no test runner — convention from SearchAutocomplete).

Design ("living delivery journey", themed by client CSS vars):
- Vertical gradient spine (`--gradient-cta`) that **grows** (`scaleY`, origin top) to `trackingProgress`.
- Step nodes: emoji icons (🧺 received, 📦 packing, 🚚 on the way, ✅ delivered, ✖️ cancelled), done = filled gradient chip, current = pulsing halo (framer-motion infinite scale/opacity loop), upcoming = muted outline.
- Staggered reveal with existing `staggerContainer`/`riseItem`; display font for the current step label; relative "updated x min ago" handled by caller.
- Cancelled renders the accent color for the final node.

Props: `{ steps: TimelineStep[]; progress: number; labels?: Partial<Record<OrderStatus, string>> }` — pure presentational, no fetching. Implement, export, typecheck, commit `feat(ui): OrderTimeline living-journey component`.

---

### Task 6: storefront — tracking page + polling view

**Files:** `apps/storefront/src/components/OrderTracking.tsx` (+ test), `apps/storefront/src/app/orders/[id]/page.tsx`.

- [ ] Failing test (`OrderTracking.test.tsx`): renders timeline labels for a shipped order; shows the map iframe when `gps` prop true and courier present; hides it otherwise; polls `GET /api/orders/:id` (stub fetch, `vi.useFakeTimers`, advance 10s, expect fetch called with `/api/orders/o1`).
- [ ] Implement `OrderTracking` ("use client"): props `{ initial: Order; gps: boolean; locale: string }`; `useEffect` interval (10s) fetching the public API and updating state (stop polling on delivered/cancelled); renders status headline, `OrderTimeline` (from `orderTimeline(order.status)` + `trackingProgress`), order summary card, and — when `gps && order.courier` — an OpenStreetMap embed:

```tsx
const { lat, lng } = order.courier;
const d = 0.01;
const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
<iframe title="Courier location" src={src} style={{ width: "100%", height: 320, border: 0, borderRadius: "var(--radius)" }} />
```

- [ ] `app/orders/[id]/page.tsx` (server, `force-dynamic`): load order via `getStoreRepository().getOrder`, `notFound()` if missing, render `<OrderTracking initial={order} gps={config.featureFlags.gpsTracking} locale={...}/>` inside `Page`.
Run, PASS, commit `feat(storefront): live order tracking page`.

---

### Task 7: storefront — checkout hands the customer a tracking link

**Files:** `apps/storefront/src/components/CheckoutForm.tsx` (+ its test).

- [ ] Failing test: stub `fetch` to resolve `{ id: "order_1" }`; place a valid order; `await screen.findByRole("link", { name: /track your order/i })` with `href="/orders/order_1"`. Existing 4 tests must stay green (no fetch stub → no link, confirmation unchanged).
- [ ] Implement: keep optimistic confirmation; replace fire-and-forget with a promise that `setTrackId(saved.id)` on success; confirmation screen adds, when `trackId`: a `Track your order →` link (`/orders/${trackId}`).
Run storefront tests, commit `feat(storefront): tracking link after checkout`.

---

### Task 8: storefront — admin pushes courier GPS

**Files:** `apps/storefront/src/components/AdminCourierLocation.tsx` (+ test), wire into `admin/(protected)/orders/page.tsx`.

- [ ] Failing test: renders lat/lng inputs for a shipped order; "Set" PATCHes `/api/admin/orders/o1/location` with numbers and refreshes.
- [ ] Implement client component (number inputs prefilled from `courier`, Set button → PATCH, `router.refresh()`); in the orders table render it under `AdminOrderStatus` only when `o.status === "shipped"`.
Run, PASS, commit `feat(storefront): admin courier location control`.

---

### Task 9: enable GPS demo, gates, docs, ship

- [ ] `clients/finnish-grocer/store.config.ts`: set `featureFlags.gpsTracking: true` (delivery grocer demo). freestylebd stays off — proves the flag.
- [ ] Full gates: root `pnpm test && pnpm typecheck && pnpm lint`; both client builds (expect `/orders/[id]` route).
- [ ] Changeset (`.changeset/order-tracking.md`): commerce-core minor, db minor, ui minor.
- [ ] ROADMAP: Phase 2 ✅. CONTEXT.md: update done/next. Tick this plan's boxes.
- [ ] `git push origin main` (CI runs the same gates + e2e), `graph_register_edit`, `graph_add_memory`.
