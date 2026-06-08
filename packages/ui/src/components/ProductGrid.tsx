"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "../motion.js";
import { ProductCard, type ProductCardProduct } from "./ProductCard.js";

/** Responsive, staggered-reveal grid of ProductCards. */
export function ProductGrid({
  products,
  onAdd,
}: {
  products: ProductCardProduct[];
  onAdd?: (id: string) => void;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      style={{
        display: "grid",
        gap: "var(--space-5)",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      }}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} />
      ))}
    </motion.div>
  );
}
