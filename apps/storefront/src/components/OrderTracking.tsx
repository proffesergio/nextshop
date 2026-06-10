"use client";

import { useEffect, useState } from "react";
import {
  formatPrice,
  orderTimeline,
  trackingProgress,
  type Order,
} from "@nextshop/commerce-core";
import { OrderTimeline } from "@nextshop/ui";

const POLL_MS = 10_000;
const TERMINAL = new Set(["delivered", "cancelled"]);

const HEADLINES: Record<Order["status"], string> = {
  pending: "Order received",
  packing: "Packing your order",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Order cancelled",
};

/** Live tracking view: polls the public order API and renders the journey. */
export function OrderTracking({ initial, gps, locale }: { initial: Order; gps: boolean; locale: string }) {
  const [order, setOrder] = useState(initial);

  useEffect(() => {
    if (TERMINAL.has(order.status)) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (res.ok) setOrder((await res.json()) as Order);
      } catch {
        // transient network error — keep showing the last known state
      }
    }, POLL_MS);
    return () => clearInterval(t);
  }, [order.id, order.status]);

  const card: React.CSSProperties = {
    backgroundImage: "var(--gradient-card)",
    borderRadius: "calc(var(--radius) * 1.2)",
    padding: "var(--space-5)",
    boxShadow: "var(--shadow-md)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <p style={{ margin: 0, opacity: 0.6, fontSize: "0.9rem" }}>
          Order {order.id.slice(0, 14)}… · placed {new Date(order.createdAt).toLocaleString(locale)}
        </p>
        <h1 style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontSize: "2rem" }}>
          {HEADLINES[order.status]}
        </h1>
        {!TERMINAL.has(order.status) && (
          <p style={{ margin: "4px 0 0", opacity: 0.65, fontSize: "0.9rem" }}>
            Updates automatically — keep this page open.
          </p>
        )}
      </div>

      <section style={card} aria-label="Delivery journey">
        <OrderTimeline steps={orderTimeline(order.status)} progress={trackingProgress(order.status)} />
      </section>

      {gps && order.courier && (
        <section style={card} aria-label="Live courier map">
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>
            🛰️ Courier position
            <span style={{ fontWeight: 400, opacity: 0.6, fontSize: "0.85rem", marginLeft: 10 }}>
              updated {new Date(order.courier.updatedAt).toLocaleTimeString(locale)}
            </span>
          </h2>
          <iframe
            title="Courier location"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.courier.lng - 0.01},${order.courier.lat - 0.01},${order.courier.lng + 0.01},${order.courier.lat + 0.01}&layer=mapnik&marker=${order.courier.lat},${order.courier.lng}`}
            style={{ width: "100%", height: 320, border: 0, borderRadius: "var(--radius)" }}
            loading="lazy"
          />
        </section>
      )}

      <section style={card} aria-label="Order summary">
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Your order</h2>
        {order.items.map((it) => (
          <div key={it.productId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span>
              {it.title} × {it.qty}
            </span>
            <span>{formatPrice({ amount: it.amount * it.qty, currency: it.currency }, locale)}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)",
            marginTop: 8,
            paddingTop: 10,
          }}
        >
          <strong>Total</strong>
          <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>
            {formatPrice(order.total, locale)}
          </strong>
        </div>
        <p style={{ margin: "10px 0 0", opacity: 0.7, fontSize: "0.9rem" }}>
          {order.fulfillment.method === "delivery" ? "Delivery" : "Pickup"} · {order.fulfillment.slot}
          {order.customer.address ? ` · ${order.customer.address}` : ""}
        </p>
      </section>
    </div>
  );
}
