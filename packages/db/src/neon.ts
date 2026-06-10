import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import type { Order, OrderDraft, OrderStatus, Product } from "@nextshop/commerce-core";
import { genId, type CommerceRepository } from "./repository.js";
import { orders, products } from "./schema.js";

type OrderRow = typeof orders.$inferSelect;
type ProductRow = typeof products.$inferSelect;

/** Map a DB row (nullable columns) to a Product (optional fields). */
function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    title: r.title,
    amount: r.amount,
    currency: r.currency,
    ...(r.thumbnail ? { thumbnail: r.thumbnail } : {}),
    ...(r.category ? { category: r.category } : {}),
    ...(r.tag ? { tag: r.tag } : {}),
    ...(r.origin ? { origin: r.origin } : {}),
    ...(r.stock != null ? { stock: r.stock } : {}),
  };
}

function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    status: r.status as OrderStatus,
    total: { amount: r.totalAmount, currency: r.totalCurrency },
    fulfillment: { method: r.method as "delivery" | "pickup", slot: r.slot },
    customer: { name: r.customerName, ...(r.customerAddress ? { address: r.customerAddress } : {}) },
    items: r.items,
    ...(r.courierLat != null && r.courierLng != null
      ? {
          courier: {
            lat: r.courierLat,
            lng: r.courierLng,
            updatedAt:
              r.courierUpdatedAt instanceof Date ? r.courierUpdatedAt.toISOString() : String(r.courierUpdatedAt ?? ""),
          },
        }
      : {}),
  };
}

/** Postgres-backed repository (Neon serverless + Drizzle). Used when DATABASE_URL is set. */
export class NeonRepository implements CommerceRepository {
  private db: NeonHttpDatabase;

  constructor(databaseUrl: string) {
    this.db = drizzle(neon(databaseUrl));
  }

  async listProducts(): Promise<Product[]> {
    const rows = await this.db.select().from(products);
    return rows.map(rowToProduct);
  }

  async getProduct(id: string): Promise<Product | null> {
    const [row] = await this.db.select().from(products).where(eq(products.id, id));
    return row ? rowToProduct(row) : null;
  }

  async createProduct(product: Product): Promise<Product> {
    await this.db.insert(products).values(product).onConflictDoUpdate({ target: products.id, set: product });
    return product;
  }

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    const [row] = await this.db.update(products).set(patch).where(eq(products.id, id)).returning();
    return row ? rowToProduct(row) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const rows = await this.db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    return rows.length > 0;
  }

  async createOrder(draft: OrderDraft): Promise<Order> {
    const order: Order = { ...draft, id: genId("order"), createdAt: new Date().toISOString() };
    await this.db.insert(orders).values({
      id: order.id,
      status: order.status,
      totalAmount: order.total.amount,
      totalCurrency: order.total.currency,
      method: order.fulfillment.method,
      slot: order.fulfillment.slot,
      customerName: order.customer.name,
      customerAddress: order.customer.address ?? null,
      items: order.items,
    });
    return order;
  }

  async listOrders(): Promise<Order[]> {
    const rows = await this.db.select().from(orders);
    return rows.map(rowToOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getOrder(id: string): Promise<Order | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, id));
    return row ? rowToOrder(row) : null;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const [row] = await this.db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return row ? rowToOrder(row) : null;
  }

  async updateOrderLocation(id: string, loc: { lat: number; lng: number }): Promise<Order | null> {
    const [row] = await this.db
      .update(orders)
      .set({ courierLat: loc.lat, courierLng: loc.lng, courierUpdatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return row ? rowToOrder(row) : null;
  }
}
