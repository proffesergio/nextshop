import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetRepository, getRepository } from "@nextshop/db";
import type { OrderDraft } from "@nextshop/commerce-core";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/lib/auth";
import { PATCH } from "./[id]/route";
import { PATCH as PATCH_LOCATION } from "./[id]/location/route";
import { PATCH as PATCH_PAYMENT } from "./[id]/payment/route";

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

describe("PATCH /api/admin/orders/[id]/payment", () => {
  const markPaid = (id: string) =>
    PATCH_PAYMENT(new Request("http://test", { method: "PATCH" }), { params: { id } });

  it("rejects unauthenticated requests", async () => {
    authMock.mockResolvedValue(null);
    expect((await markPaid("any")).status).toBe(401);
  });

  it("marks a pending payment as paid", async () => {
    const order = await getRepository().createOrder({ ...draft, payment: { method: "manual", status: "pending" } });
    const res = await markPaid(order.id);
    expect(res.status).toBe(200);
    expect((await res.json()).payment.status).toBe("paid");
  });

  it("409s when the order has no payment or is already paid", async () => {
    const noPayment = await getRepository().createOrder(draft);
    expect((await markPaid(noPayment.id)).status).toBe(409);
    const paid = await getRepository().createOrder({ ...draft, payment: { method: "bkash", status: "paid" } });
    expect((await markPaid(paid.id)).status).toBe(409);
  });

  it("404s for unknown orders", async () => {
    expect((await markPaid("nope")).status).toBe(404);
  });
});

describe("PATCH /api/admin/orders/[id]/location", () => {
  const patchLoc = (id: string, body: unknown) =>
    PATCH_LOCATION(new Request("http://test", { method: "PATCH", body: JSON.stringify(body) }), { params: { id } });

  it("rejects unauthenticated requests", async () => {
    authMock.mockResolvedValue(null);
    expect((await patchLoc("any", { lat: 60, lng: 24 })).status).toBe(401);
  });

  it("rejects invalid coordinates", async () => {
    const order = await getRepository().createOrder(draft);
    expect((await patchLoc(order.id, { lat: 91, lng: 24 })).status).toBe(400);
    expect((await patchLoc(order.id, { lat: "60", lng: 24 })).status).toBe(400);
  });

  it("sets the courier location on an existing order", async () => {
    const order = await getRepository().createOrder(draft);
    const res = await patchLoc(order.id, { lat: 60.17, lng: 24.94 });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.courier.lat).toBe(60.17);
    expect(body.courier.updatedAt).toBeTruthy();
  });

  it("404s for unknown orders", async () => {
    expect((await patchLoc("nope", { lat: 60, lng: 24 })).status).toBe(404);
  });
});
