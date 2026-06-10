import type { ReactNode } from "react";

/** Slim gradient announcement bar above the header (free-shipping offers etc.). */
export function AnnouncementBar({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      style={{
        backgroundImage: "var(--gradient-cta)",
        color: "#fff",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "0.85rem",
        padding: "8px 16px",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </div>
  );
}
