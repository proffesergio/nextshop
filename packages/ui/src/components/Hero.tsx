"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { heroReveal, staggerContainer } from "../motion.js";

/**
 * Full-bleed gradient hero with a soft mesh atmosphere and staggered reveal.
 * eyebrow / title / subtitle / actions are all optional slots.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "calc(var(--radius) * 2)",
        margin: "var(--space-5) 0",
        padding: "clamp(2.5rem, 6vw, 5.5rem)",
        backgroundImage: "var(--gradient-hero)",
        color: "#fff",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* floating gradient orbs for depth */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(20rem 20rem at 85% 15%, rgba(255,255,255,0.35), transparent 60%), radial-gradient(16rem 16rem at 10% 90%, rgba(255,255,255,0.18), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{ position: "relative", maxWidth: 720 }}
      >
        {eyebrow && (
          <motion.div
            variants={heroReveal}
            style={{
              display: "inline-flex",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(6px)",
              padding: "6px 14px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: "0.85rem",
              marginBottom: "var(--space-4)",
            }}
          >
            {eyebrow}
          </motion.div>
        )}
        <motion.h1 variants={heroReveal} style={{ color: "#fff", textShadow: "0 4px 30px rgba(0,0,0,0.18)" }}>
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={heroReveal}
            style={{ fontSize: "clamp(1.05rem, 2vw, 1.3rem)", maxWidth: 560, opacity: 0.95 }}
          >
            {subtitle}
          </motion.p>
        )}
        {actions && (
          <motion.div
            variants={heroReveal}
            style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", marginTop: "var(--space-5)" }}
          >
            {actions}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
