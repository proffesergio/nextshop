import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  if (await auth()) redirect("/admin");

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirectTo: "/admin",
      });
    } catch (err) {
      // next's redirect() works by throwing — let it through
      if (err instanceof Error && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      redirect("/admin/login?error=1");
    }
  }

  return <AdminLoginForm action={login} error={searchParams?.error ? "Invalid email or password" : undefined} />;
}
