"use client";

import { motion } from "framer-motion";
import type { FulfillmentMethod } from "@nextshop/commerce-core";

/** Delivery / store-pickup segmented control. Pickup is hidden when not offered. */
export function FulfillmentToggle({
  value,
  onChange,
  pickupEnabled = true,
}: {
  value: FulfillmentMethod;
  onChange: (m: FulfillmentMethod) => void;
  pickupEnabled?: boolean;
}) {
  const options: { key: FulfillmentMethod; label: string; icon: string }[] = [
    { key: "delivery", label: "Delivery", icon: "🚚" },
    ...(pickupEnabled ? [{ key: "pickup" as const, label: "Store pickup", icon: "🏬" }] : []),
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Fulfillment method"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
      }}
    >
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.key)}
            style={{
              position: "relative",
              border: "none",
              cursor: "pointer",
              padding: "10px 18px",
              borderRadius: 999,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: active ? "#fff" : "var(--color-foreground)",
              background: "transparent",
            }}
          >
            {active && (
              <motion.span
                layoutId="active-fulfillment"
                style={{ position: "absolute", inset: 0, borderRadius: 999, backgroundImage: "var(--gradient-cta)", zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {o.icon} {o.label}
          </button>
        );
      })}
    </div>
  );
}
