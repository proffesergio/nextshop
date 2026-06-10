"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreConfig } from "@nextshop/config";
import {
  dealProducts,
  discountPercent,
  filterProducts,
  formatPrice,
  sortProducts,
  suggestProducts,
  topRated,
  type Product,
  type ProductSort,
} from "@nextshop/commerce-core";
import {
  AnnouncementBar,
  Button,
  CartDrawer,
  CategoryShowcase,
  CategoryTabs,
  Footer,
  Header,
  Hero,
  ListsDrawer,
  NewsletterSignup,
  Page,
  ProductCard,
  ProductGrid,
  ProductShelf,
  PromoBanner,
  SearchAutocomplete,
  UspStrip,
  type ProductCardProduct,
} from "@nextshop/ui";
import { useCart } from "@/lib/useCart";
import { useShoppingLists } from "@/lib/useShoppingLists";

export function StoreHome({ config, products }: { config: StoreConfig; products: Product[] }) {
  const router = useRouter();
  const locale = config.locales.default;
  const cart = useCart(config.id);
  const lists = useShoppingLists(config.id);
  const listsEnabled = config.featureFlags.shoppingLists;
  const [cartOpen, setCartOpen] = useState(false);
  const [listsOpen, setListsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<ProductSort>("relevance");

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))],
    [products],
  );

  const categoryTiles = useMemo(
    () =>
      categories.map((c) => ({
        id: c,
        label: c,
        icon: products.find((p) => p.category === c)?.thumbnail ?? "🛍️",
        count: products.filter((p) => p.category === c).length,
      })),
    [categories, products],
  );

  const deals = useMemo(() => dealProducts(products).slice(0, 8), [products]);
  const best = useMemo(() => topRated(products).slice(0, 8), [products]);

  const visible = useMemo(
    () => sortProducts(filterProducts(products, { query, category: category ?? undefined }), sort),
    [products, query, category, sort],
  );

  const toCard = (p: Product): ProductCardProduct => {
    const pct = discountPercent(p);
    return {
      id: p.id,
      title: p.title,
      price: formatPrice({ amount: p.amount, currency: p.currency }, locale),
      thumbnail: p.thumbnail,
      tag: p.tag,
      origin: p.origin,
      rating: p.rating,
      reviewCount: p.reviewCount,
      ...(pct > 0 && p.compareAtAmount
        ? { discountPercent: pct, compareAtPrice: formatPrice({ amount: p.compareAtAmount, currency: p.currency }, locale) }
        : {}),
      ...(p.stock === 0
        ? { soldOut: true, stockHint: "Out of stock" }
        : typeof p.stock === "number" && p.stock <= 5
          ? { stockHint: `Only ${p.stock} left` }
          : {}),
    };
  };

  const addById = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) cart.add(product);
  };

  const addListToCart = (listId: string) => {
    const list = lists.lists.find((l) => l.id === listId);
    if (!list) return;
    for (const item of list.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) cart.add(product, item.qty);
    }
    setListsOpen(false);
    setCartOpen(true);
  };

  const jumpToShop = (cat: string | null) => {
    setCategory(cat);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Page>
      {config.marketing.announcement && <AnnouncementBar>{config.marketing.announcement}</AnnouncementBar>}

      <Header
        brandName={config.brand.name}
        logo={config.brand.logo}
        nav={
          <>
            <a href="#shop" style={{ textDecoration: "none", fontWeight: 500 }}>
              Shop
            </a>
            {listsEnabled && (
              <Button variant="ghost" style={{ padding: "10px 18px" }} onClick={() => setListsOpen(true)}>
                Lists · {lists.lists.length}
              </Button>
            )}
            <Button variant="ghost" style={{ padding: "10px 18px" }} onClick={() => setCartOpen(true)}>
              Cart · {cart.count}
            </Button>
          </>
        }
      />

      <main className="u-container">
        <Hero
          eyebrow={`✨ ${config.regions[0]?.name ?? "Online"} delivery`}
          title={
            <>
              Fresh picks for{" "}
              <em style={{ fontStyle: "normal", opacity: 0.92 }}>{config.brand.name}</em>, delivered fast.
            </>
          }
          subtitle="Search, build your cart, and check out in a few taps. Real-time order tracking from cart to doorstep."
          actions={
            <>
              <Button variant="primary" onClick={() => jumpToShop(null)}>
                Start shopping
              </Button>
              {deals.length > 0 && (
                <Button
                  variant="outline"
                  style={{ color: "#fff", borderColor: "rgba(255,255,255,0.6)" }}
                  onClick={() => document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" })}
                >
                  🔥 Today's deals
                </Button>
              )}
            </>
          }
        />

        {config.marketing.usps.length > 0 && (
          <div style={{ marginTop: "var(--space-6)" }}>
            <UspStrip items={config.marketing.usps} />
          </div>
        )}

        {categoryTiles.length > 0 && (
          <section aria-label="Shop by category" style={{ marginTop: "var(--space-7)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--space-4)" }}>Shop by category</h2>
            <CategoryShowcase categories={categoryTiles} onSelect={(id) => jumpToShop(id)} />
          </section>
        )}

        {deals.length > 0 && (
          <div id="deals">
            <ProductShelf
              ariaLabel="Deals of the day"
              title="🔥 Deals of the day"
              subtitle="Limited stock — prices snap back soon"
              action={
                <Button variant="ghost" style={{ padding: "8px 16px", fontSize: "0.9rem" }} onClick={() => jumpToShop(null)}>
                  See all
                </Button>
              }
            >
              {deals.map((p) => (
                <ProductCard key={p.id} product={toCard(p)} onAdd={addById} />
              ))}
            </ProductShelf>
          </div>
        )}

        {best.length > 0 && (
          <ProductShelf
            ariaLabel="Top rated"
            title="⭐ Loved by customers"
            subtitle="Rated 4.5 and up"
          >
            {best.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} onAdd={addById} />
            ))}
          </ProductShelf>
        )}

        <section id="shop" aria-label="All products" style={{ marginTop: "var(--space-8)" }}>
          <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>All products</h2>
            <SearchAutocomplete
              value={query}
              onChange={setQuery}
              suggestions={suggestProducts(products, query, 6)}
              onSelect={(id) => router.push(`/products/${id}`)}
              placeholder={`Search ${config.brand.name}…`}
            />
          </div>

          <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginTop: "var(--space-4)" }}>
            <CategoryTabs categories={categories} active={category} onSelect={setCategory} />
            <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: "0.9rem" }}>
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ProductSort)}
                style={{ padding: "8px 12px", borderRadius: 999, border: "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)", fontFamily: "var(--font-sans)" }}
              >
                <option value="relevance">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="title">Name</option>
              </select>
            </label>
          </div>

          <div style={{ marginTop: "var(--space-5)" }}>
            {visible.length > 0 ? (
              <ProductGrid products={visible.map(toCard)} onAdd={addById} />
            ) : (
              <p style={{ opacity: 0.6, padding: "var(--space-7) 0", textAlign: "center" }}>
                No products match “{query}”. Try another search.
              </p>
            )}
          </div>
        </section>

        {config.marketing.promos.length > 0 && (
          <section
            aria-label="Promotions"
            style={{
              marginTop: "var(--space-8)",
              display: "grid",
              gap: "var(--space-5)",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {config.marketing.promos.map((promo) => (
              <PromoBanner key={promo.title} {...promo} />
            ))}
          </section>
        )}

        <div style={{ marginTop: "var(--space-8)" }}>
          <NewsletterSignup />
        </div>
      </main>

      <Footer brandName={config.brand.name} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart.cart}
        locale={locale}
        fallbackCurrency={config.currency}
        onSetQty={cart.setQty}
        onCheckout={() => {
          setCartOpen(false);
          router.push("/checkout");
        }}
      />

      {listsEnabled && (
        <ListsDrawer
          open={listsOpen}
          onClose={() => setListsOpen(false)}
          lists={lists.lists}
          canSaveCurrent={cart.cart.length > 0}
          onSaveCurrent={(name) => lists.saveCartAsList(name, cart.cart)}
          onAddToCart={addListToCart}
          onDelete={lists.deleteList}
        />
      )}
    </Page>
  );
}
