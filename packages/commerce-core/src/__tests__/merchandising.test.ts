import { describe, it, expect } from "vitest";
import { discountPercent, isOnSale, dealProducts, topRated, relatedProducts } from "../merchandising.js";
import type { Product } from "../types.js";

const p = (over: Partial<Product>): Product => ({
  id: "x",
  title: "X",
  amount: 100,
  currency: "eur",
  ...over,
});

describe("discountPercent / isOnSale", () => {
  it("computes the rounded discount from compareAtAmount", () => {
    expect(discountPercent(p({ amount: 149, compareAtAmount: 199 }))).toBe(25);
    expect(discountPercent(p({ amount: 100, compareAtAmount: 100 }))).toBe(0);
    expect(discountPercent(p({ amount: 100 }))).toBe(0);
    expect(discountPercent(p({ amount: 300, compareAtAmount: 200 }))).toBe(0);
  });

  it("isOnSale only when there is a real discount", () => {
    expect(isOnSale(p({ amount: 149, compareAtAmount: 199 }))).toBe(true);
    expect(isOnSale(p({ amount: 100 }))).toBe(false);
  });
});

describe("dealProducts", () => {
  it("returns only discounted products, biggest discount first", () => {
    const list = [
      p({ id: "a", amount: 90, compareAtAmount: 100 }),
      p({ id: "b" }),
      p({ id: "c", amount: 50, compareAtAmount: 100 }),
    ];
    expect(dealProducts(list).map((x) => x.id)).toEqual(["c", "a"]);
  });
});

describe("topRated", () => {
  it("filters by minimum rating and sorts best-first", () => {
    const list = [
      p({ id: "a", rating: 4.6 }),
      p({ id: "b", rating: 4.2 }),
      p({ id: "c", rating: 4.9 }),
      p({ id: "d" }),
    ];
    expect(topRated(list).map((x) => x.id)).toEqual(["c", "a"]);
    expect(topRated(list, 4.0).map((x) => x.id)).toEqual(["c", "a", "b"]);
  });
});

describe("relatedProducts", () => {
  it("returns same-category products excluding the product itself", () => {
    const list = [
      p({ id: "a", category: "produce" }),
      p({ id: "b", category: "produce" }),
      p({ id: "c", category: "bakery" }),
      p({ id: "d", category: "produce" }),
    ];
    expect(relatedProducts(list[0]!, list).map((x) => x.id)).toEqual(["b", "d"]);
  });

  it("respects the limit and handles missing categories", () => {
    const list = [p({ id: "a" }), p({ id: "b" })];
    expect(relatedProducts(list[0]!, list)).toEqual([]);
    const many = [
      p({ id: "a", category: "produce" }),
      ...[1, 2, 3, 4, 5].map((i) => p({ id: `r${i}`, category: "produce" })),
    ];
    expect(relatedProducts(many[0]!, many, 2)).toHaveLength(2);
  });
});
