import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StoreHome } from "./StoreHome";
import { registry } from "@nextshop/clients";
import type { ProductCardProduct } from "@nextshop/ui";

// framer-motion works in jsdom for most interactions.
// whileInView uses IntersectionObserver; polyfill it so no warnings are thrown.
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  // Minimal stub — the observer fires the callback immediately with isIntersecting: true
  // so staggered-reveal animations behave as if the element is visible.
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
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: IntersectionObserverStub,
  });
}

const config = registry["finnish-grocer"]!;

const products: ProductCardProduct[] = [
  { id: "p1", title: "Organic Avocado", price: "€1,49", thumbnail: "🥑", tag: "Organic" },
  { id: "p2", title: "Sourdough Rye", price: "€3,20", thumbnail: "🍞" },
];

describe("StoreHome", () => {
  it("renders the brand name", () => {
    render(<StoreHome config={config} products={products} />);
    // Brand name appears in both the Header and Hero/Footer
    const headings = screen.getAllByText(/Tuore/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders a product title", () => {
    render(<StoreHome config={config} products={products} />);
    expect(screen.getByText("Organic Avocado")).toBeInTheDocument();
  });

  it("increments the cart count when an Add button is clicked", () => {
    render(<StoreHome config={config} products={products} />);

    // Initial state: Cart · 0
    expect(screen.getByText("Cart · 0")).toBeInTheDocument();

    // Click the "Add +" button for the first product
    const addButton = screen.getByRole("button", {
      name: /add organic avocado to cart/i,
    });
    fireEvent.click(addButton);

    // Count should increment to 1
    expect(screen.getByText("Cart · 1")).toBeInTheDocument();

    // Click another product's Add button
    const addButton2 = screen.getByRole("button", {
      name: /add sourdough rye to cart/i,
    });
    fireEvent.click(addButton2);

    expect(screen.getByText("Cart · 2")).toBeInTheDocument();
  });
});
