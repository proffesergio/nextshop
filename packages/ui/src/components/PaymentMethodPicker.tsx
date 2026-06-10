"use client";

import type { PaymentMethod } from "@nextshop/commerce-core";

/** Radio-card picker for the client's enabled payment methods. */
export function PaymentMethodPicker({
  methods,
  selected,
  onSelect,
}: {
  methods: PaymentMethod[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (methods.length === 0) return null;
  return (
    <div
      role="radiogroup"
      aria-label="Payment method"
      style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}
    >
      {methods.map((m) => {
        const active = selected === m.id;
        return (
          <label
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              border: active
                ? "2px solid var(--color-primary)"
                : "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
              background: active
                ? "color-mix(in srgb, var(--color-primary) 8%, var(--color-background))"
                : "var(--color-background)",
              boxShadow: active ? "var(--shadow-md)" : "none",
              fontWeight: active ? 700 : 500,
            }}
          >
            <input
              type="radio"
              name="payment-method"
              value={m.id}
              checked={active}
              onChange={() => onSelect(m.id)}
              style={{ accentColor: "var(--color-primary)" }}
            />
            <span aria-hidden style={{ fontSize: "1.4rem" }}>
              {m.icon}
            </span>
            <span>{m.label}</span>
          </label>
        );
      })}
    </div>
  );
}
