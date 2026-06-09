import type { Money } from "./types.js";

/** Format a Money value for display, e.g. {149,"eur"} -> "1,49 €" (fi-FI). */
export function formatPrice(money: Money, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency.toUpperCase(),
  }).format(money.amount / 100);
}

/** Add two Money values; both must share a currency. */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add money of different currencies: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}
