import { z } from "zod";

/**
 * StoreConfig is the single source of truth for everything that differs between
 * one company's storefront and another. A new client = a new StoreConfig object;
 * the application code never changes. See docs/PLAYBOOK.md ("New-client onboarding").
 */

/** A linear/mesh gradient described by its colour stops, themeable per client. */
const gradientSchema = z.object({
  from: z.string(),
  via: z.string().optional(),
  to: z.string(),
  /** Angle in degrees for linear gradients. Omit for the UI default (135deg). */
  angle: z.number().min(0).max(360).optional(),
});
export type Gradient = z.infer<typeof gradientSchema>;

/**
 * Brand tokens. These flow into the design system as CSS custom properties, so
 * the vibrant gradient palette is fully client-driven (no code edits to re-skin).
 */
const brandSchema = z.object({
  /** Public-facing store name. */
  name: z.string().min(1),
  /** Path (relative to the storefront's /public) or URL to the logo. */
  logo: z.string().min(1),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    foreground: z.string(),
    muted: z.string(),
  }),
  /** Eye-catching, soothing gradients for hero, cards, and call-to-action surfaces. */
  gradients: z.object({
    hero: gradientSchema,
    card: gradientSchema,
    cta: gradientSchema,
  }),
  font: z.object({
    /** Body font family stack. */
    sans: z.string(),
    /** Display/heading font family stack (bold, rounded for the fresh-grocery feel). */
    display: z.string(),
  }),
  /** Base corner radius in px; scales the rounded look. */
  radius: z.number().int().min(0).default(16),
});
export type Brand = z.infer<typeof brandSchema>;

const domainsSchema = z.object({
  /** Production primary domain, e.g. "shop.company.com". */
  primary: z.string().min(1),
  /** Additional production hostnames that should resolve to this store. */
  aliases: z.array(z.string()).default([]),
  /** Staging/preview hostname. */
  staging: z.string().optional(),
});
export type Domains = z.infer<typeof domainsSchema>;

const regionSchema = z.object({
  /** Region code, e.g. "eu". */
  code: z.string().min(1),
  name: z.string().min(1),
  /** ISO 3166-1 alpha-2 country codes covered by this region. */
  countries: z.array(z.string().length(2)).min(1),
  /** ISO 4217 currency for the region, e.g. "eur". */
  currency: z.string().length(3),
});

const warehouseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  countryCode: z.string().length(2),
  /** "local" = in-region fulfilment; "supplier" = overseas source (e.g. Bangladesh). */
  type: z.enum(["local", "supplier"]),
});

/** Known feature flags. Modules read these to enable/disable whole capabilities. */
const featureFlagsSchema = z.object({
  /** Live GPS tracking on the order-status page (Phase 2). */
  gpsTracking: z.boolean().default(false),
  /** B2B PEPPOL e-invoicing (Phase 4). */
  b2bEInvoicing: z.boolean().default(false),
  /** Store-pickup time slots at checkout (Phase 1). */
  pickupSlots: z.boolean().default(true),
  /** Saved/reusable shopping lists (Phase 1). */
  shoppingLists: z.boolean().default(true),
  /** Owner admin panel at /admin (product/order/inventory CRUD). */
  ownerAdmin: z.boolean().default(true),
});
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

export const storeConfigSchema = z.object({
  /** Unique client slug; matches the clients/<id> directory and STORE_CLIENT env. */
  id: z.string().regex(/^[a-z0-9-]+$/, "id must be lowercase kebab-case"),
  brand: brandSchema,
  domains: domainsSchema,
  locales: z
    .object({
      supported: z.array(z.string()).min(1),
      default: z.string(),
    })
    .refine((l) => l.supported.includes(l.default), {
      message: "locales.default must be one of locales.supported",
    }),
  /** ISO 4217 default storefront currency, e.g. "eur". */
  currency: z.string().length(3),
  regions: z.array(regionSchema).min(1),
  payments: z.object({
    /** Provider ids enabled for this client, e.g. ["stripe", "klarna", "mobilepay"]. */
    enabledProviders: z.array(z.string()).min(1),
  }),
  warehouses: z.array(warehouseSchema).min(1),
  featureFlags: featureFlagsSchema.default({}),
});

export type StoreConfig = z.infer<typeof storeConfigSchema>;

/** Raw (pre-defaults) input shape accepted by defineConfig. */
export type StoreConfigInput = z.input<typeof storeConfigSchema>;
