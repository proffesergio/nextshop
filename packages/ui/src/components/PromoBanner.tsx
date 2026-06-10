"use client";

import { motion } from "framer-motion";
import { riseItem } from "../motion.js";
import { Button } from "./Button.js";

/** Seasonal/campaign banner tile driven by StoreConfig marketing.promos. */
export function PromoBanner({
  icon,
  title,
  text,
  cta,
  href,
}: {
  icon?: string;
  title: string;
  text: string;
  cta: string;
  href: string;
}) {
  return (
    <motion.div
      variants={riseItem}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundImage: "var(--gradient-hero)",
        color: "#fff",
        borderRadius: "calc(var(--radius) * 1.4)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 180,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(14rem 14rem at 90% 10%, rgba(255,255,255,0.3), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {icon && (
        <span aria-hidden style={{ fontSize: "2.2rem", lineHeight: 1 }}>
          {icon}
        </span>
      )}
      <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", position: "relative" }}>{title}</strong>
      <span style={{ opacity: 0.92, position: "relative" }}>{text}</span>
      <a href={href} style={{ textDecoration: "none", marginTop: "auto", position: "relative" }}>
        <Button variant="primary" style={{ background: "#fff", color: "var(--color-primary)" }}>
          {cta}
        </Button>
      </a>
    </motion.div>
  );
}
