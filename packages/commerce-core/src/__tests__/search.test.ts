import { describe, it, expect } from "vitest";
import { filterProducts, sortProducts } from "../search.js";
import type { Product } from "../types.js";

const products: Product[] = [
  { id: "1", title: "Organic Avocado", amount: 149, currency: "eur", category: "produce" },
  { id: "2", title: "Sourdough Bread", amount: 320, currency: "eur", category: "bakery" },
  { id: "3", title: "Cherry Tomatoes", amount: 210, currency: "eur", category: "produce" },
];

describe("filterProducts", () => {
  it("returns all products when no filters given", () => {
    expect(filterProducts(products, {})).toHaveLength(3);
  });

  it("matches a case-insensitive substring query against the title", () => {
    const out = filterProducts(products, { query: "avoca" });
    expect(out.map((p) => p.id)).toEqual(["1"]);
  });

  it("filters by category", () => {
    const out = filterProducts(products, { category: "produce" });
    expect(out.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("combines query and category", () => {
    const out = filterProducts(products, { query: "tomato", category: "produce" });
    expect(out.map((p) => p.id)).toEqual(["3"]);
  });
});

describe("sortProducts", () => {
  it("sorts by price ascending", () => {
    expect(sortProducts(products, "price-asc").map((p) => p.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts by price descending", () => {
    expect(sortProducts(products, "price-desc").map((p) => p.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts by title alphabetically", () => {
    // Cherry Tomatoes(3) < Organic Avocado(1) < Sourdough Bread(2)
    expect(sortProducts(products, "title").map((p) => p.id)).toEqual(["3", "1", "2"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...products];
    sortProducts(products, "price-desc");
    expect(products).toEqual(copy);
  });
});
