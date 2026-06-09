"use client";

/** Controlled search input with the fresh-gradient focus ring. */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search products…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      <span
        aria-hidden
        style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}
      >
        🔍
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        style={{
          width: "100%",
          padding: "12px 16px 12px 44px",
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          color: "var(--color-foreground)",
          background: "color-mix(in srgb, var(--color-primary) 6%, #fff)",
          border: "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
          borderRadius: 999,
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-glow)")}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      />
    </div>
  );
}
