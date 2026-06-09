"use client";

import { useRouter } from "next/navigation";

export function AdminDeleteProductButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  async function remove() {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <button type="button" onClick={remove} aria-label={`Delete ${title}`}>
      Delete
    </button>
  );
}
