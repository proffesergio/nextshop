import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminCourierLocation } from "./AdminCourierLocation";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

beforeEach(() => {
  refresh.mockClear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
});

describe("AdminCourierLocation", () => {
  it("PATCHes lat/lng to the location API and refreshes", async () => {
    render(<AdminCourierLocation orderId="o1" />);
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "60.17" } });
    fireEvent.change(screen.getByLabelText("Longitude"), { target: { value: "24.94" } });
    fireEvent.click(screen.getByRole("button", { name: /set gps/i }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/admin/orders/o1/location", expect.objectContaining({ method: "PATCH" })),
    );
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toEqual({ lat: 60.17, lng: 24.94 });
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("does not submit invalid coordinates", () => {
    render(<AdminCourierLocation orderId="o1" />);
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "91" } });
    fireEvent.change(screen.getByLabelText("Longitude"), { target: { value: "24.94" } });
    fireEvent.click(screen.getByRole("button", { name: /set gps/i }));
    expect(fetch).not.toHaveBeenCalled();
  });
});
