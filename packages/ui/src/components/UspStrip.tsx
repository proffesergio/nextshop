"use client";

import { motion } from "framer-motion";
import { riseItem, staggerContainer } from "../motion.js";

export interface UspItem {
  icon: string;
  title: string;
  text: string;
}

/** Trust strip under the hero: delivery promise, freshness, payments, returns… */
export function UspStrip({ items }: { items: UspItem[] }) {
  if (items.length === 0) return null;
  return (
    <motion.ul
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gap: "var(--space-4)",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      }}
    >
      {items.map((u) => (
        <motion.li
          key={u.title}
          variants={riseItem}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            background: "color-mix(in srgb, var(--color-primary) 6%, var(--color-background))",
            border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
            borderRadius: "var(--radius)",
            padding: "14px 16px",
          }}
        >
          <span aria-hidden style={{ fontSize: "1.6rem", lineHeight: 1 }}>
            {u.icon}
          </span>
          <span>
            <strong style={{ display: "block", fontSize: "0.95rem" }}>{u.title}</strong>
            <span style={{ fontSize: "0.85rem", color: "color-mix(in srgb, var(--color-foreground) 60%, transparent)" }}>
              {u.text}
            </span>
          </span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
