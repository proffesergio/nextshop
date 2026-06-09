import type { Product } from "./types.js";

export interface ProductFilter {
  /** Case-insensitive substring matched against the product title. */
  query?: string;
  /** Exact category match. */
  category?: string;
}

export type ProductSort = "relevance" | "price-asc" | "price-desc" | "title";

/** Filter products by free-text query and/or category. Returns a new array. */
export function filterProducts(products: Product[], filter: ProductFilter): Product[] {
  const q = filter.query?.trim().toLowerCase();
  return products.filter((p) => {
    if (filter.category && p.category !== filter.category) return false;
    if (q && !p.title.toLowerCase().includes(q)) return false;
    return true;
  });
}

/**
 * Autocomplete suggestions for a query: case-insensitive title matches, with
 * prefix matches ranked before mid-word matches, capped at `limit`. Empty query
 * yields no suggestions.
 */
export function suggestProducts(products: Product[], query: string, limit = 5): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const prefix: Product[] = [];
  const contains: Product[] = [];
  for (const p of products) {
    const title = p.title.toLowerCase();
    if (title.startsWith(q)) prefix.push(p);
    else if (title.includes(q)) contains.push(p);
  }
  return [...prefix, ...contains].slice(0, limit);
}

/** Sort products by the given key. Returns a new array (does not mutate input). */
export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.amount - b.amount);
    case "price-desc":
      return copy.sort((a, b) => b.amount - a.amount);
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "relevance":
    default:
      return copy;
  }
}
