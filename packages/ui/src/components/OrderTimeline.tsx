"use client";

import { motion } from "framer-motion";
import type { OrderStatus, TimelineStep } from "@nextshop/commerce-core";
import { riseItem, staggerContainer } from "../motion.js";

/**
 * "Living delivery journey" — a vertical timeline whose gradient spine grows to
 * the current step, with a pulsing live halo on the active node. All colours
 * come from the client's brand CSS variables, so every storefront re-skins it.
 */

interface StepMeta {
  icon: string;
  label: string;
  hint: string;
}

const DEFAULT_META: Record<OrderStatus, StepMeta> = {
  pending: { icon: "🧺", label: "Order received", hint: "We've got your order" },
  packing: { icon: "📦", label: "Packing", hint: "Picked fresh and packed with care" },
  shipped: { icon: "🚚", label: "On the way", hint: "Your order is moving" },
  delivered: { icon: "🎉", label: "Delivered", hint: "Enjoy!" },
  cancelled: { icon: "✕", label: "Cancelled", hint: "This order was cancelled" },
};

const NODE = 44; // px diameter of a step node

export function OrderTimeline({
  steps,
  progress,
  labels,
}: {
  steps: TimelineStep[];
  /** 0..1 — how far along the flow the order is (drives the spine fill). */
  progress: number;
  /** Optional per-status label overrides (e.g. localisation). */
  labels?: Partial<Record<OrderStatus, string>>;
}) {
  const cancelled = steps.some((s) => s.status === "cancelled");

  return (
    <motion.ol
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      aria-label="Order progress"
      style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}
    >
      {/* spine track */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: NODE / 2 - 2,
          top: NODE / 2,
          bottom: NODE / 2,
          width: 4,
          borderRadius: 2,
          background: "color-mix(in srgb, var(--color-foreground) 10%, transparent)",
        }}
      />
      {/* growing gradient fill */}
      <motion.span
        aria-hidden
        initial={{ scaleY: 0 }}
        animate={{ scaleY: progress }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{
          position: "absolute",
          left: NODE / 2 - 2,
          top: NODE / 2,
          bottom: NODE / 2,
          width: 4,
          borderRadius: 2,
          transformOrigin: "top",
          backgroundImage: cancelled
            ? "linear-gradient(180deg, var(--color-accent), var(--color-accent))"
            : "var(--gradient-cta)",
        }}
      />
      {steps.map((step) => {
        const meta = DEFAULT_META[step.status];
        const label = labels?.[step.status] ?? meta.label;
        const isCurrent = step.state === "current";
        const isDone = step.state === "done";
        const accent = step.status === "cancelled";
        return (
          <motion.li
            key={step.status}
            variants={riseItem}
            aria-current={isCurrent ? "step" : undefined}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-4)",
              padding: "var(--space-3) 0",
              position: "relative",
            }}
          >
            <span style={{ position: "relative", flexShrink: 0, width: NODE, height: NODE }}>
              {isCurrent && (
                <motion.span
                  aria-hidden
                  animate={{ scale: [1, 1.7], opacity: [0.55, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: accent ? "var(--color-accent)" : "var(--color-primary)",
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  display: "grid",
                  placeItems: "center",
                  width: NODE,
                  height: NODE,
                  borderRadius: "50%",
                  fontSize: "1.25rem",
                  backgroundImage:
                    isDone || isCurrent
                      ? accent
                        ? "linear-gradient(135deg, var(--color-accent), var(--color-accent))"
                        : "var(--gradient-cta)"
                      : "none",
                  background:
                    isDone || isCurrent
                      ? undefined
                      : "color-mix(in srgb, var(--color-foreground) 6%, var(--color-background))",
                  border:
                    isDone || isCurrent
                      ? "none"
                      : "2px dashed color-mix(in srgb, var(--color-foreground) 25%, transparent)",
                  boxShadow: isCurrent ? "var(--shadow-md)" : "none",
                  filter: step.state === "upcoming" ? "grayscale(1) opacity(0.55)" : "none",
                }}
              >
                {meta.icon}
              </span>
            </span>
            <span style={{ paddingTop: 4 }}>
              <span
                style={{
                  display: "block",
                  fontFamily: isCurrent ? "var(--font-display)" : "var(--font-sans)",
                  fontWeight: isCurrent ? 700 : 600,
                  fontSize: isCurrent ? "1.2rem" : "1rem",
                  color: accent && isCurrent ? "var(--color-accent)" : "var(--color-foreground)",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "color-mix(in srgb, var(--color-foreground) 55%, transparent)",
                }}
              >
                {isCurrent ? meta.hint : isDone ? "Done" : ""}
              </span>
            </span>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
