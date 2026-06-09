import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getStoreConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const config = getStoreConfig();
  if (!config.featureFlags.ownerAdmin) notFound();
  if (!(await auth())) redirect("/admin/login");

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--space-5)" }}>
      <header
        style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}
      >
        <strong style={{ fontFamily: "var(--font-display)" }}>{config.brand.name} · Admin</strong>
        <nav style={{ display: "flex", gap: "var(--space-4)" }}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/orders">Orders</Link>
        </nav>
        <form action={logout} style={{ marginLeft: "auto" }}>
          <button type="submit">Sign out</button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  );
}
