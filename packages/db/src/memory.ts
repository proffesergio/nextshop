import type { Order, OrderDraft, OrderStatus, Product } from "@nextshop/commerce-core";
import { genId, type CommerceRepository } from "./repository.js";

/**
 * In-memory repository. Used in dev/tests and when DATABASE_URL is unset, so the
 * storefront runs with no database. State lives for the life of the process.
 */
export class InMemoryRepository implements CommerceRepository {
  private products = new Map<string, Product>();
  private orders = new Map<string, Order>();

  constructor(seedProducts: Product[] = []) {
    for (const p of seedProducts) this.products.set(p.id, p);
  }

  async listProducts(): Promise<Product[]> {
    return [...this.products.values()];
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async createProduct(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    const existing = this.products.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, id };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async createOrder(draft: OrderDraft): Promise<Order> {
    const order: Order = { ...draft, id: genId("order"), createdAt: new Date().toISOString() };
    this.orders.set(order.id, order);
    return order;
  }

  async listOrders(): Promise<Order[]> {
    return [...this.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const existing = this.orders.get(id);
    if (!existing) return null;
    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  async updateOrderLocation(id: string, loc: { lat: number; lng: number }): Promise<Order | null> {
    const existing = this.orders.get(id);
    if (!existing) return null;
    const updated: Order = { ...existing, courier: { ...loc, updatedAt: new Date().toISOString() } };
    this.orders.set(id, updated);
    return updated;
  }
}
