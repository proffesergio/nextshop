"use client";

import { useState } from "react";
import type { StoreConfig } from "@nextshop/config";
import { discountPercent, formatPrice, type Product } from "@nextshop/commerce-core";
import { Badge, Button, Footer, Header, Page, ProductShelf, ProductCard, QuantityStepper, RatingStars } from "@nextshop/ui";
import { useCart } from "@/lib/useCart";

export function ProductDetail({
  config,
  product,
  related = [],
}: {
  config: StoreConfig;
  product: Product;
  related?: Product[];
}) {
  const locale = config.locales.default;
  const cart = useCart(config.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isUrl = product.thumbnail?.startsWith("http") || product.thumbnail?.startsWith("/");
  const price = formatPrice({ amount: product.amount, currency: product.currency }, locale);
  const pct = discountPercent(product);

  const handleAdd = () => {
    cart.add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <Page>
      <Header
        brandName={config.brand.name}
        logo={config.brand.logo}
        nav={
          <>
            <a href="#" onClick={() => history.back()} style={{ textDecoration: "none", fontWeight: 500 }}>
              Shop
            </a>
            <Button variant="ghost" style={{ padding: "10px 18px" }} onClick={() => {}}>
              Cart · {cart.count}
            </Button>
          </>
        }
      />

      <main className="u-container" style={{ paddingTop: "var(--space-7)", paddingBottom: "var(--space-9)", flex: 1 }}>
        {/* Back link */}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            color: "var(--color-primary)",
            fontWeight: 500,
            fontSize: "0.95rem",
            marginBottom: "var(--space-6)",
          }}
        >
          ← Back to shop
        </a>

        {/* Product card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-8)",
            alignItems: "start",
          }}
        >
          {/* Visual */}
          <div
            style={{
              backgroundImage: "var(--gradient-card)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
              borderRadius: "calc(var(--radius) * 1.5)",
              padding: "var(--space-8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 280,
              boxShadow: "var(--shadow-md)",
            }}
          >
            {isUrl ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                style={{ width: "100%", maxWidth: 220, height: 220, objectFit: "contain" }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  fontSize: "8rem",
                  filter: "drop-shadow(0 16px 28px rgba(20,39,27,0.18))",
                  lineHeight: 1,
                }}
              >
                {product.thumbnail ?? "🛒"}
              </span>
            )}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {/* Badges */}
            {(product.tag || product.origin) && (
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                {product.tag && <Badge tone="accent">{product.tag}</Badge>}
                {product.origin && <Badge tone="fresh">{product.origin}</Badge>}
              </div>
            )}

            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                lineHeight: 1.2,
              }}
            >
              {product.title}
            </h1>

            {typeof product.rating === "number" && (
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="1.05rem" />
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <strong
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  background: "var(--gradient-cta)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {price}
              </strong>
              {pct > 0 && product.compareAtAmount && (
                <>
                  <s style={{ opacity: 0.5, fontSize: "1.1rem" }}>
                    {formatPrice({ amount: product.compareAtAmount, currency: product.currency }, locale)}
                  </s>
                  <span
                    style={{
                      background: "var(--color-accent)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    −{pct}%
                  </span>
                </>
              )}
            </div>

            {typeof product.stock === "number" && product.stock <= 5 && (
              <p style={{ margin: 0, fontWeight: 700, color: "var(--color-accent)" }}>
                {product.stock === 0 ? "Out of stock" : `Only ${product.stock} left`}
              </p>
            )}

            {/* Qty + Add */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap", marginTop: "var(--space-2)" }}>
              <QuantityStepper qty={qty} onChange={(v) => setQty(Math.max(1, v))} />
              <Button
                variant="primary"
                style={{ padding: "12px 28px", fontSize: "1rem" }}
                onClick={handleAdd}
                aria-label={`Add ${product.title} to cart`}
              >
                Add to cart
              </Button>
              {added && (
                <span
                  role="status"
                  aria-live="polite"
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Added ✓
                </span>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <ProductShelf ariaLabel="You may also like" title="You may also like">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  title: p.title,
                  price: formatPrice({ amount: p.amount, currency: p.currency }, locale),
                  thumbnail: p.thumbnail,
                  tag: p.tag,
                  rating: p.rating,
                  reviewCount: p.reviewCount,
                }}
                onAdd={(id) => {
                  const item = related.find((r) => r.id === id);
                  if (item) cart.add(item);
                }}
              />
            ))}
          </ProductShelf>
        )}
      </main>

      <Footer brandName={config.brand.name} />
    </Page>
  );
}
