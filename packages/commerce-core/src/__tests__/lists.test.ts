import { describe, it, expect } from "vitest";
import { cartToList, listToCart, listItemCount } from "../lists.js";
import { addItem } from "../cart.js";
import type { Product } from "../types.js";

const avocado: Product = { id: "a", title: "Avocado", amount: 149, currency: "eur" };
const bread: Product = { id: "b", title: "Bread", amount: 320, currency: "eur" };
const catalog = [avocado, bread];

describe("cartToList", () => {
  it("snapshots a cart's items (product id + qty) under a name", () => {
    const cart = addItem(addItem([], avocado, 2), bread, 1);
    const list = cartToList("Weekly shop", cart);
    expect(list.name).toBe("Weekly shop");
    expect(list.items).toEqual([
      { productId: "a", qty: 2 },
      { productId: "b", qty: 1 },
    ]);
    expect(list.id).toBeTruthy();
  });
});

describe("listToCart", () => {
  it("merges a list's items into the cart, resolving products from the catalog", () => {
    const list = cartToList("L", addItem(addItem([], avocado, 2), bread, 1));
    const cart = listToCart([], list, catalog);
    expect(cart).toEqual([
      { product: avocado, qty: 2 },
      { product: bread, qty: 1 },
    ]);
  });

  it("adds onto an existing cart (incrementing matching lines)", () => {
    const list = cartToList("L", addItem([], avocado, 1));
    const cart = listToCart(addItem([], avocado, 1), list, catalog);
    expect(cart).toEqual([{ product: avocado, qty: 2 }]);
  });

  it("skips list items whose product is no longer in the catalog", () => {
    const list = cartToList("L", addItem(addItem([], avocado, 1), bread, 1));
    const cart = listToCart([], list, [avocado]); // bread removed from catalog
    expect(cart).toEqual([{ product: avocado, qty: 1 }]);
  });
});

describe("listItemCount", () => {
  it("sums the quantities in a list", () => {
    const list = cartToList("L", addItem(addItem([], avocado, 2), bread, 3));
    expect(listItemCount(list)).toBe(5);
  });
});
