import { notFound } from "next/navigation";
import { getStoreConfig } from "@/lib/store";
import { getProduct } from "@/lib/products";
import { ProductDetail } from "@/components/ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const config = getStoreConfig();
  const product = await getProduct(config.id, id);
  if (!product) notFound();
  return <ProductDetail config={config} product={product} />;
}
