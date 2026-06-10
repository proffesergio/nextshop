import { orderTotal, type FulfillmentMethod } from "./checkout.js";
import { paymentForMethod } from "./payments.js";
import type { Cart, Money, OrderDraft, OrderStatus } from "./types.js";

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
    /** Payment provider id; when set the draft carries its initial payment record. */
    paymentMethod?: string;
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
    ...(opts.paymentMethod ? { payment: paymentForMethod(opts.paymentMethod) } : {}),
  };
}

/** Allowed status moves. The owner admin and Phase 2 tracking share this map. */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["packing", "cancelled"],
  packing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

/** Statuses an order may move to next from `status`. */
export function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[status] ?? [];
}

/** Whether moving an order from `from` to `to` is a legal transition. */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return nextOrderStatuses(from).includes(to);
}
