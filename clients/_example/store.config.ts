import { defineConfig } from "@nextshop/config";

/**
 * BASE CLONE — copy this directory to clients/<your-company> via
 * `pnpm new:client <your-company>` and edit the values below.
 * See docs/PLAYBOOK.md ("New-client onboarding").
 */
export default defineConfig({
  id: "example-co",
  brand: {
    name: "Example Co",
    logo: "🛍️",
    colors: {
      primary: "#16a34a",
      secondary: "#65a30d",
      accent: "#fb7185",
      background: "#fbfdf7",
      foreground: "#14271b",
      muted: "#eef4e6",
    },
    gradients: {
      hero: { from: "#16a34a", via: "#84cc16", to: "#fde047", angle: 135 },
      card: { from: "#ecfccb", to: "#ffffff", angle: 160 },
      cta: { from: "#fb7185", to: "#f97316", angle: 120 },
    },
    font: {
      sans: '"Hanken Grotesk", system-ui, sans-serif',
      display: '"Bricolage Grotesque", "Hanken Grotesk", sans-serif',
    },
    radius: 18,
  },
  domains: {
    primary: "shop.example.com",
    aliases: [],
    staging: "staging.example.com",
  },
  locales: { supported: ["en"], default: "en" },
  currency: "eur",
  regions: [{ code: "eu", name: "Europe", countries: ["FI"], currency: "eur" }],
  payments: { enabledProviders: ["stripe", "manual"] },
  warehouses: [{ id: "wh-local", name: "Local Warehouse", countryCode: "FI", type: "local" }],
  featureFlags: { pickupSlots: true, shoppingLists: true },
});
