import { getStoreConfig } from "@/lib/store";
import { getProducts } from "@/lib/products";
import { StoreHome } from "@/components/StoreHome";

export default async function HomePage() {
  const config = getStoreConfig();
  const products = await getProducts(config.id);
  return <StoreHome config={config} products={products} />;
}
