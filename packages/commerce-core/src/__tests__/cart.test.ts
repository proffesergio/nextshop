import { describe, it, expect } from "vitest";
import { addItem, removeItem, setQty, cartCount, cartSubtotal } from "../cart.js";
import type { Product } from "../types.js";

const avocado: Product = { id: "a", title: "Avocado", amount: 149, currency: "eur" };
const bread: Product = { id: "b", title: "Bread", amount: 320, currency: "eur" };

describe("addItem", () => {
  it("adds a new line with qty 1 by default", () => {
    const cart = addItem([], avocado);
    expect(cart).toEqual([{ product: avocado, qty: 1 }]);
  });

  it("increments qty when the product is already in the cart", () => {
    const cart = addItem(addItem([], avocado), avocado, 2);
    expect(cart).toEqual([{ product: avocado, qty: 3 }]);
  });

  it("does not mutate the input cart", () => {
    const initial = addItem([], avocado);
    addItem(initial, avocado);
    expect(initial).toEqual([{ product: avocado, qty: 1 }]);
  });
});

describe("setQty", () => {
  it("sets an explicit quantity", () => {
    const cart = setQty(addItem([], avocado), "a", 5);
    expect(cart[0]!.qty).toBe(5);
  });

  it("removes the line when qty is 0 or less", () => {
    const cart = setQty(addItem([], avocado), "a", 0);
    expect(cart).toEqual([]);
  });
});

describe("removeItem", () => {
  it("removes the matching line only", () => {
    const cart = removeItem(addItem(addItem([], avocado), bread), "a");
    expect(cart).toEqual([{ product: bread, qty: 1 }]);
  });
});

describe("totals", () => {
  it("cartCount sums quantities", () => {
    const cart = addItem(addItem([], avocado, 2), bread, 3);
    expect(cartCount(cart)).toBe(5);
  });

  it("cartSubtotal sums amount * qty in the cart currency", () => {
    const cart = addItem(addItem([], avocado, 2), bread, 1); // 149*2 + 320 = 618
    expect(cartSubtotal(cart)).toEqual({ amount: 618, currency: "eur" });
  });

  it("cartSubtotal of an empty cart is zero with a fallback currency", () => {
    expect(cartSubtotal([], "eur")).toEqual({ amount: 0, currency: "eur" });
  });
});
