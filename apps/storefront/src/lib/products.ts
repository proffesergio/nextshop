import type { ProductCardProduct } from "@nextshop/ui";

/**
 * Phase 0 product source.
 *
 * If NEXT_PUBLIC_MEDUSA_BACKEND_URL is set we fetch from the Medusa Store API;
 * otherwise we return per-vertical demo data so the storefront runs standalone
 * (and the theme-switch verification works without a database). Medusa wiring is
 * finalised in Phase 1.
 */

const demoByClient: Record<string, ProductCardProduct[]> = {
  "finnish-grocer": [
    { id: "g1", title: "Organic Avocado", price: "€1,49", thumbnail: "🥑", tag: "Organic" },
    { id: "g2", title: "Sourdough Rye", price: "€3,20", thumbnail: "🍞" },
    { id: "g3", title: "Cherry Tomatoes", price: "€2,10", thumbnail: "🍅", tag: "Fresh" },
    { id: "g4", title: "Free-range Eggs", price: "€2,95", thumbnail: "🥚" },
    { id: "g5", title: "Alphonso Mango", price: "€4,50", thumbnail: "🥭", tag: "Bangladesh", origin: "Sourced from Bangladesh" },
    { id: "g6", title: "Cold-press Olive Oil", price: "€8,90", thumbnail: "🫒", tag: "Fair trade" },
    { id: "g7", title: "Wild Blueberries", price: "€3,75", thumbnail: "🫐", tag: "Fresh" },
    { id: "g8", title: "Aged Gouda", price: "€5,40", thumbnail: "🧀" },
  ],
  freestylebd: [
    { id: "c1", title: "Premium Denim Jacket", price: "৳3,490", thumbnail: "🧥", tag: "Export quality" },
    { id: "c2", title: "Organic Cotton Tee", price: "৳890", thumbnail: "👕", tag: "Organic cotton" },
    { id: "c3", title: "Tailored Chinos", price: "৳1,990", thumbnail: "👖" },
    { id: "c4", title: "Knit Sweater", price: "৳2,250", thumbnail: "🧶", tag: "New" },
    { id: "c5", title: "Linen Shirt", price: "৳1,450", thumbnail: "👔", tag: "Export quality" },
    { id: "c6", title: "Canvas Sneakers", price: "৳2,790", thumbnail: "👟" },
    { id: "c7", title: "Summer Dress", price: "৳1,890", thumbnail: "👗", tag: "New" },
    { id: "c8", title: "Wool Scarf", price: "৳690", thumbnail: "🧣" },
  ],
};

const fallback: ProductCardProduct[] = [
  { id: "p1", title: "Sample Product", price: "€0,00", thumbnail: "📦" },
];

export async function getFeaturedProducts(clientId: string): Promise<ProductCardProduct[]> {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
  if (backend) {
    try {
      const res = await fetch(`${backend}/store/products?limit=8`, {
        headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "" },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = (await res.json()) as { products?: Array<Record<string, unknown>> };
        const products = data.products ?? [];
        if (products.length > 0) {
          return products.map((p) => ({
            id: String(p.id),
            title: String(p.title ?? "Product"),
            price: "—",
            thumbnail: typeof p.thumbnail === "string" ? p.thumbnail : "📦",
          }));
        }
      }
    } catch {
      // fall through to demo data when the backend is unreachable in Phase 0
    }
  }
  return demoByClient[clientId] ?? fallback;
}
