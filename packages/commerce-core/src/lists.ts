import { addItem } from "./cart.js";
import type { Cart, Product, ShoppingList } from "./types.js";

/** Generate a list id (uuid where available, else a timestamp-based fallback). */
function listId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  return g.crypto?.randomUUID?.() ?? `list_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Snapshot a cart into a named, reusable shopping list (product ids + quantities). */
export function cartToList(name: string, cart: Cart): ShoppingList {
  return {
    id: listId(),
    name,
    items: cart.map((line) => ({ productId: line.product.id, qty: line.qty })),
  };
}

/**
 * Merge a saved list into a cart, resolving each item's product from the current
 * catalog. Items whose product is no longer available are skipped. Returns a new cart.
 */
export function listToCart(cart: Cart, list: ShoppingList, catalog: Product[]): Cart {
  return list.items.reduce((acc, item) => {
    const product = catalog.find((p) => p.id === item.productId);
    return product ? addItem(acc, product, item.qty) : acc;
  }, cart);
}

/** Total quantity across a list's items. */
export function listItemCount(list: ShoppingList): number {
  return list.items.reduce((n, i) => n + i.qty, 0);
}
