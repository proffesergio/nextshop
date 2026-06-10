import type { Product } from "@nextshop/commerce-core";
import { getRepository } from "@nextshop/db";

/**
 * Product source — delegates to the @nextshop/db repository.
 *
 * Each client's demo data is used as the in-memory seed when DATABASE_URL is
 * not set; when it is set the Neon-backed repo is used instead.
 */

const demoByClient: Record<string, Product[]> = {
  "finnish-grocer": [
    { id: "g1", title: "Organic Avocado", amount: 149, compareAtAmount: 199, currency: "eur", thumbnail: "🥑", tag: "Organic", category: "produce", rating: 4.7, reviewCount: 132, stock: 24 },
    { id: "g2", title: "Sourdough Rye", amount: 320, currency: "eur", thumbnail: "🍞", category: "bakery", rating: 4.9, reviewCount: 287, stock: 12 },
    { id: "g3", title: "Cherry Tomatoes", amount: 210, compareAtAmount: 260, currency: "eur", thumbnail: "🍅", tag: "Fresh", category: "produce", rating: 4.4, reviewCount: 96, stock: 40 },
    { id: "g4", title: "Free-range Eggs", amount: 295, currency: "eur", thumbnail: "🥚", category: "dairy", rating: 4.8, reviewCount: 203, stock: 3 },
    { id: "g5", title: "Alphonso Mango", amount: 450, compareAtAmount: 590, currency: "eur", thumbnail: "🥭", tag: "Bangladesh", origin: "Sourced from Bangladesh", category: "produce", rating: 4.9, reviewCount: 412, stock: 8 },
    { id: "g6", title: "Cold-press Olive Oil", amount: 890, currency: "eur", thumbnail: "🫒", tag: "Fair trade", category: "pantry", rating: 4.6, reviewCount: 88, stock: 18 },
    { id: "g7", title: "Wild Blueberries", amount: 375, compareAtAmount: 425, currency: "eur", thumbnail: "🫐", tag: "Fresh", category: "produce", rating: 4.5, reviewCount: 64, stock: 0 },
    { id: "g8", title: "Aged Gouda", amount: 540, currency: "eur", thumbnail: "🧀", category: "dairy", rating: 4.3, reviewCount: 51, stock: 15 },
  ],
  freestylebd: [
    { id: "c1", title: "Premium Denim Jacket", amount: 349000, compareAtAmount: 449000, currency: "bdt", thumbnail: "🧥", tag: "Export quality", category: "outerwear", rating: 4.8, reviewCount: 156, stock: 9 },
    { id: "c2", title: "Organic Cotton Tee", amount: 89000, compareAtAmount: 119000, currency: "bdt", thumbnail: "👕", tag: "Organic cotton", category: "tops", rating: 4.6, reviewCount: 322, stock: 50 },
    { id: "c3", title: "Tailored Chinos", amount: 199000, currency: "bdt", thumbnail: "👖", category: "bottoms", rating: 4.4, reviewCount: 74, stock: 21 },
    { id: "c4", title: "Knit Sweater", amount: 225000, currency: "bdt", thumbnail: "🧶", tag: "New", category: "tops", rating: 4.7, reviewCount: 41, stock: 4 },
    { id: "c5", title: "Linen Shirt", amount: 145000, currency: "bdt", thumbnail: "👔", tag: "Export quality", category: "tops", rating: 4.5, reviewCount: 188, stock: 33 },
    { id: "c6", title: "Canvas Sneakers", amount: 279000, compareAtAmount: 329000, currency: "bdt", thumbnail: "👟", category: "footwear", rating: 4.9, reviewCount: 264, stock: 11 },
    { id: "c7", title: "Summer Dress", amount: 189000, currency: "bdt", thumbnail: "👗", tag: "New", category: "dresses", rating: 4.6, reviewCount: 97, stock: 0 },
    { id: "c8", title: "Wool Scarf", amount: 69000, currency: "bdt", thumbnail: "🧣", category: "accessories", rating: 4.2, reviewCount: 36, stock: 27 },
  ],
};

export async function getProducts(clientId: string): Promise<Product[]> {
  return getRepository(demoByClient[clientId] ?? []).listProducts();
}

export async function getProduct(clientId: string, id: string): Promise<Product | null> {
  return getRepository(demoByClient[clientId] ?? []).getProduct(id);
}

/** The active client's repository (seeded demo data when no DATABASE_URL). */
export function getStoreRepository() {
  const clientId = process.env.STORE_CLIENT ?? "finnish-grocer";
  return getRepository(demoByClient[clientId] ?? []);
}
