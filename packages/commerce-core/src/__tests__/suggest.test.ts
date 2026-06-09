import { describe, it, expect } from "vitest";
import { suggestProducts } from "../search.js";
import type { Product } from "../types.js";

const p = (id: string, title: string): Product => ({ id, title, amount: 100, currency: "eur" });
const products: Product[] = [
  p("1", "Organic Avocado"),
  p("2", "Avocado Oil"),
  p("3", "Sourdough Bread"),
  p("4", "Cherry Tomatoes"),
  p("5", "Olive Oil"),
];

describe("suggestProducts", () => {
  it("returns nothing for an empty/whitespace query", () => {
    expect(suggestProducts(products, "")).toEqual([]);
    expect(suggestProducts(products, "   ")).toEqual([]);
  });

  it("matches case-insensitive substrings of the title", () => {
    expect(suggestProducts(products, "bread").map((x) => x.id)).toEqual(["3"]);
  });

  it("ranks prefix matches before mid-word matches", () => {
    // "Avocado Oil" starts with "avoca"; "Organic Avocado" only contains it
    expect(suggestProducts(products, "avoca").map((x) => x.id)).toEqual(["2", "1"]);
  });

  it("caps the number of suggestions", () => {
    expect(suggestProducts(products, "oil", 1).map((x) => x.id)).toEqual(["2"]);
    expect(suggestProducts(products, "oil").map((x) => x.id)).toEqual(["2", "5"]);
  });
});
