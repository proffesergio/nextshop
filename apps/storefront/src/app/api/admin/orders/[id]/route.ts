import { canTransitionOrder, type OrderStatus } from "@nextshop/commerce-core";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

const STATUSES: OrderStatus[] = ["pending", "packing", "shipped", "delivered", "cancelled"];

/** PATCH /api/admin/orders/:id — move an order along its status flow. Owner only. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status;
  if (typeof status !== "string" || !STATUSES.includes(status as OrderStatus)) {
    return Response.json({ error: "Unknown status" }, { status: 400 });
  }
  const repo = getStoreRepository();
  const order = await repo.getOrder(params.id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  if (!canTransitionOrder(order.status, status as OrderStatus)) {
    return Response.json({ error: `Cannot move ${order.status} → ${status}` }, { status: 409 });
  }
  const updated = await repo.updateOrderStatus(params.id, status as OrderStatus);
  return Response.json(updated);
}
