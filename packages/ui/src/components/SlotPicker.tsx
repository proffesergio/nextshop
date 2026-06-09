"use client";

import type { TimeSlot } from "@nextshop/commerce-core";

/** Grid of selectable delivery/pickup time slots. */
export function SlotPicker({
  slots,
  selected,
  onSelect,
}: {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (label: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
      {slots.map((slot) => {
        const active = selected === slot.label;
        return (
          <button
            key={slot.label}
            onClick={() => onSelect(slot.label)}
            aria-pressed={active}
            style={{
              cursor: "pointer",
              padding: "12px 10px",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              color: active ? "#fff" : "var(--color-foreground)",
              backgroundImage: active ? "var(--gradient-cta)" : "none",
              background: active ? undefined : "color-mix(in srgb, var(--color-primary) 6%, #fff)",
              border: active
                ? "1.5px solid transparent"
                : "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
            }}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
