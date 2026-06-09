import { notFound } from "next/navigation";
import { getStoreRepository } from "@/lib/products";
import { AdminProductForm } from "@/components/AdminProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getStoreRepository().getProduct(params.id);
  if (!product) notFound();
  return (
    <section>
      <h1>Edit product</h1>
      <AdminProductForm initial={product} />
    </section>
  );
}
