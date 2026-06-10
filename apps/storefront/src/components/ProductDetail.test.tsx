import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ProductDetail } from "./ProductDetail";
import { registry } from "@nextshop/clients";
import type { Product } from "@nextshop/commerce-core";

const config = registry["finnish-grocer"]!;

const avocado: Product = {
  id: "g1",
  title: "Organic Avocado",
  amount: 149,
  currency: "eur",
  thumbnail: "🥑",
  tag: "Organic",
  category: "produce",
};

// Isolate cart state between tests
beforeEach(() => localStorage.clear());

describe("ProductDetail", () => {
  it("renders the product title", () => {
    render(<ProductDetail config={config} product={avocado} />);
    expect(screen.getByRole("heading", { name: /Organic Avocado/i })).toBeInTheDocument();
  });

  it("renders the formatted price", () => {
    render(<ProductDetail config={config} product={avocado} />);
    // 149 cents EUR in fi locale = 1,49
    expect(screen.getByText(/1,49/)).toBeInTheDocument();
  });

  it("renders the tag badge", () => {
    render(<ProductDetail config={config} product={avocado} />);
    expect(screen.getByText("Organic")).toBeInTheDocument();
  });

  it("adds to cart and shows 'Added ✓' confirmation", async () => {
    render(<ProductDetail config={config} product={avocado} />);
    const addBtn = screen.getByRole("button", { name: /add organic avocado to cart/i });
    fireEvent.click(addBtn);
    expect(screen.getByRole("status")).toHaveTextContent("Added ✓");
  });

  it("increments qty and adds correct count to cart", () => {
    render(<ProductDetail config={config} product={avocado} />);
    // Increase qty from 1 to 3
    fireEvent.click(screen.getByRole("button", { name: /increase quantity/i }));
    fireEvent.click(screen.getByRole("button", { name: /increase quantity/i }));
    expect(screen.getByText("3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add organic avocado to cart/i }));
    // Cart count in header should show 3
    expect(screen.getByText(/Cart · 3/i)).toBeInTheDocument();
  });

  it("has a back-to-shop link", () => {
    render(<ProductDetail config={config} product={avocado} />);
    const link = screen.getByRole("link", { name: /back to shop/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("shows rating, discount and stock urgency when present", () => {
    render(
      <ProductDetail
        config={config}
        product={{ ...avocado, rating: 4.7, reviewCount: 132, compareAtAmount: 199, stock: 3 }}
      />,
    );
    expect(screen.getByLabelText(/rated 4\.7 out of 5/i)).toBeInTheDocument();
    expect(screen.getByText("−25%")).toBeInTheDocument();
    expect(screen.getByText(/1,99/)).toBeInTheDocument();
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  it("renders related products linking to their detail pages", () => {
    const related: Product[] = [
      { id: "g3", title: "Cherry Tomatoes", amount: 210, currency: "eur", thumbnail: "🍅", category: "produce" },
    ];
    render(<ProductDetail config={config} product={avocado} related={related} />);
    const shelf = screen.getByLabelText("You may also like");
    expect(shelf).toHaveTextContent("Cherry Tomatoes");
  });
});
