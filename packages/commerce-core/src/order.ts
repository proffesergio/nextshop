import { orderTotal, type FulfillmentMethod } from "./checkout.js";
import type { Cart, Money, OrderDraft } from "./types.js";

/**
 * Build an order draft from a cart + checkout details. Snapshots each line so the
 * order keeps the title/price as they were at purchase. The repository assigns the
 * id + createdAt when it persists the draft.
 */
export function buildOrderDraft(
  cart: Cart,
  opts: {
    method: FulfillmentMethod;
    slot: string;
    customerName: string;
    address?: string;
    deliveryFee: Money;
  },
): OrderDraft {
  return {
    items: cart.map((line) => ({
      productId: line.product.id,
      title: line.product.title,
      amount: line.product.amount,
      currency: line.product.currency,
      qty: line.qty,
    })),
    total: orderTotal(cart, { method: opts.method, deliveryFee: opts.deliveryFee }),
    fulfillment: { method: opts.method, slot: opts.slot },
    customer: { name: opts.customerName, ...(opts.address ? { address: opts.address } : {}) },
    status: "pending",
  };
}
