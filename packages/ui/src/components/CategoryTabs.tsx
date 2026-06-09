"use client";

import { motion } from "framer-motion";

/** Pill tabs for category filtering, with an animated active background. */
export function CategoryTabs({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string | null;
  onSelect: (category: string | null) => void;
}) {
  const all = [{ key: null as string | null, label: "All" }, ...categories.map((c) => ({ key: c, label: c }))];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {all.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={label}
            onClick={() => onSelect(key)}
            style={{
              position: "relative",
              border: "none",
              cursor: "pointer",
              padding: "8px 16px",
              borderRadius: 999,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "capitalize",
              color: isActive ? "#fff" : "var(--color-foreground)",
              background: "transparent",
            }}
          >
            {isActive && (
              <motion.span
                layoutId="active-category"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  backgroundImage: "var(--gradient-cta)",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
