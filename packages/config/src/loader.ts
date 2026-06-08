import { storeConfigSchema, type StoreConfig, type StoreConfigInput } from "./schema.js";

/**
 * Validate and normalise a client's config. Each clients/<id>/store.config.ts
 * calls this so invalid configs fail fast (at build, not at runtime in prod).
 */
export function defineConfig(input: StoreConfigInput): StoreConfig {
  return storeConfigSchema.parse(input);
}

/**
 * A registry maps client id -> its validated StoreConfig. The clients barrel
 * (clients/index.ts) builds one of these from static imports so bundlers can
 * tree-shake and the active store is selectable purely via the STORE_CLIENT env.
 */
export type ClientRegistry = Record<string, StoreConfig>;

/** Read an env var without depending on Node's ambient `process` types. */
function readEnv(name: string): string | undefined {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return g.process?.env?.[name];
}

export class UnknownClientError extends Error {
  constructor(id: string, known: string[]) {
    super(
      `Unknown STORE_CLIENT "${id}". Known clients: ${known.join(", ") || "(none registered)"}`,
    );
    this.name = "UnknownClientError";
  }
}

/**
 * Resolve the active store config from a registry.
 *
 * @param registry  client id -> StoreConfig (from the clients barrel)
 * @param clientId  defaults to process.env.STORE_CLIENT
 */
export function loadStoreConfig(
  registry: ClientRegistry,
  clientId: string | undefined = readEnv("STORE_CLIENT"),
): StoreConfig {
  const id = clientId?.trim();
  if (!id) {
    throw new Error(
      "STORE_CLIENT is not set. Set it to a client id (see clients/) to select a store.",
    );
  }
  const config = registry[id];
  if (!config) {
    throw new UnknownClientError(id, Object.keys(registry));
  }
  return config;
}
