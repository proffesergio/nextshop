import type { OrderDraft } from "@nextshop/commerce-core";
import { getRepository } from "@nextshop/db";

/** POST /api/orders — persist a new order and return the saved record. */
export async function POST(request: Request) {
  try {
    const draft = (await request.json()) as OrderDraft;
    const order = await getRepository().createOrder(draft);
    return Response.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}
