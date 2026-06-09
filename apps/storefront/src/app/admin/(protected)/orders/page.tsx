import { formatPrice } from "@nextshop/commerce-core";
import { getStoreRepository } from "@/lib/products";
import { AdminOrderStatus } from "@/components/AdminOrderStatus";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getStoreRepository().listOrders();
  return (
    <section>
      <h1>Orders</h1>
      {orders.length === 0 && <p>No orders yet.</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Placed</th>
            <th>Customer</th>
            <th>Fulfilment</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              style={{ borderTop: "1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent)" }}
            >
              <td>{o.id.slice(0, 14)}…</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>{o.customer.name}</td>
              <td>
                {o.fulfillment.method} · {o.fulfillment.slot}
              </td>
              <td>{formatPrice(o.total)}</td>
              <td>
                <AdminOrderStatus orderId={o.id} status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
