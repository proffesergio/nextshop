import { notFound } from "next/navigation";
import { relatedProducts } from "@nextshop/commerce-core";
import { getStoreConfig } from "@/lib/store";
import { getProduct, getProducts } from "@/lib/products";
import { ProductDetail } from "@/components/ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const config = getStoreConfig();
  const product = await getProduct(config.id, id);
  if (!product) notFound();
  const related = relatedProducts(product, await getProducts(config.id));
  return <ProductDetail config={config} product={product} related={related} />;
}
