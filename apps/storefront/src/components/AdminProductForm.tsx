"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateProductInput, type Product } from "@nextshop/commerce-core";

const field = { display: "grid", gap: 4 } as const;

/** Create/edit product form. Validation mirrors the API (commerce-core). */
export function AdminProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    amount: initial?.amount !== undefined ? String(initial.amount) : "",
    currency: initial?.currency ?? "",
    thumbnail: initial?.thumbnail ?? "",
    category: initial?.category ?? "",
    tag: initial?.tag ?? "",
    origin: initial?.origin ?? "",
    stock: initial?.stock !== undefined ? String(initial.stock) : "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: Record<string, unknown> = {
      title: form.title,
      amount: form.amount.trim() === "" ? undefined : Number(form.amount),
      currency: form.currency,
      thumbnail: form.thumbnail,
      category: form.category,
      tag: form.tag,
      origin: form.origin,
      ...(form.stock.trim() === "" ? {} : { stock: Number(form.stock) }),
    };
    const result = validateProductInput(input);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    setSaving(true);
    const res = await fetch(initial ? `/api/admin/products/${initial.id}` : "/api/admin/products", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.value),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { errors?: string[]; error?: string };
      setErrors(data.errors ?? [data.error ?? "Saving failed"]);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "var(--space-4)", maxWidth: 480 }}>
      {errors.length > 0 && (
        <ul role="alert" style={{ color: "#b3261e", margin: 0, paddingLeft: 20 }}>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <label style={field}>
        Title
        <input value={form.title} onChange={set("title")} />
      </label>
      <label style={field}>
        Price (minor units)
        <input type="number" value={form.amount} onChange={set("amount")} />
      </label>
      <label style={field}>
        Currency
        <input value={form.currency} onChange={set("currency")} placeholder="eur" />
      </label>
      <label style={field}>
        Stock (blank = untracked)
        <input type="number" value={form.stock} onChange={set("stock")} />
      </label>
      <label style={field}>
        Thumbnail (emoji or URL)
        <input value={form.thumbnail} onChange={set("thumbnail")} />
      </label>
      <label style={field}>
        Category
        <input value={form.category} onChange={set("category")} />
      </label>
      <label style={field}>
        Tag
        <input value={form.tag} onChange={set("tag")} />
      </label>
      <label style={field}>
        Origin
        <input value={form.origin} onChange={set("origin")} />
      </label>
      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
