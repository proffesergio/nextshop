import { describe, it, expect } from "vitest";
import { nextOrderStatuses, canTransitionOrder } from "../order.js";

describe("order status transitions", () => {
  it("pending can move to packing or cancelled", () => {
    expect(nextOrderStatuses("pending")).toEqual(["packing", "cancelled"]);
  });

  it("packing can move to shipped or cancelled", () => {
    expect(nextOrderStatuses("packing")).toEqual(["shipped", "cancelled"]);
  });

  it("shipped can only move to delivered", () => {
    expect(nextOrderStatuses("shipped")).toEqual(["delivered"]);
  });

  it("delivered and cancelled are terminal", () => {
    expect(nextOrderStatuses("delivered")).toEqual([]);
    expect(nextOrderStatuses("cancelled")).toEqual([]);
  });

  it("canTransitionOrder allows only listed moves", () => {
    expect(canTransitionOrder("pending", "packing")).toBe(true);
    expect(canTransitionOrder("pending", "delivered")).toBe(false);
    expect(canTransitionOrder("shipped", "cancelled")).toBe(false);
  });
});
