import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminProductForm } from "./AdminProductForm";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

beforeEach(() => {
  push.mockClear();
  refresh.mockClear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
});

describe("AdminProductForm", () => {
  it("shows validation errors instead of submitting", async () => {
    render(<AdminProductForm />);
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("POSTs a new product and navigates back to the list", async () => {
    render(<AdminProductForm />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Rye" } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: "320" } });
    fireEvent.change(screen.getByLabelText("Currency"), { target: { value: "eur" } });
    fireEvent.change(screen.getByLabelText(/Stock/), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/admin/products");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toMatchObject({ title: "Rye", amount: 320, currency: "eur", stock: 12 });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
  });

  it("PATCHes when editing an existing product", async () => {
    render(<AdminProductForm initial={{ id: "g1", title: "Avocado", amount: 149, currency: "eur" }} />);
    fireEvent.change(screen.getByLabelText(/Stock/), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/admin/products/g1");
    expect(init?.method).toBe("PATCH");
  });
});
