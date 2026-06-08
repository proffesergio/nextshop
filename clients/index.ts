import type { ClientRegistry } from "@nextshop/config";
import exampleCo from "./_example/store.config.js";
import finnishGrocer from "./finnish-grocer/store.config.js";
import freestylebd from "./freestylebd/store.config.js";
// new:client imports — do not remove this marker

/**
 * Registry of every storefront this monorepo manages, keyed by StoreConfig.id.
 * STORE_CLIENT selects which one a deployment serves. Entries below are appended
 * by `pnpm new:client <company>`; keep the marker comments intact.
 */
export const registry: ClientRegistry = {
  [exampleCo.id]: exampleCo,
  [finnishGrocer.id]: finnishGrocer,
  [freestylebd.id]: freestylebd,
  // new:client registry — do not remove this marker
};

export const clientIds = Object.keys(registry);
