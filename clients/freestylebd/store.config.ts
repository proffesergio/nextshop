import { defineConfig } from "@nextshop/config";

/**
 * FreeStyleBD — export-quality clothing, selling online in Bangladesh.
 * Proves the template is vertical-agnostic: same engine + storefront, a fashion
 * palette, BDT currency, Bangla/English, and local payment methods (bKash/Nagad/COD).
 */
export default defineConfig({
  id: "freestylebd",
  brand: {
    name: "FreeStyleBD",
    logo: "🧵",
    colors: {
      primary: "#4f46e5",
      secondary: "#0ea5e9",
      accent: "#f43f5e",
      background: "#fbfaff",
      foreground: "#1e1b2e",
      muted: "#ede9fe",
    },
    gradients: {
      hero: { from: "#4f46e5", via: "#0ea5e9", to: "#f472b6", angle: 130 },
      card: { from: "#f5f3ff", to: "#ffffff", angle: 160 },
      cta: { from: "#f43f5e", to: "#fb923c", angle: 115 },
    },
    font: {
      sans: '"Hanken Grotesk", system-ui, sans-serif',
      display: '"Bricolage Grotesque", "Hanken Grotesk", sans-serif',
    },
    radius: 14,
  },
  domains: {
    primary: "freestylebd.com",
    aliases: ["www.freestylebd.com"],
    staging: "staging.freestylebd.com",
  },
  locales: { supported: ["bn", "en"], default: "bn" },
  currency: "bdt",
  regions: [
    { code: "bd", name: "Bangladesh", countries: ["BD"], currency: "bdt" },
  ],
  payments: { enabledProviders: ["bkash", "nagad", "card", "manual"] },
  warehouses: [
    { id: "bd-dhaka", name: "Dhaka Fulfilment", countryCode: "BD", type: "local" },
  ],
  featureFlags: { pickupSlots: false, shoppingLists: true, gpsTracking: false },
});
