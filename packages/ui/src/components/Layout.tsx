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
  const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8, minWidth: 140 };
  const link: React.CSSProperties = { textDecoration: "none", color: "inherit", opacity: 0.7, fontSize: "0.92rem" };
  const head: React.CSSProperties = { fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.55 };
  return (
    <footer
      style={{
        marginTop: "var(--space-9)",
        padding: "var(--space-8) 0 var(--space-6)",
        borderTop: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
        background: "color-mix(in srgb, var(--color-primary) 4%, var(--color-background))",
      }}
    >
      <div
        className="u-container"
        style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-7)" }}
      >
        <div style={{ ...col, maxWidth: 280 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem" }}>{brandName}</span>
          <span style={{ opacity: 0.65, fontSize: "0.92rem" }}>
            Fresh products, fair prices, delivered to your door with live tracking.
          </span>
          <span aria-label="Accepted payment methods" style={{ fontSize: "1.3rem", marginTop: 6 }}>
            💳 🏦 📱
          </span>
        </div>
        <nav style={col} aria-label="Shop links">
          <span style={head}>Shop</span>
          <a href="/" style={link}>All products</a>
          <a href="/#shop" style={link}>Deals</a>
          <a href="/checkout" style={link}>Checkout</a>
        </nav>
        <nav style={col} aria-label="Help links">
          <span style={head}>Help</span>
          <a href="/#shop" style={link}>Delivery & pickup</a>
          <a href="/#shop" style={link}>Track your order</a>
          <a href="/#shop" style={link}>Contact us</a>
        </nav>
      </div>
      <div
        className="u-container"
        style={{
          marginTop: "var(--space-6)",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid color-mix(in srgb, var(--color-foreground) 8%, transparent)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          fontSize: "0.85rem",
          opacity: 0.55,
        }}
      >
        <span>© {new Date().getFullYear()} {brandName}. All rights reserved.</span>
        <span>Built on the multi-storefront commerce template</span>
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
