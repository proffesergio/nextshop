# Phase 3 — Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Checkbox steps.

**Goal:** Region-driven payment selection at checkout (Stripe/Klarna/MobilePay for FI · bKash/Nagad/card/COD for BD), persisted on the order, surfaced in tracking + admin (with mark-as-paid for pay-later methods). Provider-agnostic: a typed catalog + selection/validation layer in commerce-core so real gateway SDKs plug in later without touching storefront code.

**Architecture:** `commerce-core/payments.ts` (catalog of known providers, `availablePaymentMethods(enabledProviders)`, `validatePaymentSelection`, `paymentForMethod` → initial status: instant methods are `paid` in demo/sandbox, COD/manual are `pending`). `Order.payment { method, status }` persisted via new db columns. ui `PaymentMethodPicker` (radio cards). CheckoutForm adds the payment step. Admin orders show payment + a "Mark paid" action via `PATCH /api/admin/orders/[id]/payment`.

**Features (each TDD: failing test → impl → green → commit):**

- [ ] **F1 commerce-core payments**: provider catalog (stripe, card, klarna, mobilepay, bkash, nagad, cod, manual), `availablePaymentMethods`, `validatePaymentSelection`, `paymentForMethod`; `OrderDraft.payment?`; `buildOrderDraft` accepts `paymentMethod`.
- [ ] **F2 db persistence**: orders `payment_method`/`payment_status` columns, memory+neon mapping, `updateOrderPayment(id, status)` for mark-as-paid.
- [ ] **F3 checkout**: ui `PaymentMethodPicker`; CheckoutForm payment section (methods from `config.payments.enabledProviders`), validation error when none chosen, payment in the draft; confirmation shows method.
- [ ] **F4 tracking + admin**: OrderTracking shows payment line; admin orders table shows method/status + Mark paid (API + button, owner-only, 409 if already paid).
- [ ] **F5 ship**: gates, both builds, changeset, ROADMAP Phase 3 ✅, CONTEXT, rebuild live demo, push, graph memory.
