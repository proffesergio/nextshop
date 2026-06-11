import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

/** PATCH /api/admin/orders/:id/payment — owner marks a pay-later order as paid. */
export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const repo = getStoreRepository();
  const order = await repo.getOrder(params.id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  if (!order.payment || order.payment.status === "paid") {
    return Response.json({ error: "Nothing to mark paid" }, { status: 409 });
  }
  const updated = await repo.updateOrderPayment(params.id, "paid");
  return Response.json(updated);
}
