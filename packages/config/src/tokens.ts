import type { Gradient, StoreConfig } from "./schema.js";

/** Serialise a Gradient into a CSS linear-gradient() string. */
export function gradientToCss(g: Gradient): string {
  const angle = g.angle ?? 135;
  const stops = [g.from, g.via, g.to].filter(Boolean).join(", ");
  return `linear-gradient(${angle}deg, ${stops})`;
}

/**
 * Flatten a StoreConfig's brand tokens into CSS custom properties. The storefront
 * injects these on :root so all components (in @nextshop/ui) read live client colours.
 */
export function brandToCssVars(config: StoreConfig): Record<string, string> {
  const { colors, gradients, font, radius } = config.brand;
  return {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-accent": colors.accent,
    "--color-background": colors.background,
    "--color-foreground": colors.foreground,
    "--color-muted": colors.muted,
    "--gradient-hero": gradientToCss(gradients.hero),
    "--gradient-card": gradientToCss(gradients.card),
    "--gradient-cta": gradientToCss(gradients.cta),
    "--font-sans": font.sans,
    "--font-display": font.display,
    "--radius": `${radius}px`,
  };
}

/** Render brand CSS vars as an inline style string for SSR injection. */
export function brandToCssString(config: StoreConfig): string {
  return Object.entries(brandToCssVars(config))
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");
}
