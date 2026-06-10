import { describe, it, expect } from "vitest";
import { defineConfig } from "../loader.js";
import { loadStoreConfig, UnknownClientError } from "../loader.js";
import { gradientToCss, brandToCssVars } from "../tokens.js";
import type { StoreConfigInput } from "../schema.js";

const valid: StoreConfigInput = {
  id: "test-co",
  brand: {
    name: "Test Co",
    logo: "/logo.svg",
    colors: {
      primary: "#16a34a",
      secondary: "#65a30d",
      accent: "#fb7185",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
    },
    gradients: {
      hero: { from: "#16a34a", via: "#84cc16", to: "#fde047", angle: 120 },
      card: { from: "#ecfccb", to: "#ffffff" },
      cta: { from: "#fb7185", to: "#f97316" },
    },
    font: { sans: "Inter, sans-serif", display: "Sora, sans-serif" },
    radius: 20,
  },
  domains: { primary: "shop.test.co", aliases: ["www.test.co"] },
  locales: { supported: ["fi", "en"], default: "fi" },
  currency: "eur",
  regions: [{ code: "eu", name: "Europe", countries: ["FI", "SE"], currency: "eur" }],
  payments: { enabledProviders: ["stripe"] },
  warehouses: [{ id: "fi-1", name: "Helsinki", countryCode: "FI", type: "local" }],
};

describe("defineConfig", () => {
  it("validates and applies feature-flag defaults", () => {
    const cfg = defineConfig(valid);
    expect(cfg.id).toBe("test-co");
    expect(cfg.featureFlags.pickupSlots).toBe(true);
    expect(cfg.featureFlags.gpsTracking).toBe(false);
  });

  it("defaults featureFlags.ownerAdmin to true", () => {
    expect(defineConfig(valid).featureFlags.ownerAdmin).toBe(true);
  });

  it("defaults marketing to empty lists and accepts custom content", () => {
    const cfg = defineConfig(valid);
    expect(cfg.marketing.usps).toEqual([]);
    expect(cfg.marketing.promos).toEqual([]);
    expect(cfg.marketing.announcement).toBeUndefined();

    const rich = defineConfig({
      ...valid,
      marketing: {
        announcement: "Free delivery over 50 €",
        usps: [{ icon: "🚚", title: "Fast", text: "Same-day slots" }],
        promos: [{ icon: "🥬", title: "Fresh week", text: "−20% greens", cta: "Shop deals", href: "#shop" }],
      },
    });
    expect(rich.marketing.usps).toHaveLength(1);
    expect(rich.marketing.promos[0]?.cta).toBe("Shop deals");
  });

  it("rejects a non-kebab-case id", () => {
    expect(() => defineConfig({ ...valid, id: "Test_Co" })).toThrow();
  });

  it("rejects a default locale not in supported", () => {
    expect(() =>
      defineConfig({ ...valid, locales: { supported: ["en"], default: "fi" } }),
    ).toThrow();
  });
});

describe("loadStoreConfig", () => {
  const registry = { "test-co": defineConfig(valid) };

  it("resolves a known client by id", () => {
    expect(loadStoreConfig(registry, "test-co").brand.name).toBe("Test Co");
  });

  it("throws UnknownClientError for an unknown client", () => {
    expect(() => loadStoreConfig(registry, "nope")).toThrow(UnknownClientError);
  });

  it("throws when no client id is provided", () => {
    expect(() => loadStoreConfig(registry, "")).toThrow(/STORE_CLIENT is not set/);
  });
});

describe("tokens", () => {
  it("serialises a 3-stop gradient with angle", () => {
    expect(gradientToCss({ from: "#a", via: "#b", to: "#c", angle: 90 })).toBe(
      "linear-gradient(90deg, #a, #b, #c)",
    );
  });

  it("defaults the angle to 135deg and drops missing via", () => {
    expect(gradientToCss({ from: "#a", to: "#c" })).toBe("linear-gradient(135deg, #a, #c)");
  });

  it("exposes brand gradients as CSS custom properties", () => {
    const vars = brandToCssVars(defineConfig(valid));
    expect(vars["--gradient-hero"]).toContain("linear-gradient(120deg");
    expect(vars["--color-primary"]).toBe("#16a34a");
    expect(vars["--radius"]).toBe("20px");
  });
});
