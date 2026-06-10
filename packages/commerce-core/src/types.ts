/** Money in ISO-4217 minor units (e.g. cents). */
export interface Money {
  /** Integer amount in minor units. */
  amount: number;
  /** Lowercase ISO-4217 code, e.g. "eur", "bdt". */
  currency: string;
}

/** A sellable product (storefront-facing, engine-agnostic). */
export interface Product {
  id: string;
  title: string;
  /** Unit price in minor units. */
  amount: number;
  currency: string;
  thumbnail?: string;
  category?: string;
  tag?: string;
  origin?: string;
  /** Units on hand. Omitted = inventory not tracked for this product. */
  stock?: number;
}

/** A line in the cart: a product and its quantity. */
export interface CartLine {
  product: Product;
  qty: number;
}

export type Cart = CartLine[];

/** A reference to a product + desired quantity, stored in a saved list. */
export interface ListItem {
  productId: string;
  qty: number;
}

/** A saved/reusable shopping list (e.g. "Weekly shop"). */
export interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
}

/** Lifecycle of an order (also used by Phase 2 real-time tracking). */
export type OrderStatus = "pending" | "packing" | "shipped" | "delivered" | "cancelled";

/** A purchased line — product details are frozen at purchase time. */
export interface OrderItem {
  productId: string;
  title: string;
  amount: number;
  currency: string;
  qty: number;
}

/** An order before it is persisted (no id / timestamp yet). */
export interface OrderDraft {
  items: OrderItem[];
  total: Money;
  fulfillment: { method: "delivery" | "pickup"; slot: string };
  customer: { name: string; address?: string };
  status: OrderStatus;
}

/** Live courier position (Phase 2 GPS tracking). */
export interface CourierLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

/** A persisted order. */
export interface Order extends OrderDraft {
  id: string;
  createdAt: string;
  courier?: CourierLocation;
}
