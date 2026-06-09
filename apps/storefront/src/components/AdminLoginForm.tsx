/** Owner sign-in form. `action` is a server action from the login page. */
export function AdminLoginForm({
  action,
  error,
}: {
  action: (formData: FormData) => Promise<void>;
  error?: string;
}) {
  return (
    <main style={{ maxWidth: 380, margin: "10vh auto", padding: "var(--space-5)" }}>
      <h1 style={{ fontFamily: "var(--font-display)" }}>Owner sign in</h1>
      {error && (
        <p
          role="alert"
          style={{ color: "#b3261e", background: "#fdeceb", padding: "10px 14px", borderRadius: "var(--radius)" }}
        >
          {error}
        </p>
      )}
      <form action={action} style={{ display: "grid", gap: "var(--space-4)" }}>
        <label style={{ display: "grid", gap: 4 }}>
          Email
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
