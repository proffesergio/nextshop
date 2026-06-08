import type { Variants } from "framer-motion";

/** Container that staggers its children's reveal — used for product grids. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

/** A single item rising into place. Pairs with staggerContainer. */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Hero headline reveal. */
export const heroReveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Tactile press feedback for buttons. */
export const press = {
  whileHover: { scale: 1.03, y: -2 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 22 },
} as const;
