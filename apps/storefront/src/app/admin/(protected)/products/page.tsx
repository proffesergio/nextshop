import Link from "next/link";
import { formatPrice } from "@nextshop/commerce-core";
import { getStoreRepository } from "@/lib/products";
import { AdminDeleteProductButton } from "@/components/AdminDeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getStoreRepository().listProducts();
  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <Link href="/admin/products/new">+ New product</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              style={{ borderTop: "1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent)" }}
            >
              <td>
                <Link href={`/admin/products/${p.id}`}>{p.title}</Link>
              </td>
              <td>{formatPrice({ amount: p.amount, currency: p.currency })}</td>
              <td>{p.stock ?? "—"}</td>
              <td>{p.category ?? "—"}</td>
              <td>
                <AdminDeleteProductButton id={p.id} title={p.title} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
