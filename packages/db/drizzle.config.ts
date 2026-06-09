import { defineConfig } from "drizzle-kit";

// `pnpm --filter @nextshop/db db:push` creates/updates tables in the Neon database
// pointed to by DATABASE_URL.
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
