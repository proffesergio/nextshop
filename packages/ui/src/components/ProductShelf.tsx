import type { ReactNode } from "react";

/**
 * Horizontal merchandising rail (Amazon-style shelf): title row + scroll-snap
 * track. Children are typically ProductCards in fixed-width slots.
 */
export function ProductShelf({
  title,
  subtitle,
  action,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ margin: "var(--space-7) 0" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>{title}</h2>
        {subtitle && (
          <span style={{ fontSize: "0.9rem", color: "color-mix(in srgb, var(--color-foreground) 55%, transparent)" }}>
            {subtitle}
          </span>
        )}
        {action && <span style={{ marginLeft: "auto" }}>{action}</span>}
      </div>
      <div
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "min(72vw, 250px)",
          gap: "var(--space-4)",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 10,
        }}
      >
        {children}
      </div>
    </section>
  );
}
