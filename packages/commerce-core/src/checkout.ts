import { cartSubtotal } from "./cart.js";
import { addMoney } from "./money.js";
import type { Cart, Money } from "./types.js";

export type FulfillmentMethod = "delivery" | "pickup";

export interface TimeSlot {
  /** "HH:MM" start. */
  start: string;
  /** "HH:MM" end. */
  end: string;
  /** Display label, e.g. "09:00–10:00". */
  label: string;
}

const hhmm = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Split an opening window into back-to-back delivery/pickup slots. */
export function generateTimeSlots(opts: {
  openHour: number;
  closeHour: number;
  slotMinutes: number;
}): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const open = opts.openHour * 60;
  const close = opts.closeHour * 60;
  for (let t = open; t + opts.slotMinutes <= close; t += opts.slotMinutes) {
    const start = hhmm(t);
    const end = hhmm(t + opts.slotMinutes);
    slots.push({ start, end, label: `${start}–${end}` });
  }
  return slots;
}

/** Order total = cart subtotal, plus the delivery fee when the method is delivery. */
export function orderTotal(
  cart: Cart,
  opts: { method: FulfillmentMethod; deliveryFee: Money },
): Money {
  const subtotal = cartSubtotal(cart, opts.deliveryFee.currency);
  return opts.method === "delivery" ? addMoney(subtotal, opts.deliveryFee) : subtotal;
}

export interface CheckoutInput {
  name: string;
  method: FulfillmentMethod;
  address?: string;
  slot?: string;
}

/** Validate a checkout form; returns a list of human-readable errors ([] = valid). */
export function validateCheckout(input: CheckoutInput): string[] {
  const errors: string[] = [];
  if (!input.name?.trim()) errors.push("Name is required");
  if (input.method === "delivery" && !input.address?.trim()) {
    errors.push("Delivery address is required");
  }
  if (!input.slot?.trim()) errors.push("Please choose a time slot");
  return errors;
}
