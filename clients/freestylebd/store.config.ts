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
  marketing: {
    announcement: "🧵 Eid collection drop — extra 10% off with code EID10",
    usps: [
      { icon: "🧵", title: "Export quality", text: "Same factories, factory prices" },
      { icon: "🚚", title: "Nationwide delivery", text: "Dhaka in 24h, all BD in 3 days" },
      { icon: "💸", title: "Cash on delivery", text: "Pay when it arrives" },
      { icon: "↩️", title: "7-day returns", text: "Wrong size? Easy exchange" },
    ],
    promos: [
      { icon: "🧥", title: "Winter drop", text: "Denim and knits up to 30% off.", cta: "Shop the drop", href: "#shop" },
      { icon: "👟", title: "Street essentials", text: "Sneakers, tees and chinos for every day.", cta: "Browse", href: "#shop" },
    ],
  },
});
