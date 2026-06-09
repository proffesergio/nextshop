"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type Cart, cartSubtotal, formatPrice } from "@nextshop/commerce-core";
import { Button } from "./Button.js";
import { QuantityStepper } from "./QuantityStepper.js";

/** Slide-in cart panel with line items, quantity steppers and subtotal. */
export function CartDrawer({
  open,
  onClose,
  cart,
  locale = "en-US",
  fallbackCurrency = "eur",
  onSetQty,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  cart: Cart;
  locale?: string;
  fallbackCurrency?: string;
  onSetQty: (productId: string, qty: number) => void;
  onCheckout?: () => void;
}) {
  const subtotal = cartSubtotal(cart, fallbackCurrency);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(20,39,27,0.4)", zIndex: 100 }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="Shopping cart"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100dvh",
              width: "min(420px, 92vw)",
              background: "var(--color-background)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 101,
              display: "flex",
              flexDirection: "column",
              padding: "var(--space-5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Your cart</h2>
              <button
                onClick={onClose}
                aria-label="Close cart"
                style={{ border: "none", background: "transparent", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {cart.length === 0 && (
                <p style={{ opacity: 0.6, marginTop: "var(--space-6)", textAlign: "center" }}>
                  Your cart is empty. 🛒
                </p>
              )}
              {cart.map(({ product, qty }) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius)",
                    background: "color-mix(in srgb, var(--color-primary) 5%, transparent)",
                  }}
                >
                  <span aria-hidden style={{ fontSize: "1.8rem" }}>
                    {product.thumbnail ?? "🛒"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{product.title}</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                      {formatPrice({ amount: product.amount, currency: product.currency }, locale)}
                    </div>
                  </div>
                  <QuantityStepper qty={qty} onChange={(q) => onSetQty(product.id, q)} />
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)", paddingTop: "var(--space-4)", marginTop: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <span style={{ opacity: 0.7 }}>Subtotal</span>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
                  {formatPrice(subtotal, locale)}
                </strong>
              </div>
              <Button
                variant="primary"
                style={{ width: "100%" }}
                disabled={cart.length === 0}
                onClick={onCheckout}
              >
                Checkout
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
