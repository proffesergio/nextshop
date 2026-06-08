import type { ReactNode } from "react";

/** Small pill used for tags like "Organic", "Export quality", "Bangladesh". */
export function Badge({ children, tone = "fresh" }: { children: ReactNode; tone?: "fresh" | "accent" }) {
  const bg =
    tone === "accent"
      ? "color-mix(in srgb, var(--color-accent) 18%, transparent)"
      : "color-mix(in srgb, var(--color-primary) 14%, transparent)";
  const fg = tone === "accent" ? "var(--color-accent)" : "var(--color-primary)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: bg,
        color: fg,
        fontWeight: 600,
        fontSize: "0.78rem",
        padding: "5px 12px",
        borderRadius: 999,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}
