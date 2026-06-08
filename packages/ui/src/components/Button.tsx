"use client";

import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import { press } from "../motion.js";

type Variant = "primary" | "ghost" | "outline";

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: "1rem",
  padding: "14px 26px",
  borderRadius: "calc(var(--radius) * 1.4)",
  color: "var(--color-foreground)",
};

const variants: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundImage: "var(--gradient-cta)",
    color: "#fff",
    boxShadow: "var(--shadow-glow)",
  },
  outline: {
    background: "transparent",
    border: "2px solid color-mix(in srgb, var(--color-primary) 35%, transparent)",
  },
  ghost: {
    background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  },
};

export interface ButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  variant?: Variant;
}

export function Button({ variant = "primary", style, children, ...props }: ButtonProps) {
  return (
    <motion.button
      {...press}
      style={{ ...base, ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
