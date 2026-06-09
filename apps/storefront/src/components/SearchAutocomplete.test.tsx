import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as NextNavigation from "next/navigation";
import { StoreHome } from "./StoreHome";
import { registry } from "@nextshop/clients";
import type { Product } from "@nextshop/commerce-core";

// framer-motion's whileInView needs IntersectionObserver
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class IntersectionObserverStub {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.cb(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    unobserve() {}
    disconnect() {}
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: IntersectionObserverStub,
  });
}

const config = registry["finnish-grocer"]!;

beforeEach(() => localStorage.clear());

const products: Product[] = [
  { id: "p1", title: "Organic Avocado", amount: 149, currency: "eur", thumbnail: "🥑", tag: "Organic", category: "produce" },
  { id: "p2", title: "Sourdough Rye", amount: 320, currency: "eur", thumbnail: "🍞", category: "bakery" },
  { id: "p3", title: "Alphonso Mango", amount: 450, currency: "eur", thumbnail: "🥭", tag: "Bangladesh", category: "produce" },
];

describe("SearchAutocomplete (via StoreHome)", () => {
  it("shows suggestions when typing a matching query", () => {
    render(<StoreHome config={config} products={products} />);
    const input = screen.getByLabelText("Search products");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "or" } });
    // aria-expanded reflects the open state
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("shows no suggestions for empty query", () => {
    render(<StoreHome config={config} products={products} />);
    const input = screen.getByLabelText("Search products");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("navigates to product page on Enter when a suggestion is active", () => {
    const pushMock = vi.fn();
    vi.spyOn(NextNavigation, "useRouter").mockReturnValue({
      push: pushMock,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });

    render(<StoreHome config={config} products={products} />);
    const input = screen.getByLabelText("Search products");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "mango" } });
    // ArrowDown to highlight the first (and only) suggestion
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(pushMock).toHaveBeenCalledWith("/products/p3");
  });

  it("still filters the product grid while typing (existing behaviour preserved)", () => {
    render(<StoreHome config={config} products={products} />);
    const input = screen.getByLabelText("Search products");
    fireEvent.change(input, { target: { value: "sourdough" } });
    expect(screen.getByText("Sourdough Rye")).toBeInTheDocument();
    expect(screen.queryByText("Organic Avocado")).not.toBeInTheDocument();
  });

  it("closes dropdown on Escape", () => {
    render(<StoreHome config={config} products={products} />);
    const input = screen.getByLabelText("Search products");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "avocado" } });
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
