import { describe, it, expect } from "vitest";
import { validateProductInput, validateProductPatch, isLowStock, verifyOwnerCredentials } from "../admin.js";

describe("validateProductInput", () => {
  it("accepts a full valid product and normalizes it", () => {
    const r = validateProductInput({
      title: "  Mango  ",
      amount: 450,
      currency: "EUR",
      thumbnail: "🥭",
      category: "produce",
      tag: "",
      origin: "BD",
      stock: 0,
    });
    expect(r).toEqual({
      ok: true,
      value: { title: "Mango", amount: 450, currency: "eur", thumbnail: "🥭", category: "produce", origin: "BD", stock: 0 },
    });
  });

  it("collects errors for missing/invalid fields", () => {
    const r = validateProductInput({ title: " ", amount: -5, currency: "euro", stock: 1.5 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toContain("Title is required");
      expect(r.errors).toContain("Amount must be a positive integer (minor units)");
      expect(r.errors).toContain("Currency must be a 3-letter code");
      expect(r.errors).toContain("Stock must be a non-negative integer");
    }
  });

  it("rejects a string amount", () => {
    const r = validateProductInput({ title: "X", amount: "450", currency: "eur" });
    expect(r.ok).toBe(false);
  });
});

describe("validateProductPatch", () => {
  it("validates only provided fields", () => {
    const r = validateProductPatch({ stock: 7 });
    expect(r).toEqual({ ok: true, value: { stock: 7 } });
  });

  it("rejects invalid provided fields", () => {
    const r = validateProductPatch({ amount: 0 });
    expect(r.ok).toBe(false);
  });
});

describe("verifyOwnerCredentials", () => {
  const expected = { email: "owner@shop.fi", password: "s3cret" };

  it("accepts matching credentials (email case/space-insensitive)", () => {
    expect(verifyOwnerCredentials({ email: " Owner@Shop.fi ", password: "s3cret" }, expected)).toBe(true);
  });

  it("rejects a wrong password or email", () => {
    expect(verifyOwnerCredentials({ email: "owner@shop.fi", password: "nope" }, expected)).toBe(false);
    expect(verifyOwnerCredentials({ email: "x@shop.fi", password: "s3cret" }, expected)).toBe(false);
  });

  it("rejects empty expected credentials", () => {
    expect(verifyOwnerCredentials({ email: "", password: "" }, { email: "", password: "" })).toBe(false);
  });
});

describe("isLowStock", () => {
  it("flags tracked stock at or below the threshold", () => {
    expect(isLowStock({ id: "a", title: "A", amount: 1, currency: "eur", stock: 3 })).toBe(true);
    expect(isLowStock({ id: "a", title: "A", amount: 1, currency: "eur", stock: 9 })).toBe(false);
    expect(isLowStock({ id: "a", title: "A", amount: 1, currency: "eur" })).toBe(false);
  });
});
