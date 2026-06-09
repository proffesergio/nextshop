import type { Cart, Money, Product } from "./types.js";

/** Add a product to the cart (or bump its quantity). Returns a new cart. */
export function addItem(cart: Cart, product: Product, qty = 1): Cart {
  const existing = cart.find((l) => l.product.id === product.id);
  if (existing) {
    return cart.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + qty } : l));
  }
  return [...cart, { product, qty }];
}

/** Remove a product from the cart. Returns a new cart. */
export function removeItem(cart: Cart, productId: string): Cart {
  return cart.filter((l) => l.product.id !== productId);
}

/** Set an explicit quantity; qty <= 0 removes the line. Returns a new cart. */
export function setQty(cart: Cart, productId: string, qty: number): Cart {
  if (qty <= 0) return removeItem(cart, productId);
  return cart.map((l) => (l.product.id === productId ? { ...l, qty } : l));
}

/** Total number of items (sum of quantities). */
export function cartCount(cart: Cart): number {
  return cart.reduce((n, l) => n + l.qty, 0);
}

/**
 * Sum of amount * qty. Assumes a single-currency cart (the storefront enforces
 * one region/currency per store). `fallbackCurrency` is used for an empty cart.
 */
export function cartSubtotal(cart: Cart, fallbackCurrency = "eur"): Money {
  const currency = cart[0]?.product.currency ?? fallbackCurrency;
  const amount = cart.reduce((sum, l) => sum + l.product.amount * l.qty, 0);
  return { amount, currency };
}
