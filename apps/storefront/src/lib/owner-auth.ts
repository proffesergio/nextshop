import { verifyOwnerCredentials } from "@nextshop/commerce-core";

/**
 * Owner credentials come from env (ADMIN_EMAIL / ADMIN_PASSWORD), set per client
 * deployment. Outside production a dev fallback keeps local demos one-click.
 * Kept free of next-auth imports so it is unit-testable.
 */
function ownerCredentialsFromEnv(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) return { email, password };
  if (process.env.NODE_ENV !== "production") return { email: "owner@nextshop.dev", password: "nextshop-dev" };
  return null;
}

/** Credentials → session user, or null. */
export function authorizeOwner(
  credentials: Partial<Record<string, unknown>>,
): { id: string; email: string; name: string } | null {
  const expected = ownerCredentialsFromEnv();
  if (!expected) return null;
  const email = typeof credentials?.email === "string" ? credentials.email : "";
  const password = typeof credentials?.password === "string" ? credentials.password : "";
  if (!verifyOwnerCredentials({ email, password }, expected)) return null;
  return { id: "owner", email: expected.email, name: "Store owner" };
}
