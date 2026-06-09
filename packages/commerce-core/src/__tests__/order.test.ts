import { describe, it, expect } from "vitest";
import { buildOrderDraft } from "../order.js";
import { addItem } from "../cart.js";
import type { Product } from "../types.js";

const avocado: Product = { id: "a", title: "Avocado", amount: 149, currency: "eur", thumbnail: "🥑" };
const bread: Product = { id: "b", title: "Bread", amount: 320, currency: "eur" };

const cart = addItem(addItem([], avocado, 2), bread, 1); // subtotal 618

describe("buildOrderDraft", () => {
  const draft = buildOrderDraft(cart, {
    method: "delivery",
    slot: "09:00–10:00",
    customerName: "Aino",
    address: "Mannerheimintie 1",
    deliveryFee: { amount: 500, currency: "eur" },
  });

  it("snapshots cart lines into order items (title + price frozen at purchase)", () => {
    expect(draft.items).toEqual([
      { productId: "a", title: "Avocado", amount: 149, currency: "eur", qty: 2 },
      { productId: "b", title: "Bread", amount: 320, currency: "eur", qty: 1 },
    ]);
  });

  it("computes the total including the delivery fee", () => {
    expect(draft.total).toEqual({ amount: 1118, currency: "eur" }); // 618 + 500
  });

  it("records fulfillment + customer and starts in 'pending'", () => {
    expect(draft.fulfillment).toEqual({ method: "delivery", slot: "09:00–10:00" });
    expect(draft.customer).toEqual({ name: "Aino", address: "Mannerheimintie 1" });
    expect(draft.status).toBe("pending");
  });

  it("omits the delivery fee for pickup", () => {
    const pickup = buildOrderDraft(cart, {
      method: "pickup",
      slot: "10:00–11:00",
      customerName: "Aino",
      deliveryFee: { amount: 500, currency: "eur" },
    });
    expect(pickup.total).toEqual({ amount: 618, currency: "eur" });
  });
});
