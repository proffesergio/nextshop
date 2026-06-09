import { describe, it, expect } from "vitest";
import { generateTimeSlots, orderTotal, validateCheckout } from "../checkout.js";
import { addItem } from "../cart.js";
import type { Product } from "../types.js";

const avocado: Product = { id: "a", title: "Avocado", amount: 149, currency: "eur" };

describe("generateTimeSlots", () => {
  it("splits an open window into back-to-back slots", () => {
    const slots = generateTimeSlots({ openHour: 9, closeHour: 12, slotMinutes: 60 });
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({ start: "09:00", end: "10:00", label: "09:00–10:00" });
    expect(slots[2]).toEqual({ start: "11:00", end: "12:00", label: "11:00–12:00" });
  });

  it("supports sub-hour slots and does not exceed closing time", () => {
    const slots = generateTimeSlots({ openHour: 9, closeHour: 10, slotMinutes: 30 });
    expect(slots.map((s) => s.label)).toEqual(["09:00–09:30", "09:30–10:00"]);
  });
});

describe("orderTotal", () => {
  const cart = addItem([], avocado, 2); // subtotal 298

  it("adds the delivery fee for delivery", () => {
    const total = orderTotal(cart, { method: "delivery", deliveryFee: { amount: 500, currency: "eur" } });
    expect(total).toEqual({ amount: 798, currency: "eur" });
  });

  it("charges no fee for store pickup", () => {
    const total = orderTotal(cart, { method: "pickup", deliveryFee: { amount: 500, currency: "eur" } });
    expect(total).toEqual({ amount: 298, currency: "eur" });
  });
});

describe("validateCheckout", () => {
  it("passes a complete delivery order", () => {
    expect(
      validateCheckout({ name: "Aino", method: "delivery", address: "Mannerheimintie 1", slot: "09:00–10:00" }),
    ).toEqual([]);
  });

  it("requires a name and a slot", () => {
    const errors = validateCheckout({ name: "", method: "pickup", slot: "" });
    expect(errors).toContain("Name is required");
    expect(errors).toContain("Please choose a time slot");
  });

  it("requires an address for delivery but not for pickup", () => {
    expect(validateCheckout({ name: "Aino", method: "delivery", slot: "09:00–10:00" })).toContain(
      "Delivery address is required",
    );
    expect(validateCheckout({ name: "Aino", method: "pickup", slot: "09:00–10:00" })).toEqual([]);
  });
});
