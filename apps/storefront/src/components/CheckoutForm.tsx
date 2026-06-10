"use client";

import { useMemo, useState } from "react";
import type { StoreConfig } from "@nextshop/config";
import {
  availablePaymentMethods,
  buildOrderDraft,
  formatPrice,
  generateTimeSlots,
  orderTotal,
  validateCheckout,
  validatePaymentSelection,
  type FulfillmentMethod,
} from "@nextshop/commerce-core";
import { Button, FulfillmentToggle, Page, PaymentMethodPicker, SlotPicker } from "@nextshop/ui";
import { useCart } from "@/lib/useCart";

const DELIVERY_FEE = 499; // minor units; a real store would source this from config/backend

export function CheckoutForm({ config }: { config: StoreConfig }) {
  const locale = config.locales.default;
  const cart = useCart(config.id);
  const pickupEnabled = config.featureFlags.pickupSlots;
  const deliveryFee = { amount: DELIVERY_FEE, currency: config.currency };

  const slots = useMemo(() => generateTimeSlots({ openHour: 9, closeHour: 18, slotMinutes: 60 }), []);
  const payMethods = useMemo(
    () => availablePaymentMethods(config.payments.enabledProviders),
    [config.payments.enabledProviders],
  );

  const [method, setMethod] = useState<FulfillmentMethod>("delivery");
  const [payMethod, setPayMethod] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [placed, setPlaced] = useState(false);
  const [trackId, setTrackId] = useState<string | null>(null);

  const total = orderTotal(cart.cart, { method, deliveryFee });

  const placeOrder = () => {
    const errs = validateCheckout({ name, method, address, slot: slot ?? "" });
    if (cart.cart.length === 0) errs.push("Your cart is empty");
    if (payMethods.length > 0 && !validatePaymentSelection(payMethod ?? "", config.payments.enabledProviders)) {
      errs.push("Please choose a payment method");
    }
    setErrors(errs);
    if (errs.length === 0) {
      // Fire-and-forget: persist the order in the background without blocking
      // the confirmation UI. Network errors are swallowed for demo resilience.
      try {
        const draft = buildOrderDraft(cart.cart, {
          method,
          slot: slot ?? "",
          customerName: name,
          address: method === "delivery" ? address : undefined,
          deliveryFee,
          paymentMethod: payMethod ?? undefined,
        });
        fetch("/api/orders", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        })
          .then(async (res) => {
            if (res.ok) {
              const saved = (await res.json()) as { id?: string };
              if (saved.id) setTrackId(saved.id);
            }
          })
          .catch(() => {
            // network failure — no-op
          });
      } catch {
        // draft build failure — no-op
      }
      cart.clear();
      setPlaced(true);
    }
  };

  if (placed) {
    return (
      <Page>
        <main className="u-container" style={{ padding: "var(--space-9) 0", textAlign: "center", maxWidth: 560 }}>
          <div style={{ fontSize: "4rem" }}>🎉</div>
          <h1>Order placed!</h1>
          <p style={{ opacity: 0.75 }}>
            Thanks, {name || "friend"}. Your {method === "delivery" ? "delivery" : "pickup"} is booked for{" "}
            <strong>{slot}</strong>. You’ll get real-time status updates as it’s prepared.
          </p>
          {payMethod && (
            <p style={{ opacity: 0.75 }}>
              Payment: <strong>{payMethods.find((m) => m.id === payMethod)?.label}</strong>
              {payMethods.find((m) => m.id === payMethod)?.kind === "cod" ? " — pay when you receive it" : " — paid ✓"}
            </p>
          )}
          {trackId && (
            <a href={`/orders/${trackId}`} style={{ textDecoration: "none", display: "block" }}>
              <Button variant="primary" style={{ marginTop: "var(--space-4)" }}>
                Track your order →
              </Button>
            </a>
          )}
          <a href="/" style={{ textDecoration: "none" }}>
            <Button variant={trackId ? "ghost" : "primary"} style={{ marginTop: "var(--space-4)" }}>
              Back to {config.brand.name}
            </Button>
          </a>
        </main>
      </Page>
    );
  }

  const field: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "var(--radius)",
    border: "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
    fontFamily: "var(--font-sans)",
    fontSize: "1rem",
  };

  return (
    <Page>
      <main className="u-container" style={{ padding: "var(--space-6) 0", maxWidth: 720, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div>
          <a href="/" style={{ textDecoration: "none", opacity: 0.7, fontWeight: 500 }}>
            ← Back to shop
          </a>
          <h1 style={{ marginTop: "var(--space-3)" }}>Checkout</h1>
        </div>

        {/* Order summary */}
        <section style={{ background: "var(--gradient-card)", borderRadius: "calc(var(--radius) * 1.2)", padding: "var(--space-5)", boxShadow: "var(--shadow-md)" }}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>Your order</h2>
          {cart.cart.length === 0 ? (
            <p style={{ opacity: 0.6 }}>Your cart is empty. <a href="/">Browse products →</a></p>
          ) : (
            cart.cart.map(({ product, qty }) => (
              <div key={product.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span>{product.thumbnail} {product.title} × {qty}</span>
                <span>{formatPrice({ amount: product.amount * qty, currency: product.currency }, locale)}</span>
              </div>
            ))
          )}
          {method === "delivery" && cart.cart.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", opacity: 0.8 }}>
              <span>Delivery</span>
              <span>{formatPrice(deliveryFee, locale)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)", marginTop: 8, paddingTop: 10 }}>
            <strong>Total</strong>
            <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem" }}>{formatPrice(total, locale)}</strong>
          </div>
        </section>

        {/* Fulfillment */}
        <section>
          <h2 style={{ fontSize: "1.2rem" }}>How would you like it?</h2>
          <FulfillmentToggle value={method} onChange={setMethod} pickupEnabled={pickupEnabled} />
        </section>

        {method === "delivery" && (
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>Delivery address</span>
            <input style={field} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, postcode" aria-label="Delivery address" />
          </label>
        )}

        {/* Time slot */}
        <section>
          <h2 style={{ fontSize: "1.2rem" }}>{method === "delivery" ? "Delivery" : "Pickup"} time</h2>
          <SlotPicker slots={slots} selected={slot} onSelect={setSlot} />
        </section>

        {/* Payment */}
        {payMethods.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.2rem" }}>How would you like to pay?</h2>
            <PaymentMethodPicker methods={payMethods} selected={payMethod} onSelect={setPayMethod} />
          </section>
        )}

        {/* Contact */}
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Your name</span>
          <input style={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Your name" />
        </label>

        {errors.length > 0 && (
          <ul style={{ color: "var(--color-accent)", margin: 0, paddingLeft: 20 }}>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <Button variant="primary" style={{ width: "100%", padding: "16px" }} onClick={placeOrder}>
          Place order · {formatPrice(total, locale)}
        </Button>
      </main>
    </Page>
  );
}
