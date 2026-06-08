import { loadStoreConfig, type StoreConfig } from "@nextshop/config";
import { registry } from "@nextshop/clients";

/**
 * Resolve the active store for this deployment from STORE_CLIENT.
 * Falls back to "finnish-grocer" in local dev when the env var is unset.
 */
export function getStoreConfig(): StoreConfig {
  const clientId = process.env.STORE_CLIENT ?? "finnish-grocer";
  return loadStoreConfig(registry, clientId);
}
