import { describe, it, expect } from "vitest";
import { InMemoryRepository } from "../memory.js";
import type { Product, OrderDraft } from "@nextshop/commerce-core";

const seed: Product[] = [
  { id: "a", title: "Avocado", amount: 149, currency: "eur", category: "produce" },
  { id: "b", title: "Bread", amount: 320, currency: "eur", category: "bakery" },
];

const draft: OrderDraft = {
  items: [{ productId: "a", title: "Avocado", amount: 149, currency: "eur", qty: 2 }],
  total: { amount: 298, currency: "eur" },
  fulfillment: { method: "pickup", slot: "09:00–10:00" },
  customer: { name: "Aino" },
  status: "pending",
};

describe("InMemoryRepository — products", () => {
  it("lists seeded products and gets one by id", async () => {
    const repo = new InMemoryRepository(seed);
    expect(await repo.listProducts()).toHaveLength(2);
    expect((await repo.getProduct("a"))?.title).toBe("Avocado");
    expect(await repo.getProduct("nope")).toBeNull();
  });

  it("creates a product", async () => {
    const repo = new InMemoryRepository();
    await repo.createProduct({ id: "c", title: "Eggs", amount: 295, currency: "eur" });
    expect(await repo.listProducts()).toHaveLength(1);
  });

  it("persists and patches stock", async () => {
    const repo = new InMemoryRepository([]);
    await repo.createProduct({ id: "s1", title: "Rice", amount: 100, currency: "eur", stock: 10 });
    expect((await repo.getProduct("s1"))?.stock).toBe(10);
    const updated = await repo.updateProduct("s1", { stock: 0 });
    expect(updated?.stock).toBe(0);
  });
});

describe("InMemoryRepository — orders", () => {
  it("persists an order draft with a generated id, timestamp and pending status", async () => {
    const repo = new InMemoryRepository(seed);
    const order = await repo.createOrder(draft);
    expect(order.id).toBeTruthy();
    expect(order.createdAt).toBeTruthy();
    expect(order.status).toBe("pending");
    expect(order.total).toEqual({ amount: 298, currency: "eur" });
    expect(await repo.listOrders()).toHaveLength(1);
    expect((await repo.getOrder(order.id))?.customer.name).toBe("Aino");
  });

  it("updates an order's status (for tracking)", async () => {
    const repo = new InMemoryRepository();
    const order = await repo.createOrder(draft);
    const updated = await repo.updateOrderStatus(order.id, "packing");
    expect(updated?.status).toBe("packing");
    expect((await repo.getOrder(order.id))?.status).toBe("packing");
  });

  it("returns null when updating a missing order", async () => {
    const repo = new InMemoryRepository();
    expect(await repo.updateOrderStatus("missing", "shipped")).toBeNull();
  });

  it("persists the payment record and marks pay-later orders paid", async () => {
    const repo = new InMemoryRepository();
    const order = await repo.createOrder({ ...draft, payment: { method: "manual", status: "pending" } });
    expect((await repo.getOrder(order.id))?.payment).toEqual({ method: "manual", status: "pending" });
    const paid = await repo.updateOrderPayment(order.id, "paid");
    expect(paid?.payment).toEqual({ method: "manual", status: "paid" });
    expect(await repo.updateOrderPayment("missing", "paid")).toBeNull();
  });

  it("stores and returns the courier location", async () => {
    const repo = new InMemoryRepository();
    const order = await repo.createOrder(draft);
    const updated = await repo.updateOrderLocation(order.id, { lat: 60.17, lng: 24.94 });
    expect(updated?.courier?.lat).toBe(60.17);
    expect(updated?.courier?.updatedAt).toBeTruthy();
    expect(await repo.updateOrderLocation("missing", { lat: 0, lng: 0 })).toBeNull();
  });
});
