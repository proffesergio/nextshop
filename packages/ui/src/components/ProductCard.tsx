"use client";

import { motion } from "framer-motion";
import { riseItem } from "../motion.js";
import { Badge } from "./Badge.js";
import { Button } from "./Button.js";

export interface ProductCardProduct {
  id: string;
  title: string;
  /** Formatted price string, e.g. "€3,49" or "৳1,290". */
  price: string;
  /** Emoji or image URL used as the product visual (Phase 0 uses emoji). */
  thumbnail?: string;
  tag?: string;
  origin?: string;
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
      }}
    >
      {product.tag && (
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <Badge tone="accent">{product.tag}</Badge>
        </div>
      )}
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
      {product.origin && (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-foreground) 60%, transparent)" }}>
          {product.origin}
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
        <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
          {product.price}
        </strong>
        <Button
          variant="primary"
          style={{ padding: "10px 16px", fontSize: "0.9rem" }}
          onClick={() => onAdd?.(product.id)}
          aria-label={`Add ${product.title} to cart`}
        >
          Add +
        </Button>
      </div>
    </motion.article>
  );
}
