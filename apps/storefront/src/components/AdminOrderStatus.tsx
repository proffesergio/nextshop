"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nextOrderStatuses, type OrderStatus } from "@nextshop/commerce-core";

/** Status mover: select a legal next status and apply it. */
export function AdminOrderStatus({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const next = nextOrderStatuses(status);
  const [selected, setSelected] = useState<OrderStatus | "">("");
  const [busy, setBusy] = useState(false);

  if (next.length === 0) return <span>{status}</span>;

  async function update() {
    if (!selected) return;
    setBusy(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <span>{status}</span>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as OrderStatus)}
        aria-label="Next status"
      >
        <option value="" disabled>
          move to…
        </option>
        {next.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button type="button" onClick={update} disabled={busy || !selected}>
        Update
      </button>
    </span>
  );
}
