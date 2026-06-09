import type { Product } from "@nextshop/commerce-core";
import type { CommerceRepository } from "./repository.js";
import { InMemoryRepository } from "./memory.js";
import { NeonRepository } from "./neon.js";

function readEnv(name: string): string | undefined {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return g.process?.env?.[name];
}

let cached: CommerceRepository | null = null;

/**
 * Resolve the commerce repository for this deployment:
 * - `DATABASE_URL` set  → NeonRepository (Postgres)
 * - otherwise           → InMemoryRepository seeded with `seed` (dev/demo, no DB)
 *
 * Cached per process so the in-memory store survives across requests in dev.
 */
export function getRepository(seed: Product[] = []): CommerceRepository {
  if (cached) return cached;
  const url = readEnv("DATABASE_URL");
  cached = url ? new NeonRepository(url) : new InMemoryRepository(seed);
  return cached;
}

/** Reset the cached repository (tests). */
export function resetRepository(): void {
  cached = null;
}
