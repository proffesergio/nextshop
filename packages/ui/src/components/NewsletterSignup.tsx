"use client";

import { useState } from "react";
import { Button } from "./Button.js";

/** Email capture band. Visual-only by default; pass onSubmit to wire a backend. */
export function NewsletterSignup({
  title = "Get deals before everyone else",
  text = "Weekly offers and seasonal picks — straight to your inbox.",
  onSubmit,
}: {
  title?: string;
  text?: string;
  onSubmit?: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section
      style={{
        backgroundImage: "var(--gradient-card)",
        border: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
        borderRadius: "calc(var(--radius) * 1.4)",
        padding: "var(--space-6)",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>{title}</h2>
      <p style={{ margin: "8px auto var(--space-5)", maxWidth: 460, opacity: 0.7 }}>{text}</p>
      {done ? (
        <p role="status" style={{ fontWeight: 700, color: "var(--color-primary)", margin: 0 }}>
          🎉 You're on the list!
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) return;
            onSubmit?.(email);
            setDone(true);
          }}
          style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              border: "1.5px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
              fontFamily: "var(--font-sans)",
              minWidth: 240,
            }}
          />
          <Button variant="primary" type="submit">
            Subscribe
          </Button>
        </form>
      )}
    </section>
  );
}
