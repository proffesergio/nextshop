import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { StoreHome } from "./StoreHome";
import { registry } from "@nextshop/clients";
import type { Product } from "@nextshop/commerce-core";

// framer-motion's whileInView uses IntersectionObserver; stub it so items render.
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class IntersectionObserverStub {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.cb([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    unobserve() {}
    disconnect() {}
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IntersectionObserverStub });
}

const config = registry["finnish-grocer"]!;

// Isolate tests — useCart persists to localStorage, which would otherwise leak between tests.
beforeEach(() => localStorage.clear());

const products: Product[] = [
  { id: "p1", title: "Organic Avocado", amount: 149, currency: "eur", thumbnail: "🥑", tag: "Organic", category: "produce" },
  { id: "p2", title: "Sourdough Rye", amount: 320, currency: "eur", thumbnail: "🍞", category: "bakery" },
];

describe("StoreHome", () => {
  it("renders the brand name", () => {
    render(<StoreHome config={config} products={products} />);
    expect(screen.getAllByText(/Tuore/i).length).toBeGreaterThan(0);
  });

  it("renders a product with a formatted price", () => {
    render(<StoreHome config={config} products={products} />);
    expect(screen.getByText("Organic Avocado")).toBeInTheDocument();
    // 149 cents in fi locale -> contains "1,49"
    expect(screen.getByText(/1,49/)).toBeInTheDocument();
  });

  it("filters products via search", () => {
    render(<StoreHome config={config} products={products} />);
    fireEvent.change(screen.getByLabelText("Search products"), { target: { value: "sourdough" } });
    expect(screen.getByText("Sourdough Rye")).toBeInTheDocument();
    expect(screen.queryByText("Organic Avocado")).not.toBeInTheDocument();
  });

  it("adds to cart and shows the count", () => {
    render(<StoreHome config={config} products={products} />);
    expect(screen.getByText("Cart · 0")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add organic avocado to cart/i }));
    expect(screen.getByText("Cart · 1")).toBeInTheDocument();
  });

  it("opens the cart drawer and shows the subtotal", () => {
    render(<StoreHome config={config} products={products} />);
    fireEvent.click(screen.getByRole("button", { name: /add organic avocado to cart/i }));
    fireEvent.click(screen.getByText("Cart · 1"));
    const dialog = screen.getByRole("dialog", { name: /shopping cart/i });
    expect(within(dialog).getByText(/Subtotal/i)).toBeInTheDocument();
    // Price appears for the line item and the subtotal (one avocado = €1,49).
    expect(within(dialog).getAllByText(/1,49/).length).toBeGreaterThanOrEqual(1);
  });

  it("saves the cart as a shopping list (feature flag on for finnish-grocer)", () => {
    render(<StoreHome config={config} products={products} />);
    fireEvent.click(screen.getByRole("button", { name: /add organic avocado to cart/i }));
    fireEvent.click(screen.getByText("Lists · 0"));
    const dialog = screen.getByRole("dialog", { name: /shopping lists/i });
    fireEvent.change(within(dialog).getByLabelText("New list name"), { target: { value: "Weekly shop" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /save cart/i }));
    expect(within(dialog).getByText("Weekly shop")).toBeInTheDocument();
    expect(within(dialog).getByText(/1 items/)).toBeInTheDocument();
  });
});
