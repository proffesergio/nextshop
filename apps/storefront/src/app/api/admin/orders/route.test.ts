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
