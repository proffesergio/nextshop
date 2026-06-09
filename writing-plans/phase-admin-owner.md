# Owner Admin (/admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A protected `/admin` area in the storefront where the shop owner manages products, inventory (stock), and order statuses, authenticated with Auth.js (next-auth v5) over the existing `@nextshop/db` repository.

**Architecture:** Pure domain logic (product validation, stock rules, order-status transitions, credential check) lives in `@nextshop/commerce-core` (TDD). `@nextshop/db` gains a `stock` column. The storefront adds Auth.js credential auth (owner creds from env), `/api/admin/*` route handlers guarded by `auth()`, and server-rendered admin pages gated by a new `ownerAdmin` feature flag in `@nextshop/config`.

**Tech Stack:** next-auth@5 (beta, Credentials provider, JWT session), Next.js 14 App Router (route group `admin/(protected)`), Drizzle/Neon + in-memory repo, vitest + RTL.

**Conventions:** ESM imports with `.js` suffix inside packages; `@/` alias in the storefront; tests colocated (`*.test.ts(x)`) or in `__tests__/`. Run everything from repo root with `pnpm --filter <pkg> test`. If pnpm is missing: `export PATH="$HOME/.npm-global/bin:$PATH"`.

---

### Task 1: commerce-core — order status transitions

**Files:**
- Modify: `packages/commerce-core/src/order.ts`
- Test: `packages/commerce-core/src/__tests__/order-status.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { nextOrderStatuses, canTransitionOrder } from "../order.js";

describe("order status transitions", () => {
  it("pending can move to packing or cancelled", () => {
    expect(nextOrderStatuses("pending")).toEqual(["packing", "cancelled"]);
  });

  it("packing can move to shipped or cancelled", () => {
    expect(nextOrderStatuses("packing")).toEqual(["shipped", "cancelled"]);
  });

  it("shipped can only move to delivered", () => {
    expect(nextOrderStatuses("shipped")).toEqual(["delivered"]);
  });

  it("delivered and cancelled are terminal", () => {
    expect(nextOrderStatuses("delivered")).toEqual([]);
    expect(nextOrderStatuses("cancelled")).toEqual([]);
  });

  it("canTransitionOrder allows only listed moves", () => {
    expect(canTransitionOrder("pending", "packing")).toBe(true);
    expect(canTransitionOrder("pending", "delivered")).toBe(false);
    expect(canTransitionOrder("shipped", "cancelled")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @nextshop/commerce-core test`
Expected: FAIL — `nextOrderStatuses` is not exported.

- [ ] **Step 3: Implement in `order.ts`**

Add `OrderStatus` to the existing type import and append:

```ts
/** Allowed status moves. The owner admin and Phase 2 tracking share this map. */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["packing", "cancelled"],
  packing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

/** Statuses an order may move to next from `status`. */
export function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[status] ?? [];
}

/** Whether moving an order from `from` to `to` is a legal transition. */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return nextOrderStatuses(from).includes(to);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @nextshop/commerce-core test` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/commerce-core/src/order.ts packages/commerce-core/src/__tests__/order-status.test.ts
git commit -m "feat(commerce-core): order status transition rules"
```

---

### Task 2: commerce-core — Product.stock + admin product validation

**Files:**
- Modify: `packages/commerce-core/src/types.ts` (add `stock?: number` to `Product`)
- Create: `packages/commerce-core/src/admin.ts`
- Modify: `packages/commerce-core/src/index.ts` (export `./admin.js`)
- Test: `packages/commerce-core/src/__tests__/admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { validateProductInput, validateProductPatch, isLowStock } from "../admin.js";

describe("validateProductInput", () => {
  it("accepts a full valid product and normalizes it", () => {
    const r = validateProductInput({
      title: "  Mango  ", amount: 450, currency: "EUR",
      thumbnail: "🥭", category: "produce", tag: "", origin: "BD", stock: 0,
    });
    expect(r).toEqual({
      ok: true,
      value: { title: "Mango", amount: 450, currency: "eur", thumbnail: "🥭", category: "produce", origin: "BD", stock: 0 },
    });
  });

  it("collects errors for missing/invalid fields", () => {
    const r = validateProductInput({ title: " ", amount: -5, currency: "euro", stock: 1.5 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toContain("Title is required");
      expect(r.errors).toContain("Amount must be a positive integer (minor units)");
      expect(r.errors).toContain("Currency must be a 3-letter code");
      expect(r.errors).toContain("Stock must be a non-negative integer");
    }
  });

  it("rejects a string amount", () => {
    const r = validateProductInput({ title: "X", amount: "450", currency: "eur" });
    expect(r.ok).toBe(false);
  });
});

describe("validateProductPatch", () => {
  it("validates only provided fields", () => {
    const r = validateProductPatch({ stock: 7 });
    expect(r).toEqual({ ok: true, value: { stock: 7 } });
  });

  it("rejects invalid provided fields", () => {
    const r = validateProductPatch({ amount: 0 });
    expect(r.ok).toBe(false);
  });
});

describe("isLowStock", () => {
  it("flags tracked stock at or below the threshold", () => {
    expect(isLowStock({ id: "a", title: "A", amount: 1, currency: "eur", stock: 3 })).toBe(true);
    expect(isLowStock({ id: "a", title: "A", amount: 1, currency: "eur", stock: 9 })).toBe(false);
    expect(isLowStock({ id: "a", title: "A", amount: 1, currency: "eur" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @nextshop/commerce-core test` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`types.ts` — add to `Product`:

```ts
  /** Units on hand. Omitted = inventory not tracked for this product. */
  stock?: number;
```

`admin.ts`:

```ts
import type { Product } from "./types.js";

/**
 * Owner-admin domain logic: product form validation and inventory rules.
 * UI and API routes call these so every client storefront enforces the same rules.
 */

export type ProductValidation<V> = { ok: true; value: V } | { ok: false; errors: string[] };

const OPTIONAL_TEXT = ["thumbnail", "category", "tag", "origin"] as const;

function textOrUndefined(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function checkTitle(v: unknown, errors: string[]): string | undefined {
  if (typeof v !== "string" || v.trim() === "") { errors.push("Title is required"); return undefined; }
  return v.trim();
}

function checkAmount(v: unknown, errors: string[]): number | undefined {
  if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
    errors.push("Amount must be a positive integer (minor units)");
    return undefined;
  }
  return v;
}

function checkCurrency(v: unknown, errors: string[]): string | undefined {
  if (typeof v !== "string" || !/^[a-zA-Z]{3}$/.test(v)) { errors.push("Currency must be a 3-letter code"); return undefined; }
  return v.toLowerCase();
}

function checkStock(v: unknown, errors: string[]): number | undefined {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0) { errors.push("Stock must be a non-negative integer"); return undefined; }
  return v;
}

/** Validate a complete product form (create / full edit). Returns the product minus its id. */
export function validateProductInput(input: Record<string, unknown>): ProductValidation<Omit<Product, "id">> {
  const errors: string[] = [];
  const title = checkTitle(input.title, errors);
  const amount = checkAmount(input.amount, errors);
  const currency = checkCurrency(input.currency, errors);
  const stock = input.stock === undefined || input.stock === null ? undefined : checkStock(input.stock, errors);
  if (errors.length > 0) return { ok: false, errors };
  const value: Omit<Product, "id"> = { title: title!, amount: amount!, currency: currency! };
  for (const key of OPTIONAL_TEXT) {
    const v = textOrUndefined(input[key]);
    if (v !== undefined) value[key] = v;
  }
  if (stock !== undefined) value.stock = stock;
  return { ok: true, value };
}

/** Validate a partial update — only the provided fields are checked. */
export function validateProductPatch(input: Record<string, unknown>): ProductValidation<Partial<Omit<Product, "id">>> {
  const errors: string[] = [];
  const value: Partial<Omit<Product, "id">> = {};
  if ("title" in input) { const t = checkTitle(input.title, errors); if (t !== undefined) value.title = t; }
  if ("amount" in input) { const a = checkAmount(input.amount, errors); if (a !== undefined) value.amount = a; }
  if ("currency" in input) { const c = checkCurrency(input.currency, errors); if (c !== undefined) value.currency = c; }
  if ("stock" in input && input.stock !== null && input.stock !== undefined) {
    const s = checkStock(input.stock, errors); if (s !== undefined) value.stock = s;
  }
  for (const key of OPTIONAL_TEXT) if (key in input) value[key] = textOrUndefined(input[key]);
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value };
}

/** Default low-stock alert threshold for the admin dashboard. */
export const LOW_STOCK_THRESHOLD = 5;

/** True when stock is tracked and at/below the threshold. */
export function isLowStock(product: Product, threshold = LOW_STOCK_THRESHOLD): boolean {
  return typeof product.stock === "number" && product.stock <= threshold;
}
```

`index.ts` — add `export * from "./admin.js";`

- [ ] **Step 4: Run tests** — `pnpm --filter @nextshop/commerce-core test` — Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add packages/commerce-core/src
git commit -m "feat(commerce-core): product stock field + admin product validation"
```

---

### Task 3: commerce-core — owner credential verification

**Files:**
- Modify: `packages/commerce-core/src/admin.ts`
- Test: append to `packages/commerce-core/src/__tests__/admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { verifyOwnerCredentials } from "../admin.js";

describe("verifyOwnerCredentials", () => {
  const expected = { email: "owner@shop.fi", password: "s3cret" };

  it("accepts matching credentials (email case/space-insensitive)", () => {
    expect(verifyOwnerCredentials({ email: " Owner@Shop.fi ", password: "s3cret" }, expected)).toBe(true);
  });

  it("rejects a wrong password or email", () => {
    expect(verifyOwnerCredentials({ email: "owner@shop.fi", password: "nope" }, expected)).toBe(false);
    expect(verifyOwnerCredentials({ email: "x@shop.fi", password: "s3cret" }, expected)).toBe(false);
  });

  it("rejects empty expected credentials", () => {
    expect(verifyOwnerCredentials({ email: "", password: "" }, { email: "", password: "" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify FAIL**, then **Step 3: implement** in `admin.ts`:

```ts
/** Constant-time-ish string compare (avoids early-exit timing leaks). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Check a login attempt against the configured owner credentials. */
export function verifyOwnerCredentials(
  input: { email: string; password: string },
  expected: { email: string; password: string },
): boolean {
  if (!expected.email || !expected.password) return false;
  const emailOk = input.email.trim().toLowerCase() === expected.email.trim().toLowerCase();
  return emailOk && safeEqual(input.password, expected.password);
}
```

- [ ] **Step 4: Run** `pnpm --filter @nextshop/commerce-core test` — PASS.
- [ ] **Step 5: Commit** `git add packages/commerce-core/src && git commit -m "feat(commerce-core): verifyOwnerCredentials"`

---

### Task 4: db — stock column end to end

**Files:**
- Modify: `packages/db/src/schema.ts`, `packages/db/src/neon.ts`
- Test: append to `packages/db/src/__tests__/memory.test.ts`

- [ ] **Step 1: Write the failing test** (append to memory.test.ts; match its existing imports/style)

```ts
it("persists and patches stock", async () => {
  const repo = new InMemoryRepository([]);
  await repo.createProduct({ id: "s1", title: "Rice", amount: 100, currency: "eur", stock: 10 });
  expect((await repo.getProduct("s1"))?.stock).toBe(10);
  const updated = await repo.updateProduct("s1", { stock: 0 });
  expect(updated?.stock).toBe(0);
});
```

- [ ] **Step 2: Run** `pnpm --filter @nextshop/db test`. The memory repo spreads patches, so this may already PASS — it pins the behaviour. The real change is typed schema support:

`schema.ts` — add to `products` table:

```ts
  stock: integer("stock"),
```

`neon.ts` — in `rowToProduct`, add (note `!= null`, stock 0 is valid):

```ts
    ...(r.stock != null ? { stock: r.stock } : {}),
```

- [ ] **Step 3: Run** `pnpm --filter @nextshop/db test && pnpm --filter @nextshop/db typecheck` — PASS.
- [ ] **Step 4: Commit** `git add packages/db/src && git commit -m "feat(db): stock column for inventory"`

---

### Task 5: config — `ownerAdmin` feature flag

**Files:**
- Modify: `packages/config/src/schema.ts`
- Test: append to `packages/config/src/__tests__/config.test.ts`

- [ ] **Step 1: Failing test** (match the file's existing helpers for building a valid config; assert the default):

```ts
it("defaults featureFlags.ownerAdmin to true", () => {
  const cfg = storeConfigSchema.parse(validInput);
  expect(cfg.featureFlags.ownerAdmin).toBe(true);
});
```

- [ ] **Step 2: Implement** — in `featureFlagsSchema` add:

```ts
  /** Owner admin panel at /admin (product/order/inventory CRUD). */
  ownerAdmin: z.boolean().default(true),
```

- [ ] **Step 3: Run** `pnpm --filter @nextshop/config test` — PASS.
- [ ] **Step 4: Commit** `git add packages/config/src && git commit -m "feat(config): ownerAdmin feature flag"`

---

### Task 6: storefront — Auth.js wiring

**Files:**
- Modify: `apps/storefront/package.json` (add `next-auth@beta`)
- Create: `apps/storefront/src/lib/auth.ts`
- Create: `apps/storefront/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/storefront/.env.example`
- Test: `apps/storefront/src/lib/auth.test.ts`

- [ ] **Step 1: Install** `pnpm --filter @nextshop/storefront add next-auth@beta`

- [ ] **Step 2: Failing test** (`src/lib/auth.test.ts`):

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { authorizeOwner } from "./auth";

afterEach(() => vi.unstubAllEnvs());

describe("authorizeOwner", () => {
  it("accepts the env-configured owner", () => {
    vi.stubEnv("ADMIN_EMAIL", "owner@shop.fi");
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(authorizeOwner({ email: "owner@shop.fi", password: "s3cret" })).toEqual(
      expect.objectContaining({ id: "owner" }),
    );
  });

  it("rejects bad credentials", () => {
    vi.stubEnv("ADMIN_EMAIL", "owner@shop.fi");
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(authorizeOwner({ email: "owner@shop.fi", password: "wrong" })).toBeNull();
  });

  it("falls back to dev credentials outside production when env is unset", () => {
    expect(authorizeOwner({ email: "owner@nextshop.dev", password: "nextshop-dev" })).toEqual(
      expect.objectContaining({ id: "owner" }),
    );
  });

  it("rejects everything in production when env is unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(authorizeOwner({ email: "owner@nextshop.dev", password: "nextshop-dev" })).toBeNull();
  });
});
```

- [ ] **Step 3: Implement `src/lib/auth.ts`**

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOwnerCredentials } from "@nextshop/commerce-core";

/**
 * Owner credentials come from env (ADMIN_EMAIL / ADMIN_PASSWORD), set per client
 * deployment. Outside production a dev fallback keeps local demos one-click.
 */
function ownerCredentialsFromEnv(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) return { email, password };
  if (process.env.NODE_ENV !== "production") return { email: "owner@nextshop.dev", password: "nextshop-dev" };
  return null;
}

/** Credentials → session user, or null. Exported for tests. */
export function authorizeOwner(credentials: Partial<Record<string, unknown>>): { id: string; email: string; name: string } | null {
  const expected = ownerCredentialsFromEnv();
  if (!expected) return null;
  const email = typeof credentials?.email === "string" ? credentials.email : "";
  const password = typeof credentials?.password === "string" ? credentials.password : "";
  if (!verifyOwnerCredentials({ email, password }, expected)) return null;
  return { id: "owner", email: expected.email, name: "Store owner" };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "nextshop-dev-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: { label: "Email" }, password: { label: "Password", type: "password" } },
      authorize: async (credentials) => authorizeOwner(credentials),
    }),
  ],
});
```

`src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

`.env.example`:

```bash
# Which client this deployment serves (clients/<id>)
STORE_CLIENT=finnish-grocer
# Postgres (Neon). Unset = in-memory demo repository.
DATABASE_URL=
# Owner admin login (Auth.js). Unset outside production = owner@nextshop.dev / nextshop-dev
ADMIN_EMAIL=
ADMIN_PASSWORD=
# Random string, e.g. `openssl rand -base64 32`
AUTH_SECRET=
```

- [ ] **Step 4: Run** `pnpm --filter @nextshop/storefront test` — PASS.
- [ ] **Step 5: Commit** `git add apps/storefront && git commit -m "feat(storefront): Auth.js owner authentication"`

---

### Task 7: storefront — `getStoreRepository` helper

**Files:**
- Modify: `apps/storefront/src/lib/products.ts`

- [ ] **Step 1: Refactor** — admin routes/pages need the same seeded repo as the shop. Add and reuse:

```ts
/** The active client's repository (seeded demo data when no DATABASE_URL). */
export function getStoreRepository() {
  const clientId = process.env.STORE_CLIENT ?? "finnish-grocer";
  return getRepository(demoByClient[clientId] ?? []);
}

export async function getProducts(clientId: string): Promise<Product[]> {
  return getRepository(demoByClient[clientId] ?? []).listProducts();
}
```

(`getProducts`/`getProduct` keep their signatures — callers pass the clientId they already have.)

- [ ] **Step 2: Verify** `pnpm --filter @nextshop/storefront test && pnpm --filter @nextshop/storefront typecheck` — PASS.
- [ ] **Step 3: Commit** `git add apps/storefront/src/lib/products.ts && git commit -m "refactor(storefront): getStoreRepository helper"`

---

### Task 8: storefront — admin product API routes

**Files:**
- Create: `apps/storefront/src/app/api/admin/products/route.ts`
- Create: `apps/storefront/src/app/api/admin/products/[id]/route.ts`
- Test: `apps/storefront/src/app/api/admin/products/route.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetRepository } from "@nextshop/db";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/lib/auth";
import { POST } from "./route";
import { PATCH, DELETE } from "./[id]/route";

const authMock = auth as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetRepository();
  authMock.mockResolvedValue({ user: { email: "owner@shop.fi" } });
});

const post = (body: unknown) =>
  POST(new Request("http://test/api/admin/products", { method: "POST", body: JSON.stringify(body) }));

describe("POST /api/admin/products", () => {
  it("rejects unauthenticated requests", async () => {
    authMock.mockResolvedValue(null);
    const res = await post({ title: "X", amount: 100, currency: "eur" });
    expect(res.status).toBe(401);
  });

  it("rejects invalid input with errors", async () => {
    const res = await post({ title: "", amount: -1, currency: "euro" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors).toContain("Title is required");
  });

  it("creates a product with a generated id", async () => {
    const res = await post({ title: "Rye", amount: 320, currency: "eur", stock: 12 });
    expect(res.status).toBe(201);
    const product = await res.json();
    expect(product.id).toMatch(/^p_/);
    expect(product.stock).toBe(12);
  });
});

describe("PATCH/DELETE /api/admin/products/[id]", () => {
  it("patches stock on an existing product", async () => {
    const created = await (await post({ title: "Rye", amount: 320, currency: "eur" })).json();
    const res = await PATCH(
      new Request("http://test", { method: "PATCH", body: JSON.stringify({ stock: 3 }) }),
      { params: { id: created.id } },
    );
    expect(res.status).toBe(200);
    expect((await res.json()).stock).toBe(3);
  });

  it("404s when patching a missing product", async () => {
    const res = await PATCH(
      new Request("http://test", { method: "PATCH", body: JSON.stringify({ stock: 3 }) }),
      { params: { id: "nope" } },
    );
    expect(res.status).toBe(404);
  });

  it("deletes a product", async () => {
    const created = await (await post({ title: "Rye", amount: 320, currency: "eur" })).json();
    const res = await DELETE(new Request("http://test", { method: "DELETE" }), { params: { id: created.id } });
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 2: Run to verify FAIL** (`route` modules missing), then **implement**.

`api/admin/products/route.ts`:

```ts
import { validateProductInput } from "@nextshop/commerce-core";
import { genId } from "@nextshop/db";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

/** POST /api/admin/products — create a product (owner only). */
export async function POST(request: Request) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const result = validateProductInput(body ?? {});
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 400 });
  const product = await getStoreRepository().createProduct({ id: genId("p"), ...result.value });
  return Response.json(product, { status: 201 });
}
```

`api/admin/products/[id]/route.ts`:

```ts
import { validateProductPatch } from "@nextshop/commerce-core";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

/** PATCH /api/admin/products/:id — update fields (incl. stock). Owner only. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const result = validateProductPatch(body ?? {});
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 400 });
  const updated = await getStoreRepository().updateProduct(params.id, result.value);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

/** DELETE /api/admin/products/:id — remove a product. Owner only. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await getStoreRepository().deleteProduct(params.id);
  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 3: Run** `pnpm --filter @nextshop/storefront test` — PASS.
- [ ] **Step 4: Commit** `git add apps/storefront/src/app/api/admin && git commit -m "feat(storefront): admin product CRUD API"`

---

### Task 9: storefront — admin order status API route

**Files:**
- Create: `apps/storefront/src/app/api/admin/orders/[id]/route.ts`
- Test: `apps/storefront/src/app/api/admin/orders/route.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetRepository, getRepository } from "@nextshop/db";
import type { OrderDraft } from "@nextshop/commerce-core";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/lib/auth";
import { PATCH } from "./[id]/route";

const authMock = auth as unknown as ReturnType<typeof vi.fn>;

const draft: OrderDraft = {
  items: [{ productId: "g1", title: "Avocado", amount: 149, currency: "eur", qty: 1 }],
  total: { amount: 149, currency: "eur" },
  fulfillment: { method: "pickup", slot: "10:00–11:00" },
  customer: { name: "Aino" },
  status: "pending",
};

const patch = (id: string, status: string) =>
  PATCH(new Request("http://test", { method: "PATCH", body: JSON.stringify({ status }) }), { params: { id } });

beforeEach(() => {
  resetRepository();
  authMock.mockResolvedValue({ user: { email: "owner@shop.fi" } });
});

describe("PATCH /api/admin/orders/[id]", () => {
  it("rejects unauthenticated requests", async () => {
    authMock.mockResolvedValue(null);
    expect((await patch("any", "packing")).status).toBe(401);
  });

  it("advances a pending order to packing", async () => {
    const order = await getRepository().createOrder(draft);
    const res = await patch(order.id, "packing");
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("packing");
  });

  it("409s on an illegal transition", async () => {
    const order = await getRepository().createOrder(draft);
    expect((await patch(order.id, "delivered")).status).toBe(409);
  });

  it("404s for unknown orders and 400s for unknown statuses", async () => {
    expect((await patch("nope", "packing")).status).toBe(404);
    const order = await getRepository().createOrder(draft);
    expect((await patch(order.id, "teleported")).status).toBe(400);
  });
});
```

- [ ] **Step 2: Implement** `api/admin/orders/[id]/route.ts`:

```ts
import { canTransitionOrder, type OrderStatus } from "@nextshop/commerce-core";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

const STATUSES: OrderStatus[] = ["pending", "packing", "shipped", "delivered", "cancelled"];

/** PATCH /api/admin/orders/:id — move an order along its status flow. Owner only. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status;
  if (typeof status !== "string" || !STATUSES.includes(status as OrderStatus)) {
    return Response.json({ error: "Unknown status" }, { status: 400 });
  }
  const repo = getStoreRepository();
  const order = await repo.getOrder(params.id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  if (!canTransitionOrder(order.status, status as OrderStatus)) {
    return Response.json({ error: `Cannot move ${order.status} → ${status}` }, { status: 409 });
  }
  const updated = await repo.updateOrderStatus(params.id, status as OrderStatus);
  return Response.json(updated);
}
```

- [ ] **Step 3: Run** `pnpm --filter @nextshop/storefront test` — PASS.
- [ ] **Step 4: Commit** `git add apps/storefront/src/app/api/admin/orders && git commit -m "feat(storefront): admin order status API"`

---

### Task 10: storefront — login page

**Files:**
- Create: `apps/storefront/src/components/AdminLoginForm.tsx`
- Create: `apps/storefront/src/app/admin/login/page.tsx`
- Test: `apps/storefront/src/components/AdminLoginForm.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdminLoginForm } from "./AdminLoginForm";

describe("AdminLoginForm", () => {
  it("renders email + password fields and a sign-in button", () => {
    render(<AdminLoginForm action={async () => {}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows an error message when given", () => {
    render(<AdminLoginForm action={async () => {}} error="Invalid email or password" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
```

- [ ] **Step 2: Implement.** `AdminLoginForm.tsx` (presentational; the page passes a server action):

```tsx
/** Owner sign-in form. `action` is a server action from the login page. */
export function AdminLoginForm({
  action,
  error,
}: {
  action: (formData: FormData) => Promise<void>;
  error?: string;
}) {
  return (
    <main style={{ maxWidth: 380, margin: "10vh auto", padding: "var(--space-5)" }}>
      <h1 style={{ fontFamily: "var(--font-display)" }}>Owner sign in</h1>
      {error && (
        <p role="alert" style={{ color: "#b3261e", background: "#fdeceb", padding: "10px 14px", borderRadius: "var(--radius)" }}>
          {error}
        </p>
      )}
      <form action={action} style={{ display: "grid", gap: "var(--space-4)" }}>
        <label style={{ display: "grid", gap: 4 }}>
          Email
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
```

`app/admin/login/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  if (await auth()) redirect("/admin");

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirectTo: "/admin",
      });
    } catch (err) {
      // next's redirect() works by throwing — let it through
      if (err instanceof Error && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) throw err;
      redirect("/admin/login?error=1");
    }
  }

  return <AdminLoginForm action={login} error={searchParams?.error ? "Invalid email or password" : undefined} />;
}
```

- [ ] **Step 3: Run** `pnpm --filter @nextshop/storefront test` — PASS (React 18 logs a dev warning for the function `action` prop in jsdom; harmless).
- [ ] **Step 4: Commit** `git add apps/storefront/src && git commit -m "feat(storefront): owner login page"`

---

### Task 11: storefront — protected layout + dashboard

**Files:**
- Create: `apps/storefront/src/app/admin/(protected)/layout.tsx`
- Create: `apps/storefront/src/app/admin/(protected)/page.tsx`

- [ ] **Step 1: Implement layout** (feature-flag gate + auth gate; login page sits OUTSIDE this route group, so no redirect loop):

```tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getStoreConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const config = getStoreConfig();
  if (!config.featureFlags.ownerAdmin) notFound();
  if (!(await auth())) redirect("/admin/login");

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--space-5)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}>
        <strong style={{ fontFamily: "var(--font-display)" }}>{config.brand.name} · Admin</strong>
        <nav style={{ display: "flex", gap: "var(--space-4)" }}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/orders">Orders</Link>
        </nav>
        <form action={logout} style={{ marginLeft: "auto" }}>
          <button type="submit">Sign out</button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Implement dashboard `page.tsx`:**

```tsx
import { isLowStock } from "@nextshop/commerce-core";
import { getStoreRepository } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const repo = getStoreRepository();
  const [products, orders] = await Promise.all([repo.listProducts(), repo.listOrders()]);
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => isLowStock(p)).length;

  const cards: Array<[string, number]> = [
    ["Products", products.length],
    ["Orders", orders.length],
    ["Pending orders", pending],
    ["Low stock", lowStock],
  ];
  return (
    <section style={{ display: "grid", gap: "var(--space-4)", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
      {cards.map(([label, value]) => (
        <div key={label} style={{ backgroundImage: "var(--gradient-card)", borderRadius: "var(--radius)", padding: "var(--space-5)" }}>
          <div style={{ fontSize: "2rem", fontFamily: "var(--font-display)" }}>{value}</div>
          <div>{label}</div>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 3: Verify** `pnpm --filter @nextshop/storefront typecheck` — PASS.
- [ ] **Step 4: Commit** `git add apps/storefront/src/app/admin && git commit -m "feat(storefront): protected admin layout + dashboard"`

---

### Task 12: storefront — products admin pages

**Files:**
- Create: `apps/storefront/src/components/AdminProductForm.tsx`
- Create: `apps/storefront/src/components/AdminDeleteProductButton.tsx`
- Create: `apps/storefront/src/app/admin/(protected)/products/page.tsx`
- Create: `apps/storefront/src/app/admin/(protected)/products/new/page.tsx`
- Create: `apps/storefront/src/app/admin/(protected)/products/[id]/page.tsx`
- Test: `apps/storefront/src/components/AdminProductForm.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminProductForm } from "./AdminProductForm";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
});

describe("AdminProductForm", () => {
  it("shows validation errors instead of submitting", async () => {
    render(<AdminProductForm />);
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("POSTs a new product and navigates back to the list", async () => {
    render(<AdminProductForm />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Rye" } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: "320" } });
    fireEvent.change(screen.getByLabelText("Currency"), { target: { value: "eur" } });
    fireEvent.change(screen.getByLabelText(/Stock/), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/admin/products");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toMatchObject({ title: "Rye", amount: 320, currency: "eur", stock: 12 });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
  });

  it("PATCHes when editing an existing product", async () => {
    render(
      <AdminProductForm initial={{ id: "g1", title: "Avocado", amount: 149, currency: "eur" }} />,
    );
    fireEvent.change(screen.getByLabelText(/Stock/), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/admin/products/g1");
    expect(init?.method).toBe("PATCH");
  });
});
```

- [ ] **Step 2: Implement `AdminProductForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateProductInput, type Product } from "@nextshop/commerce-core";

const field = { display: "grid", gap: 4 } as const;

/** Create/edit product form. Validation mirrors the API (commerce-core). */
export function AdminProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    amount: initial?.amount !== undefined ? String(initial.amount) : "",
    currency: initial?.currency ?? "",
    thumbnail: initial?.thumbnail ?? "",
    category: initial?.category ?? "",
    tag: initial?.tag ?? "",
    origin: initial?.origin ?? "",
    stock: initial?.stock !== undefined ? String(initial.stock) : "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: Record<string, unknown> = {
      title: form.title,
      amount: form.amount.trim() === "" ? undefined : Number(form.amount),
      currency: form.currency,
      thumbnail: form.thumbnail,
      category: form.category,
      tag: form.tag,
      origin: form.origin,
      ...(form.stock.trim() === "" ? {} : { stock: Number(form.stock) }),
    };
    const result = validateProductInput(input);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    setSaving(true);
    const res = await fetch(initial ? `/api/admin/products/${initial.id}` : "/api/admin/products", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.value),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { errors?: string[]; error?: string };
      setErrors(data.errors ?? [data.error ?? "Saving failed"]);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "var(--space-4)", maxWidth: 480 }}>
      {errors.length > 0 && (
        <ul role="alert" style={{ color: "#b3261e", margin: 0, paddingLeft: 20 }}>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <label style={field}>Title<input value={form.title} onChange={set("title")} /></label>
      <label style={field}>Price (minor units)<input type="number" value={form.amount} onChange={set("amount")} /></label>
      <label style={field}>Currency<input value={form.currency} onChange={set("currency")} placeholder="eur" /></label>
      <label style={field}>Stock (blank = untracked)<input type="number" value={form.stock} onChange={set("stock")} /></label>
      <label style={field}>Thumbnail (emoji or URL)<input value={form.thumbnail} onChange={set("thumbnail")} /></label>
      <label style={field}>Category<input value={form.category} onChange={set("category")} /></label>
      <label style={field}>Tag<input value={form.tag} onChange={set("tag")} /></label>
      <label style={field}>Origin<input value={form.origin} onChange={set("origin")} /></label>
      <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save product"}</button>
    </form>
  );
}
```

`AdminDeleteProductButton.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";

export function AdminDeleteProductButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  async function remove() {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <button type="button" onClick={remove} aria-label={`Delete ${title}`}>
      Delete
    </button>
  );
}
```

- [ ] **Step 3: Implement pages.**

`products/page.tsx`:

```tsx
import Link from "next/link";
import { formatPrice } from "@nextshop/commerce-core";
import { getStoreRepository } from "@/lib/products";
import { AdminDeleteProductButton } from "@/components/AdminDeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getStoreRepository().listProducts();
  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <Link href="/admin/products/new">+ New product</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr><th>Product</th><th>Price</th><th>Stock</th><th>Category</th><th /></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent)" }}>
              <td><Link href={`/admin/products/${p.id}`}>{p.title}</Link></td>
              <td>{formatPrice({ amount: p.amount, currency: p.currency })}</td>
              <td>{p.stock ?? "—"}</td>
              <td>{p.category ?? "—"}</td>
              <td><AdminDeleteProductButton id={p.id} title={p.title} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

`products/new/page.tsx`:

```tsx
import { AdminProductForm } from "@/components/AdminProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <section>
      <h1>New product</h1>
      <AdminProductForm />
    </section>
  );
}
```

`products/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getStoreRepository } from "@/lib/products";
import { AdminProductForm } from "@/components/AdminProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getStoreRepository().getProduct(params.id);
  if (!product) notFound();
  return (
    <section>
      <h1>Edit product</h1>
      <AdminProductForm initial={product} />
    </section>
  );
}
```

- [ ] **Step 4: Run** `pnpm --filter @nextshop/storefront test && pnpm --filter @nextshop/storefront typecheck` — PASS.
- [ ] **Step 5: Commit** `git add apps/storefront/src && git commit -m "feat(storefront): admin product management pages"`

---

### Task 13: storefront — orders admin page

**Files:**
- Create: `apps/storefront/src/components/AdminOrderStatus.tsx`
- Create: `apps/storefront/src/app/admin/(protected)/orders/page.tsx`
- Test: `apps/storefront/src/components/AdminOrderStatus.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminOrderStatus } from "./AdminOrderStatus";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
});

describe("AdminOrderStatus", () => {
  it("offers only legal next statuses for a pending order", () => {
    render(<AdminOrderStatus orderId="o1" status="pending" />);
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["packing", "cancelled"]);
  });

  it("renders terminal statuses as plain text", () => {
    render(<AdminOrderStatus orderId="o1" status="delivered" />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("delivered")).toBeInTheDocument();
  });

  it("PATCHes the chosen status and refreshes", async () => {
    render(<AdminOrderStatus orderId="o1" status="pending" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "packing" } });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/admin/orders/o1", expect.objectContaining({ method: "PATCH" })));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
```

- [ ] **Step 2: Implement `AdminOrderStatus.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nextOrderStatuses, type OrderStatus } from "@nextshop/commerce-core";

/** Status mover: select a legal next status and apply it. */
export function AdminOrderStatus({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const next = nextOrderStatuses(status);
  const [selected, setSelected] = useState<OrderStatus | "">("");
  const [busy, setBusy] = useState(false);

  if (next.length === 0) return <span>{status}</span>;

  async function update() {
    if (!selected) return;
    setBusy(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <span>{status}</span>
      <select value={selected} onChange={(e) => setSelected(e.target.value as OrderStatus)} aria-label="Next status">
        <option value="" disabled>move to…</option>
        {next.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="button" onClick={update} disabled={busy || !selected}>Update</button>
    </span>
  );
}
```

- [ ] **Step 3: Implement `orders/page.tsx`**

```tsx
import { formatPrice } from "@nextshop/commerce-core";
import { getStoreRepository } from "@/lib/products";
import { AdminOrderStatus } from "@/components/AdminOrderStatus";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getStoreRepository().listOrders();
  return (
    <section>
      <h1>Orders</h1>
      {orders.length === 0 && <p>No orders yet.</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr><th>Order</th><th>Placed</th><th>Customer</th><th>Fulfilment</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderTop: "1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent)" }}>
              <td>{o.id.slice(0, 14)}…</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>{o.customer.name}</td>
              <td>{o.fulfillment.method} · {o.fulfillment.slot}</td>
              <td>{formatPrice(o.total)}</td>
              <td><AdminOrderStatus orderId={o.id} status={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

- [ ] **Step 4: Run** `pnpm --filter @nextshop/storefront test` — PASS.
- [ ] **Step 5: Commit** `git add apps/storefront/src && git commit -m "feat(storefront): admin orders page with status flow"`

---

### Task 14: full verification, changeset, docs, memory

- [ ] **Step 1: Full gates from repo root**

```bash
pnpm test && pnpm typecheck && pnpm lint
STORE_CLIENT=finnish-grocer pnpm --filter @nextshop/storefront build
STORE_CLIENT=freestylebd pnpm --filter @nextshop/storefront build
```

Expected: all green; build output lists `/admin`, `/admin/login`, `/admin/products`, `/admin/orders` routes.

- [ ] **Step 2: Changeset** — create `.changeset/owner-admin.md`:

```markdown
---
"@nextshop/commerce-core": minor
"@nextshop/db": minor
"@nextshop/config": minor
---

Owner admin: order-status transition rules, product validation + stock (inventory), verifyOwnerCredentials, ownerAdmin feature flag, stock column.
```

- [ ] **Step 3: Docs** — ROADMAP.md: add an "Owner admin" row marked ✅ (between phases 1 and 2). CONTEXT.md: update per its 20-line format (admin done; what's next). Mark this plan's checkboxes done.

- [ ] **Step 4: Memory + commit**

```bash
git add -A && git commit -m "feat: owner admin (/admin) — Auth.js + product/order/inventory management"
```

Also: `graph_register_edit` for the touched files and `graph_add_memory(type="decision", content="Owner admin shipped: Auth.js credentials, /admin CRUD, stock inventory, ownerAdmin flag")`.
