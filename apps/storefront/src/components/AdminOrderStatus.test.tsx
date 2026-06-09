import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminOrderStatus } from "./AdminOrderStatus";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

beforeEach(() => {
  refresh.mockClear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
});

describe("AdminOrderStatus", () => {
  it("offers only legal next statuses for a pending order", () => {
    render(<AdminOrderStatus orderId="o1" status="pending" />);
    const options = screen
      .getAllByRole("option")
      .map((o) => o.textContent)
      .filter((t) => t !== "move to…");
    expect(options).toEqual(["packing", "cancelled"]);
  });

  it("renders terminal statuses as plain text", () => {
    render(<AdminOrderStatus orderId="o1" status="delivered" />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("delivered")).toBeInTheDocument();
  });

  it("PATCHes the chosen status and refreshes", async () => {
    render(<AdminOrderStatus orderId="o1" status="pending" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "packing" } });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/admin/orders/o1", expect.objectContaining({ method: "PATCH" })),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
