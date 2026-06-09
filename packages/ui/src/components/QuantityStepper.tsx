"use client";

/** Compact −/qty/+ control used in the cart. */
export function QuantityStepper({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (qty: number) => void;
}) {
  const btn: React.CSSProperties = {
    border: "none",
    cursor: "pointer",
    width: 28,
    height: 28,
    borderRadius: 8,
    fontSize: "1.1rem",
    lineHeight: 1,
    background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
    color: "var(--color-primary)",
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button style={btn} onClick={() => onChange(qty - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span style={{ minWidth: 20, textAlign: "center", fontWeight: 600 }} aria-live="polite">
        {qty}
      </span>
      <button style={btn} onClick={() => onChange(qty + 1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
