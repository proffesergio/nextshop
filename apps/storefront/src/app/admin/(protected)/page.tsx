import { isLowStock } from "@nextshop/commerce-core";
import { getStoreRepository } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const repo = getStoreRepository();
  const [products, orders] = await Promise.all([repo.listProducts(), repo.listOrders()]);
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => isLowStock(p)).length;

  const cards: Array<[string, number]> = [
    ["Products", products.length],
    ["Orders", orders.length],
    ["Pending orders", pending],
    ["Low stock", lowStock],
  ];
  return (
    <section
      style={{ display: "grid", gap: "var(--space-4)", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
    >
      {cards.map(([label, value]) => (
        <div
          key={label}
          style={{ backgroundImage: "var(--gradient-card)", borderRadius: "var(--radius)", padding: "var(--space-5)" }}
        >
          <div style={{ fontSize: "2rem", fontFamily: "var(--font-display)" }}>{value}</div>
          <div>{label}</div>
        </div>
      ))}
    </section>
  );
}
