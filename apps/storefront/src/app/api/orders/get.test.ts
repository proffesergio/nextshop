import { describe, it, expect, beforeEach } from "vitest";
import { resetRepository, getRepository } from "@nextshop/db";
import type { OrderDraft } from "@nextshop/commerce-core";
import { GET } from "./[id]/route";

const draft: OrderDraft = {
  items: [{ productId: "g1", title: "Avocado", amount: 149, currency: "eur", qty: 1 }],
  total: { amount: 149, currency: "eur" },
  fulfillment: { method: "delivery", slot: "10:00–11:00" },
  customer: { name: "Aino", address: "Mannerheimintie 1" },
  status: "pending",
};

beforeEach(() => resetRepository());

describe("GET /api/orders/[id]", () => {
  it("returns an order by id", async () => {
    const order = await getRepository().createOrder(draft);
    const res = await GET(new Request("http://test"), { params: { id: order.id } });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(order.id);
  });

  it("404s for unknown ids", async () => {
    expect((await GET(new Request("http://test"), { params: { id: "nope" } })).status).toBe(404);
  });
});
