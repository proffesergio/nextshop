import { validateProductPatch } from "@nextshop/commerce-core";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

/** PATCH /api/admin/products/:id — update fields (incl. stock). Owner only. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const result = validateProductPatch(body ?? {});
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 400 });
  const updated = await getStoreRepository().updateProduct(params.id, result.value);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

/** DELETE /api/admin/products/:id — remove a product. Owner only. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await getStoreRepository().deleteProduct(params.id);
  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
