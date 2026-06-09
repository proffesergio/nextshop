"use client";

import { useEffect, useState } from "react";
import { cartToList, type Cart, type ShoppingList } from "@nextshop/commerce-core";

/**
 * Saved shopping lists, persisted to localStorage per store. Pure list logic
 * (snapshot/restore) lives in @nextshop/commerce-core.
 */
export function useShoppingLists(storeId: string) {
  const key = `nextshop:lists:${storeId}`;
  const [lists, setLists] = useState<ShoppingList[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setLists(JSON.parse(raw) as ShoppingList[]);
    } catch {
      /* ignore malformed storage */
    }
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(lists));
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [key, lists]);

  return {
    lists,
    saveCartAsList: (name: string, cart: Cart) => setLists((ls) => [...ls, cartToList(name, cart)]),
    deleteList: (id: string) => setLists((ls) => ls.filter((l) => l.id !== id)),
  };
}
