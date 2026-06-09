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
