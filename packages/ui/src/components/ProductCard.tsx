"use client";

import { motion } from "framer-motion";
import { riseItem } from "../motion.js";
import { Badge } from "./Badge.js";
import { Button } from "./Button.js";
import { RatingStars } from "./RatingStars.js";

export interface ProductCardProduct {
  id: string;
  title: string;
  /** Formatted price string, e.g. "€3,49" or "৳1,290". */
  price: string;
  /** Emoji or image URL used as the product visual (Phase 0 uses emoji). */
  thumbnail?: string;
  tag?: string;
  origin?: string;
  /** Formatted pre-discount price, shown struck through when discounted. */
  compareAtPrice?: string;
  /** Rounded % off — renders the corner deal badge when > 0. */
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  /** Urgency line, e.g. "Only 3 left". */
  stockHint?: string;
  /** Disables the add button and dims the card. */
  soldOut?: boolean;
}

/**
 * Product tile with a gradient surface, hover lift, and staggered reveal.
 * Render inside a <motion.div variants={staggerContainer} initial="hidden" animate="show">.
 */
export function ProductCard({
  product,
  onAdd,
}: {
  product: ProductCardProduct;
  onAdd?: (id: string) => void;
}) {
  const isUrl = product.thumbnail?.startsWith("http") || product.thumbnail?.startsWith("/");
  const onSale = (product.discountPercent ?? 0) > 0;
  return (
    <motion.article
      variants={riseItem}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "var(--gradient-card)",
        border: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
        borderRadius: "calc(var(--radius) * 1.3)",
        padding: "var(--space-5)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
        opacity: product.soldOut ? 0.65 : 1,
      }}
    >
      {product.tag && (
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}>
          <Badge tone="accent">{product.tag}</Badge>
        </div>
      )}
      {onSale && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1,
            background: "var(--color-accent)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.8rem",
            padding: "6px 10px",
            borderRadius: 999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
          }}
        >
          −{product.discountPercent}%
        </div>
      )}
      <a
        href={`/products/${product.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
        tabIndex={0}
      >
        <div
          aria-hidden
          style={{
            fontSize: "4.5rem",
            textAlign: "center",
            padding: "var(--space-5) 0 var(--space-4)",
            filter: "drop-shadow(0 10px 18px rgba(20,39,27,0.18))",
          }}
        >
          {isUrl ? (
            <img src={product.thumbnail} alt="" style={{ width: 96, height: 96, objectFit: "contain" }} />
          ) : (
            (product.thumbnail ?? "🛒")
          )}
        </div>
        <h3 style={{ fontSize: "1.15rem", margin: "0 0 4px" }}>{product.title}</h3>
      </a>
      {typeof product.rating === "number" && (
        <div style={{ margin: "2px 0 4px" }}>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        </div>
      )}
      {product.origin && (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-foreground) 60%, transparent)" }}>
          {product.origin}
        </p>
      )}
      {product.stockHint && (
        <p style={{ margin: "4px 0 0", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-accent)" }}>
          {product.stockHint}
        </p>
      )}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "var(--space-4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          {product.compareAtPrice && onSale && (
            <s style={{ fontSize: "0.82rem", opacity: 0.55 }}>{product.compareAtPrice}</s>
          )}
          <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
            {product.price}
          </strong>
        </span>
        <Button
          variant="primary"
          style={{ padding: "10px 16px", fontSize: "0.9rem" }}
          onClick={() => onAdd?.(product.id)}
          disabled={product.soldOut}
          aria-label={product.soldOut ? `${product.title} is out of stock` : `Add ${product.title} to cart`}
        >
          {product.soldOut ? "Sold out" : "Add +"}
        </Button>
      </div>
    </motion.article>
  );
}
