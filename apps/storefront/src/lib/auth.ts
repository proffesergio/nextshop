import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authorizeOwner } from "./owner-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "nextshop-dev-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: { label: "Email" }, password: { label: "Password", type: "password" } },
      authorize: async (credentials) => authorizeOwner(credentials),
    }),
  ],
});
