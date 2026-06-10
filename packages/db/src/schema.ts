import { doublePrecision, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { OrderItem } from "@nextshop/commerce-core";

/** Catalog. Prices are integer minor units (matches commerce-core Money). */
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  thumbnail: text("thumbnail"),
  category: text("category"),
  tag: text("tag"),
  origin: text("origin"),
  stock: integer("stock"),
});

/** Orders. Line items are stored as JSON (frozen snapshot at purchase). */
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull(),
  totalAmount: integer("total_amount").notNull(),
  totalCurrency: text("total_currency").notNull(),
  method: text("method").notNull(),
  slot: text("slot").notNull(),
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status"),
  courierLat: doublePrecision("courier_lat"),
  courierLng: doublePrecision("courier_lng"),
  courierUpdatedAt: timestamp("courier_updated_at", { withTimezone: true }),
});
