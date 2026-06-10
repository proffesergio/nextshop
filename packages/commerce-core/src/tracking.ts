import type { OrderStatus } from "./types.js";

/** The happy-path fulfilment flow shown on the tracking timeline. */
export const ORDER_FLOW: OrderStatus[] = ["pending", "packing", "shipped", "delivered"];

export interface TimelineStep {
  status: OrderStatus;
  state: "done" | "current" | "upcoming";
}

/** Derive the tracking timeline for an order status. */
export function orderTimeline(status: OrderStatus): TimelineStep[] {
  if (status === "cancelled") {
    return [
      { status: "pending", state: "done" },
      { status: "cancelled", state: "current" },
    ];
  }
  const idx = ORDER_FLOW.indexOf(status);
  return ORDER_FLOW.map((s, i) => ({
    status: s,
    state: i < idx ? "done" : i === idx ? "current" : "upcoming",
  }));
}

/** 0..1 progress along the flow (drives the animated timeline spine). */
export function trackingProgress(status: OrderStatus): number {
  if (status === "cancelled") return 1;
  return ORDER_FLOW.indexOf(status) / (ORDER_FLOW.length - 1);
}

/** Validate courier GPS coordinates. */
export function isValidCoordinates(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
}
