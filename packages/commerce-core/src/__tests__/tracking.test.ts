import { describe, it, expect } from "vitest";
import { orderTimeline, trackingProgress, isValidCoordinates } from "../tracking.js";

describe("orderTimeline", () => {
  it("marks done/current/upcoming around the active status", () => {
    expect(orderTimeline("shipped")).toEqual([
      { status: "pending", state: "done" },
      { status: "packing", state: "done" },
      { status: "shipped", state: "current" },
      { status: "delivered", state: "upcoming" },
    ]);
  });

  it("delivered completes every step", () => {
    expect(
      orderTimeline("delivered").every((s, i, a) => (i < a.length - 1 ? s.state === "done" : s.state === "current")),
    ).toBe(true);
  });

  it("cancelled collapses to received → cancelled", () => {
    expect(orderTimeline("cancelled")).toEqual([
      { status: "pending", state: "done" },
      { status: "cancelled", state: "current" },
    ]);
  });
});

describe("trackingProgress", () => {
  it("maps the flow onto 0..1", () => {
    expect(trackingProgress("pending")).toBe(0);
    expect(trackingProgress("packing")).toBeCloseTo(1 / 3);
    expect(trackingProgress("delivered")).toBe(1);
    expect(trackingProgress("cancelled")).toBe(1);
  });
});

describe("isValidCoordinates", () => {
  it("accepts real lat/lng and rejects out-of-range or non-numbers", () => {
    expect(isValidCoordinates(60.17, 24.94)).toBe(true);
    expect(isValidCoordinates(91, 0)).toBe(false);
    expect(isValidCoordinates(0, 181)).toBe(false);
    expect(isValidCoordinates(Number.NaN, 0)).toBe(false);
  });
});
