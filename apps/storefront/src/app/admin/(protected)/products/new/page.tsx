import { AdminProductForm } from "@/components/AdminProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <section>
      <h1>New product</h1>
      <AdminProductForm />
    </section>
  );
}
