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
    { id: "g1", title: "Organic Avocado", amount: 149, currency: "eur", thumbnail: "🥑", tag: "Organic", category: "produce" },
    { id: "g2", title: "Sourdough Rye", amount: 320, currency: "eur", thumbnail: "🍞", category: "bakery" },
    { id: "g3", title: "Cherry Tomatoes", amount: 210, currency: "eur", thumbnail: "🍅", tag: "Fresh", category: "produce" },
    { id: "g4", title: "Free-range Eggs", amount: 295, currency: "eur", thumbnail: "🥚", category: "dairy" },
    { id: "g5", title: "Alphonso Mango", amount: 450, currency: "eur", thumbnail: "🥭", tag: "Bangladesh", origin: "Sourced from Bangladesh", category: "produce" },
    { id: "g6", title: "Cold-press Olive Oil", amount: 890, currency: "eur", thumbnail: "🫒", tag: "Fair trade", category: "pantry" },
    { id: "g7", title: "Wild Blueberries", amount: 375, currency: "eur", thumbnail: "🫐", tag: "Fresh", category: "produce" },
    { id: "g8", title: "Aged Gouda", amount: 540, currency: "eur", thumbnail: "🧀", category: "dairy" },
  ],
  freestylebd: [
    { id: "c1", title: "Premium Denim Jacket", amount: 349000, currency: "bdt", thumbnail: "🧥", tag: "Export quality", category: "outerwear" },
    { id: "c2", title: "Organic Cotton Tee", amount: 89000, currency: "bdt", thumbnail: "👕", tag: "Organic cotton", category: "tops" },
    { id: "c3", title: "Tailored Chinos", amount: 199000, currency: "bdt", thumbnail: "👖", category: "bottoms" },
    { id: "c4", title: "Knit Sweater", amount: 225000, currency: "bdt", thumbnail: "🧶", tag: "New", category: "tops" },
    { id: "c5", title: "Linen Shirt", amount: 145000, currency: "bdt", thumbnail: "👔", tag: "Export quality", category: "tops" },
    { id: "c6", title: "Canvas Sneakers", amount: 279000, currency: "bdt", thumbnail: "👟", category: "footwear" },
    { id: "c7", title: "Summer Dress", amount: 189000, currency: "bdt", thumbnail: "👗", tag: "New", category: "dresses" },
    { id: "c8", title: "Wool Scarf", amount: 69000, currency: "bdt", thumbnail: "🧣", category: "accessories" },
  ],
};

export async function getProducts(clientId: string): Promise<Product[]> {
  return getRepository(demoByClient[clientId] ?? []).listProducts();
}

export async function getProduct(clientId: string, id: string): Promise<Product | null> {
  return getRepository(demoByClient[clientId] ?? []).getProduct(id);
}
