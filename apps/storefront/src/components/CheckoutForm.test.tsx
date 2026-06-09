import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { CheckoutForm } from "./CheckoutForm";
import { registry } from "@nextshop/clients";

const config = registry["finnish-grocer"]!; // pickupSlots enabled

// Seed a cart in localStorage (CheckoutForm reads it via useCart).
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    `nextshop:cart:${config.id}`,
    JSON.stringify([{ product: { id: "a", title: "Avocado", amount: 149, currency: "eur", thumbnail: "🥑" }, qty: 2 }]),
  );
});

describe("CheckoutForm", () => {
  it("shows the order with a delivery total (subtotal + fee)", () => {
    render(<CheckoutForm config={config} />);
    // 149*2 = 298 + 499 delivery = 797 -> "7,97"
    expect(screen.getByText(/Place order/)).toHaveTextContent(/7,97/);
  });

  it("validates required fields before placing the order", () => {
    render(<CheckoutForm config={config} />);
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Please choose a time slot")).toBeInTheDocument();
    expect(screen.getByText("Delivery address is required")).toBeInTheDocument();
  });

  it("places a valid delivery order and shows confirmation", () => {
    render(<CheckoutForm config={config} />);
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Aino" } });
    fireEvent.change(screen.getByLabelText("Delivery address"), { target: { value: "Mannerheimintie 1" } });
    fireEvent.click(screen.getByRole("button", { name: "09:00–10:00" }));
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(screen.getByText("Order placed!")).toBeInTheDocument();
    expect(screen.getByText(/09:00–10:00/)).toBeInTheDocument();
  });

  it("drops the address requirement for store pickup", () => {
    render(<CheckoutForm config={config} />);
    fireEvent.click(screen.getByRole("radio", { name: /store pickup/i }));
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Aino" } });
    fireEvent.click(screen.getByRole("button", { name: "10:00–11:00" }));
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(screen.getByText("Order placed!")).toBeInTheDocument();
  });
});
