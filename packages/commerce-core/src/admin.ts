import type { Product } from "./types.js";

/**
 * Owner-admin domain logic: product form validation and inventory rules.
 * The admin UI and the API routes both call these, so every client storefront
 * enforces the same rules regardless of where the input came from.
 */

export type ProductValidation<V> = { ok: true; value: V } | { ok: false; errors: string[] };

const OPTIONAL_TEXT = ["thumbnail", "category", "tag", "origin"] as const;

function textOrUndefined(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function checkTitle(v: unknown, errors: string[]): string | undefined {
  if (typeof v !== "string" || v.trim() === "") {
    errors.push("Title is required");
    return undefined;
  }
  return v.trim();
}

function checkAmount(v: unknown, errors: string[]): number | undefined {
  if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
    errors.push("Amount must be a positive integer (minor units)");
    return undefined;
  }
  return v;
}

function checkCurrency(v: unknown, errors: string[]): string | undefined {
  if (typeof v !== "string" || !/^[a-zA-Z]{3}$/.test(v)) {
    errors.push("Currency must be a 3-letter code");
    return undefined;
  }
  return v.toLowerCase();
}

function checkStock(v: unknown, errors: string[]): number | undefined {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0) {
    errors.push("Stock must be a non-negative integer");
    return undefined;
  }
  return v;
}

/** Validate a complete product form (create / full edit). Returns the product minus its id. */
export function validateProductInput(input: Record<string, unknown>): ProductValidation<Omit<Product, "id">> {
  const errors: string[] = [];
  const title = checkTitle(input.title, errors);
  const amount = checkAmount(input.amount, errors);
  const currency = checkCurrency(input.currency, errors);
  const stock = input.stock === undefined || input.stock === null ? undefined : checkStock(input.stock, errors);
  if (errors.length > 0) return { ok: false, errors };
  const value: Omit<Product, "id"> = { title: title!, amount: amount!, currency: currency! };
  for (const key of OPTIONAL_TEXT) {
    const v = textOrUndefined(input[key]);
    if (v !== undefined) value[key] = v;
  }
  if (stock !== undefined) value.stock = stock;
  return { ok: true, value };
}

/** Validate a partial update — only the provided fields are checked. */
export function validateProductPatch(input: Record<string, unknown>): ProductValidation<Partial<Omit<Product, "id">>> {
  const errors: string[] = [];
  const value: Partial<Omit<Product, "id">> = {};
  if ("title" in input) {
    const t = checkTitle(input.title, errors);
    if (t !== undefined) value.title = t;
  }
  if ("amount" in input) {
    const a = checkAmount(input.amount, errors);
    if (a !== undefined) value.amount = a;
  }
  if ("currency" in input) {
    const c = checkCurrency(input.currency, errors);
    if (c !== undefined) value.currency = c;
  }
  if ("stock" in input && input.stock !== null && input.stock !== undefined) {
    const s = checkStock(input.stock, errors);
    if (s !== undefined) value.stock = s;
  }
  for (const key of OPTIONAL_TEXT) if (key in input) value[key] = textOrUndefined(input[key]);
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value };
}

/** Constant-time-ish string compare (avoids early-exit timing leaks). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Check a login attempt against the configured owner credentials. */
export function verifyOwnerCredentials(
  input: { email: string; password: string },
  expected: { email: string; password: string },
): boolean {
  if (!expected.email || !expected.password) return false;
  const emailOk = input.email.trim().toLowerCase() === expected.email.trim().toLowerCase();
  return emailOk && safeEqual(input.password, expected.password);
}

/** Default low-stock alert threshold for the admin dashboard. */
export const LOW_STOCK_THRESHOLD = 5;

/** True when stock is tracked and at/below the threshold. */
export function isLowStock(product: Product, threshold = LOW_STOCK_THRESHOLD): boolean {
  return typeof product.stock === "number" && product.stock <= threshold;
}
