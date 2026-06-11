import type { Cart, CartLine } from "./types.js";

/**
 * Multi-warehouse shipment routing (Phase 4). Cart lines resolve to the
 * warehouse that stocks them; supplier-sourced items (e.g. flown in from
 * Bangladesh) ship separately with a longer lead time. Structurally matches
 * StoreConfig.warehouses so the storefront can pass config straight in.
 */

export interface WarehouseInfo {
  id: string;
  name: string;
  countryCode: string;
  type: "local" | "supplier";
}

export interface Shipment {
  warehouse: WarehouseInfo;
  lines: CartLine[];
  /** Estimated fulfilment window in days from order placement. */
  leadDays: { min: number; max: number };
}

const LEAD_DAYS: Record<WarehouseInfo["type"], { min: number; max: number }> = {
  local: { min: 0, max: 1 },
  supplier: { min: 7, max: 14 },
};

/**
 * Group cart lines into shipments by warehouse. Lines without a (known)
 * `warehouseId` ship from the first local warehouse. Local shipments sort first.
 */
export function planShipments(cart: Cart, warehouses: WarehouseInfo[]): Shipment[] {
  if (cart.length === 0 || warehouses.length === 0) return [];
  const byId = new Map(warehouses.map((w) => [w.id, w]));
  const fallback = warehouses.find((w) => w.type === "local") ?? warehouses[0]!;
  const groups = new Map<string, Shipment>();
  for (const line of cart) {
    const warehouse = (line.product.warehouseId && byId.get(line.product.warehouseId)) || fallback;
    const group = groups.get(warehouse.id) ?? { warehouse, lines: [], leadDays: LEAD_DAYS[warehouse.type] };
    group.lines.push(line);
    groups.set(warehouse.id, group);
  }
  return [...groups.values()].sort((a, b) =>
    a.warehouse.type === b.warehouse.type ? 0 : a.warehouse.type === "local" ? -1 : 1,
  );
}

/** Customer-facing ETA label for a shipment. */
export function shipmentEtaLabel(shipment: Shipment): string {
  return shipment.warehouse.type === "local"
    ? "Ships today–tomorrow"
    : `Imported · ${shipment.leadDays.min}–${shipment.leadDays.max} days`;
}
