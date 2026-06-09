import { validateProductInput } from "@nextshop/commerce-core";
import { genId } from "@nextshop/db";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

/** POST /api/admin/products — create a product (owner only). */
export async function POST(request: Request) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const result = validateProductInput(body ?? {});
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 400 });
  const product = await getStoreRepository().createProduct({ id: genId("p"), ...result.value });
  return Response.json(product, { status: 201 });
}
