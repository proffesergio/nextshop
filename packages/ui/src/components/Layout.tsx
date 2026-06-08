import type { ReactNode } from "react";

/** Sticky frosted header with the client's brand mark. */
export function Header({ brandName, logo, nav }: { brandName: string; logo?: string; nav?: ReactNode }) {
  const isImg = logo?.startsWith("http") || logo?.startsWith("/");
  return (
    <header
      className="u-glass"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
      }}
    >
      <div
        className="u-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {isImg ? (
            <img src={logo} alt={brandName} style={{ height: 32 }} />
          ) : (
            <span aria-hidden style={{ fontSize: "1.6rem" }}>
              {logo ?? "🥬"}
            </span>
          )}
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem" }}>
            {brandName}
          </span>
        </a>
        {nav && <nav style={{ display: "flex", gap: "var(--space-5)", alignItems: "center" }}>{nav}</nav>}
      </div>
    </header>
  );
}

export function Footer({ brandName }: { brandName: string }) {
  return (
    <footer
      style={{
        marginTop: "var(--space-9)",
        padding: "var(--space-7) 0",
        borderTop: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
      }}
    >
      <div
        className="u-container"
        style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{brandName}</span>
        <span style={{ opacity: 0.6, fontSize: "0.9rem" }}>
          Built on the multi-storefront commerce template
        </span>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}
