import { getStoreRepository } from "@/lib/products";

/** GET /api/orders/:id — public order tracking lookup (the unguessable id is the capability). */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const order = await getStoreRepository().getOrder(params.id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(order);
}
