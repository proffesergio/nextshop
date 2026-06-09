"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { listItemCount, type ShoppingList } from "@nextshop/commerce-core";
import { Button } from "./Button.js";

/** Slide-in panel for saved shopping lists: save the cart, re-add a list, delete. */
export function ListsDrawer({
  open,
  onClose,
  lists,
  canSaveCurrent,
  onSaveCurrent,
  onAddToCart,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  lists: ShoppingList[];
  canSaveCurrent: boolean;
  onSaveCurrent: (name: string) => void;
  onAddToCart: (listId: string) => void;
  onDelete: (listId: string) => void;
}) {
  const [name, setName] = useState("");

  const save = () => {
    const n = name.trim();
    if (!n) return;
    onSaveCurrent(n);
    setName("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(20,39,27,0.4)", zIndex: 100 }}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="Shopping lists"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100dvh",
              width: "min(420px, 92vw)",
              background: "var(--color-background)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 101,
              display: "flex",
              flexDirection: "column",
              padding: "var(--space-5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Shopping lists</h2>
              <button
                onClick={onClose}
                aria-label="Close lists"
                style={{ border: "none", background: "transparent", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Save the current cart as a new list */}
            <div style={{ display: "flex", gap: 8, marginTop: "var(--space-4)" }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name this list…"
                aria-label="New list name"
                onKeyDown={(e) => e.key === "Enter" && save()}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <Button variant="primary" style={{ padding: "10px 16px" }} disabled={!canSaveCurrent} onClick={save}>
                Save cart
              </Button>
            </div>
            {!canSaveCurrent && (
              <p style={{ fontSize: "0.8rem", opacity: 0.6, margin: "6px 4px 0" }}>
                Add items to your cart first, then save them as a reusable list.
              </p>
            )}

            <div style={{ flex: 1, overflowY: "auto", marginTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {lists.length === 0 && (
                <p style={{ opacity: 0.6, marginTop: "var(--space-6)", textAlign: "center" }}>
                  No saved lists yet. 📝
                </p>
              )}
              {lists.map((list) => (
                <div
                  key={list.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius)",
                    background: "color-mix(in srgb, var(--color-primary) 5%, transparent)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{list.name}</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>{listItemCount(list)} items</div>
                  </div>
                  <Button variant="ghost" style={{ padding: "8px 14px", fontSize: "0.85rem" }} onClick={() => onAddToCart(list.id)}>
                    Add to cart
                  </Button>
                  <button
                    onClick={() => onDelete(list.id)}
                    aria-label={`Delete list ${list.name}`}
                    style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "1.1rem", opacity: 0.6 }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
