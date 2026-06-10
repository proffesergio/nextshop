import { isValidCoordinates } from "@nextshop/commerce-core";
import { auth } from "@/lib/auth";
import { getStoreRepository } from "@/lib/products";

/** PATCH /api/admin/orders/:id/location — owner/courier pushes a GPS fix. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await auth())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { lat?: unknown; lng?: unknown } | null;
  if (!body || !isValidCoordinates(body.lat, body.lng)) {
    return Response.json({ error: "lat/lng must be valid coordinates" }, { status: 400 });
  }
  const updated = await getStoreRepository().updateOrderLocation(params.id, {
    lat: body.lat as number,
    lng: body.lng as number,
  });
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}
