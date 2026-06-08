"use client";

import { useState } from "react";
import type { StoreConfig } from "@nextshop/config";
import {
  Button,
  Footer,
  Header,
  Hero,
  Page,
  ProductGrid,
  type ProductCardProduct,
} from "@nextshop/ui";

export function StoreHome({
  config,
  products,
}: {
  config: StoreConfig;
  products: ProductCardProduct[];
}) {
  const [cart, setCart] = useState<string[]>([]);
  const addToCart = (id: string) => setCart((c) => [...c, id]);

  return (
    <Page>
      <Header
        brandName={config.brand.name}
        logo={config.brand.logo}
        nav={
          <>
            <a href="#shop" style={{ textDecoration: "none", fontWeight: 500 }}>
              Shop
            </a>
            <Button variant="ghost" style={{ padding: "10px 18px" }}>
              Cart · {cart.length}
            </Button>
          </>
        }
      />

      <main className="u-container">
        <Hero
          eyebrow={`✨ ${config.regions[0]?.name ?? "Online"} delivery`}
          title={
            <>
              Fresh picks for <em style={{ fontStyle: "normal", opacity: 0.92 }}>{config.brand.name}</em>,
              delivered fast.
            </>
          }
          subtitle="Browse, build your list, and check out in a few taps. Real-time order tracking from cart to doorstep."
          actions={
            <>
              <Button variant="primary">Start shopping</Button>
              <Button variant="outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.6)" }}>
                How it works
              </Button>
            </>
          }
        />

        <section id="shop" style={{ marginTop: "var(--space-8)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Featured</h2>
            <span style={{ opacity: 0.6 }}>{products.length} items</span>
          </div>
          <div style={{ marginTop: "var(--space-5)" }}>
            <ProductGrid products={products} onAdd={addToCart} />
          </div>
        </section>
      </main>

      <Footer brandName={config.brand.name} />
    </Page>
  );
}
