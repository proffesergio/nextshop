import { describe, it, expect } from "vitest";
import { planShipments, shipmentEtaLabel, type WarehouseInfo } from "../routing.js";
import type { Cart, Product } from "../types.js";

const warehouses: WarehouseInfo[] = [
  { id: "fi-helsinki", name: "Helsinki Cold Store", countryCode: "FI", type: "local" },
  { id: "bd-supplier", name: "Dhaka Supplier", countryCode: "BD", type: "supplier" },
];

const p = (over: Partial<Product>): Product => ({ id: "x", title: "X", amount: 100, currency: "eur", ...over });
const line = (product: Product, qty = 1) => ({ product, qty });

describe("planShipments", () => {
  it("puts everything in one local shipment by default", () => {
    const cart: Cart = [line(p({ id: "a" })), line(p({ id: "b" }))];
    const plan = planShipments(cart, warehouses);
    expect(plan).toHaveLength(1);
    expect(plan[0]!.warehouse.id).toBe("fi-helsinki");
    expect(plan[0]!.lines).toHaveLength(2);
    expect(plan[0]!.leadDays).toEqual({ min: 0, max: 1 });
  });

  it("splits supplier-sourced items into their own shipment, local first", () => {
    const cart: Cart = [
      line(p({ id: "mango", warehouseId: "bd-supplier" })),
      line(p({ id: "avocado" })),
    ];
    const plan = planShipments(cart, warehouses);
    expect(plan).toHaveLength(2);
    expect(plan[0]!.warehouse.type).toBe("local");
    expect(plan[1]!.warehouse.id).toBe("bd-supplier");
    expect(plan[1]!.leadDays).toEqual({ min: 7, max: 14 });
  });

  it("falls back to the first local warehouse for unknown warehouse ids", () => {
    const plan = planShipments([line(p({ id: "a", warehouseId: "nope" }))], warehouses);
    expect(plan).toHaveLength(1);
    expect(plan[0]!.warehouse.id).toBe("fi-helsinki");
  });

  it("returns no shipments for an empty cart", () => {
    expect(planShipments([], warehouses)).toEqual([]);
  });
});

describe("shipmentEtaLabel", () => {
  it("labels local and supplier shipments differently", () => {
    const plan = planShipments(
      [line(p({ id: "a" })), line(p({ id: "m", warehouseId: "bd-supplier" }))],
      warehouses,
    );
    expect(shipmentEtaLabel(plan[0]!)).toBe("Ships today–tomorrow");
    expect(shipmentEtaLabel(plan[1]!)).toBe("Imported · 7–14 days");
  });
});
