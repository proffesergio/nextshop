"use client";

import { useEffect, useState } from "react";
import { addItem, removeItem, setQty, cartCount, type Cart, type Product } from "@nextshop/commerce-core";

/**
 * Client-side cart state backed by localStorage (per store, so different clients
 * don't share a cart). The pure cart math lives in @nextshop/commerce-core.
 */
export function useCart(storeId: string) {
  const key = `nextshop:cart:${storeId}`;
  const [cart, setCart] = useState<Cart>([]);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setCart(JSON.parse(raw) as Cart);
    } catch {
      /* ignore malformed storage */
    }
  }, [key]);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [key, cart]);

  return {
    cart,
    count: cartCount(cart),
    add: (product: Product, qty = 1) => setCart((c) => addItem(c, product, qty)),
    remove: (productId: string) => setCart((c) => removeItem(c, productId)),
    setQty: (productId: string, qty: number) => setCart((c) => setQty(c, productId, qty)),
    clear: () => setCart([]),
  };
}
