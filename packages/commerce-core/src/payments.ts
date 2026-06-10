import type { OrderPayment } from "./types.js";

/**
 * Provider-agnostic payment layer. The storefront only ever deals in these
 * descriptors; real gateway SDKs (Stripe, bKash…) plug in behind the same ids
 * later without touching checkout code. Which methods a client offers is
 * driven by `StoreConfig.payments.enabledProviders`.
 */

export type PaymentKind = "card" | "wallet" | "bnpl" | "cod";

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  kind: PaymentKind;
}

/** Catalog of providers the template knows how to render (and later, charge). */
export const PAYMENT_PROVIDERS: Record<string, PaymentMethod> = {
  stripe: { id: "stripe", label: "Card (Visa / Mastercard)", icon: "💳", kind: "card" },
  card: { id: "card", label: "Debit / credit card", icon: "💳", kind: "card" },
  klarna: { id: "klarna", label: "Klarna — pay later", icon: "🛍️", kind: "bnpl" },
  mobilepay: { id: "mobilepay", label: "MobilePay", icon: "📱", kind: "wallet" },
  bkash: { id: "bkash", label: "bKash", icon: "📱", kind: "wallet" },
  nagad: { id: "nagad", label: "Nagad", icon: "📱", kind: "wallet" },
  cod: { id: "cod", label: "Cash on delivery", icon: "💵", kind: "cod" },
  manual: { id: "manual", label: "Pay on delivery / pickup", icon: "💵", kind: "cod" },
};

/** Resolve a client's enabled provider ids to descriptors (unknown ids dropped). */
export function availablePaymentMethods(enabledProviders: string[]): PaymentMethod[] {
  return enabledProviders
    .map((id) => PAYMENT_PROVIDERS[id])
    .filter((m): m is PaymentMethod => Boolean(m));
}

/** A selection is valid only if it is one of the client's enabled methods. */
export function validatePaymentSelection(methodId: string, enabledProviders: string[]): boolean {
  return methodId !== "" && enabledProviders.includes(methodId) && methodId in PAYMENT_PROVIDERS;
}

/**
 * Initial payment record for an order paid with `methodId`. Instant methods are
 * captured at checkout (sandbox/demo behaviour until real gateways are wired);
 * cash-like methods stay pending until the owner marks them paid.
 */
export function paymentForMethod(methodId: string): OrderPayment {
  const kind = PAYMENT_PROVIDERS[methodId]?.kind;
  return { method: methodId, status: kind === "cod" ? "pending" : "paid" };
}
