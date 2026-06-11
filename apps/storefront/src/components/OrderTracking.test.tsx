import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Order } from "@nextshop/commerce-core";
import { OrderTracking } from "./OrderTracking";

const order: Order = {
  id: "o1",
  createdAt: "2026-06-10T09:00:00.000Z",
  status: "shipped",
  items: [{ productId: "g1", title: "Avocado", amount: 149, currency: "eur", qty: 2 }],
  total: { amount: 298, currency: "eur" },
  fulfillment: { method: "delivery", slot: "10:00–11:00" },
  customer: { name: "Aino", address: "Mannerheimintie 1" },
  courier: { lat: 60.17, lng: 24.94, updatedAt: "2026-06-10T09:30:00.000Z" },
  payment: { method: "manual", status: "pending" },
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => order }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("OrderTracking", () => {
  it("renders the journey timeline with the current step", () => {
    render(<OrderTracking initial={order} gps={false} locale="fi" />);
    expect(screen.getByRole("heading", { name: "On the way" })).toBeInTheDocument();
    expect(screen.getByLabelText("Order progress")).toBeInTheDocument();
  });

  it("shows the courier map only when GPS is enabled and a location exists", () => {
    const { unmount } = render(<OrderTracking initial={order} gps={true} locale="fi" />);
    expect(screen.getByTitle("Courier location")).toBeInTheDocument();
    unmount();
    render(<OrderTracking initial={{ ...order, courier: undefined }} gps={true} locale="fi" />);
    expect(screen.queryByTitle("Courier location")).not.toBeInTheDocument();
  });

  it("shows the payment method and its status", () => {
    render(<OrderTracking initial={order} gps={false} locale="fi" />);
    expect(screen.getByText(/Pay on delivery \/ pickup/)).toBeInTheDocument();
    expect(screen.getByText(/pay on receipt/i)).toBeInTheDocument();
    render(<OrderTracking initial={{ ...order, id: "o2", payment: { method: "bkash", status: "paid" } }} gps={false} locale="fi" />);
    expect(screen.getByText(/bKash/)).toBeInTheDocument();
    expect(screen.getByText(/paid ✓/i)).toBeInTheDocument();
  });

  it("polls the public order API every 10 seconds", async () => {
    vi.useFakeTimers();
    render(<OrderTracking initial={order} gps={false} locale="fi" />);
    expect(fetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetch).toHaveBeenCalledWith("/api/orders/o1");
  });

  it("does not poll once the order is delivered", async () => {
    vi.useFakeTimers();
    render(<OrderTracking initial={{ ...order, status: "delivered" }} gps={false} locale="fi" />);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetch).not.toHaveBeenCalled();
  });
});
