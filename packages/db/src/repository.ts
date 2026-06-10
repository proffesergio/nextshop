import type { Order, OrderDraft, OrderStatus, Product } from "@nextshop/commerce-core";

/**
 * The commerce backend contract. The storefront + admin depend only on this; the
 * concrete store (in-memory or Neon/Postgres) is chosen at runtime by `getRepository()`.
 */
export interface CommerceRepository {
  // Catalog
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: Product): Promise<Product>;
  updateProduct(id: string, patch: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  createOrder(draft: OrderDraft): Promise<Order>;
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null>;
  updateOrderLocation(id: string, loc: { lat: number; lng: number }): Promise<Order | null>;
}

/** Generate an id (uuid where available, else a timestamp-based fallback). */
export function genId(prefix: string): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  const rand = g.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${rand}`;
}
