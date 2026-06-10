import type { Product } from "./types.js";

/**
 * Merchandising rules shared by every storefront: discounts, deal rails,
 * top-rated rails, and related-product picks.
 */

/** Rounded % off vs compareAtAmount, or 0 when not genuinely discounted. */
export function discountPercent(product: Product): number {
  const was = product.compareAtAmount;
  if (typeof was !== "number" || was <= product.amount) return 0;
  return Math.round((1 - product.amount / was) * 100);
}

/** True when the product has a real discount. */
export function isOnSale(product: Product): boolean {
  return discountPercent(product) > 0;
}

/** Discounted products, biggest saving first — the "Deals" shelf. */
export function dealProducts(products: Product[]): Product[] {
  return products.filter(isOnSale).sort((a, b) => discountPercent(b) - discountPercent(a));
}

/** Products rated at/above `min`, best first — the "Top rated" shelf. */
export function topRated(products: Product[], min = 4.5): Product[] {
  return products
    .filter((p) => typeof p.rating === "number" && p.rating >= min)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

/** Same-category companions for a product detail page. */
export function relatedProducts(product: Product, all: Product[], limit = 4): Product[] {
  if (!product.category) return [];
  return all.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit);
}
