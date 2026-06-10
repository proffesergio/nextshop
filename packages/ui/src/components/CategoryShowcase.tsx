"use client";

import { motion } from "framer-motion";
import { riseItem, staggerContainer } from "../motion.js";

export interface CategoryTile {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

/** "Shop by category" — tappable gradient tiles, Alibaba-style entry points. */
export function CategoryShowcase({ categories, onSelect }: { categories: CategoryTile[]; onSelect: (id: string) => void }) {
  if (categories.length === 0) return null;
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      style={{
        display: "grid",
        gap: "var(--space-4)",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      }}
    >
      {categories.map((c) => (
        <motion.button
          key={c.id}
          type="button"
          variants={riseItem}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(c.id)}
          style={{
            cursor: "pointer",
            border: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
            backgroundImage: "var(--gradient-card)",
            borderRadius: "calc(var(--radius) * 1.2)",
            padding: "var(--space-5) var(--space-4)",
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            boxShadow: "var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06))",
          }}
          aria-label={`Shop ${c.label}`}
        >
          <span aria-hidden style={{ display: "block", fontSize: "2.4rem", marginBottom: 8 }}>
            {c.icon}
          </span>
          <span style={{ display: "block", fontWeight: 700, textTransform: "capitalize" }}>{c.label}</span>
          {typeof c.count === "number" && (
            <span style={{ fontSize: "0.8rem", color: "color-mix(in srgb, var(--color-foreground) 55%, transparent)" }}>
              {c.count} items
            </span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
