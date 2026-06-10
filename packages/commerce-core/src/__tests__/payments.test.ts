import { describe, it, expect } from "vitest";
import {
  availablePaymentMethods,
  validatePaymentSelection,
  paymentForMethod,
} from "../payments.js";
import { buildOrderDraft } from "../order.js";
import type { Cart } from "../types.js";

describe("availablePaymentMethods", () => {
  it("resolves enabled provider ids to descriptors, preserving order", () => {
    const methods = availablePaymentMethods(["bkash", "nagad", "card", "manual"]);
    expect(methods.map((m) => m.id)).toEqual(["bkash", "nagad", "card", "manual"]);
    expect(methods[0]).toMatchObject({ id: "bkash", kind: "wallet" });
    expect(methods[3]).toMatchObject({ id: "manual", kind: "cod" });
  });

  it("drops unknown provider ids", () => {
    expect(availablePaymentMethods(["stripe", "spacebucks"]).map((m) => m.id)).toEqual(["stripe"]);
  });

  it("every descriptor has a label and an icon", () => {
    for (const m of availablePaymentMethods(["stripe", "klarna", "mobilepay", "bkash", "nagad", "cod", "card", "manual"])) {
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("validatePaymentSelection", () => {
  it("accepts an enabled method and rejects others", () => {
    expect(validatePaymentSelection("klarna", ["stripe", "klarna"])).toBe(true);
    expect(validatePaymentSelection("bkash", ["stripe", "klarna"])).toBe(false);
    expect(validatePaymentSelection("", ["stripe"])).toBe(false);
  });
});

describe("paymentForMethod", () => {
  it("marks instant methods paid and pay-later methods pending", () => {
    expect(paymentForMethod("stripe")).toEqual({ method: "stripe", status: "paid" });
    expect(paymentForMethod("bkash")).toEqual({ method: "bkash", status: "paid" });
    expect(paymentForMethod("cod")).toEqual({ method: "cod", status: "pending" });
    expect(paymentForMethod("manual")).toEqual({ method: "manual", status: "pending" });
  });
});

describe("buildOrderDraft with payment", () => {
  const cart: Cart = [
    { product: { id: "a", title: "Avocado", amount: 149, currency: "eur" }, qty: 2 },
  ];
  const opts = {
    method: "pickup" as const,
    slot: "10:00–11:00",
    customerName: "Aino",
    deliveryFee: { amount: 499, currency: "eur" },
  };

  it("attaches payment when a method is given", () => {
    const draft = buildOrderDraft(cart, { ...opts, paymentMethod: "manual" });
    expect(draft.payment).toEqual({ method: "manual", status: "pending" });
  });

  it("omits payment when no method is given (backward compatible)", () => {
    expect(buildOrderDraft(cart, opts).payment).toBeUndefined();
  });
});
