import { defineConfig } from "@nextshop/config";

/** Finnish grocery storefront — fresh greens → citrus, coral accent. */
export default defineConfig({
  id: "finnish-grocer",
  brand: {
    name: "Tuore",
    logo: "🥬",
    colors: {
      primary: "#15803d",
      secondary: "#84cc16",
      accent: "#fb7185",
      background: "#fbfdf7",
      foreground: "#14271b",
      muted: "#e9f3df",
    },
    gradients: {
      hero: { from: "#15803d", via: "#65a30d", to: "#facc15", angle: 130 },
      card: { from: "#f0fdf4", to: "#ffffff", angle: 160 },
      cta: { from: "#fb7185", to: "#f59e0b", angle: 115 },
    },
    font: {
      sans: '"Hanken Grotesk", system-ui, sans-serif',
      display: '"Bricolage Grotesque", "Hanken Grotesk", sans-serif',
    },
    radius: 20,
  },
  domains: {
    primary: "tuore.fi",
    aliases: ["www.tuore.fi"],
    staging: "staging.tuore.fi",
  },
  locales: { supported: ["fi", "en"], default: "fi" },
  currency: "eur",
  regions: [
    { code: "fi", name: "Finland", countries: ["FI"], currency: "eur" },
  ],
  payments: { enabledProviders: ["stripe", "klarna", "mobilepay", "manual"] },
  warehouses: [
    { id: "fi-helsinki", name: "Helsinki Cold Store", countryCode: "FI", type: "local" },
    { id: "bd-supplier", name: "Dhaka Supplier", countryCode: "BD", type: "supplier" },
  ],
  featureFlags: { pickupSlots: true, shoppingLists: true, gpsTracking: true },
});
