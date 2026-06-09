import { describe, it, expect } from "vitest";
import { formatPrice, addMoney } from "../money.js";

describe("formatPrice", () => {
  it("formats EUR minor units in a Finnish locale", () => {
    // 149 cents -> 1,49 €  (fi-FI uses comma + trailing symbol)
    const out = formatPrice({ amount: 149, currency: "eur" }, "fi-FI");
    expect(out).toContain("1,49");
    expect(out).toContain("€");
  });

  it("formats BDT minor units", () => {
    const out = formatPrice({ amount: 129000, currency: "bdt" }, "en-US");
    expect(out).toContain("1,290");
  });

  it("renders whole amounts with two decimals", () => {
    expect(formatPrice({ amount: 1000, currency: "eur" }, "en-US")).toContain("10.00");
  });
});

describe("addMoney", () => {
  it("sums two amounts of the same currency", () => {
    expect(addMoney({ amount: 149, currency: "eur" }, { amount: 51, currency: "eur" })).toEqual({
      amount: 200,
      currency: "eur",
    });
  });

  it("throws on mismatched currencies", () => {
    expect(() => addMoney({ amount: 1, currency: "eur" }, { amount: 1, currency: "bdt" })).toThrow(
      /currenc/i,
    );
  });
});
