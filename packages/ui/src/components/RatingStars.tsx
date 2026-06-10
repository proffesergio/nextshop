/** Compact review rating: filled stars + count, e.g. ★★★★☆ (128). */
export function RatingStars({ rating, reviewCount, size = "0.9rem" }: { rating: number; reviewCount?: number; size?: string }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span
      aria-label={`Rated ${rating} out of 5${reviewCount ? ` by ${reviewCount} reviews` : ""}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: size, lineHeight: 1 }}
    >
      <span aria-hidden style={{ color: "#f5a623", letterSpacing: 1 }}>
        {"★".repeat(full)}
        <span style={{ opacity: 0.25 }}>{"★".repeat(5 - full)}</span>
      </span>
      <span style={{ color: "color-mix(in srgb, var(--color-foreground) 55%, transparent)", fontSize: "0.8rem" }}>
        {rating.toFixed(1)}
        {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
      </span>
    </span>
  );
}
