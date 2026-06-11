"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Owner marks a pay-later (COD/manual) order as paid once the cash is in hand. */
export function AdminMarkPaid({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function markPaid() {
    setBusy(true);
    await fetch(`/api/admin/orders/${orderId}/payment`, { method: "PATCH" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={markPaid} disabled={busy}>
      Mark paid
    </button>
  );
}
