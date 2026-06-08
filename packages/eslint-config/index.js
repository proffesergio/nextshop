import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/**
 * Shared flat ESLint config for the grocery-commerce-template monorepo.
 * Consumed by each package/app via `export { default } from "@nextshop/eslint-config"`.
 */
export default tseslint.config(
  { ignores: ["**/dist/**", "**/.next/**", "**/.medusa/**", "**/node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },
  {
    // CommonJS Node config files (e.g. next.config.js) — provide Node globals.
    files: ["**/next.config.js", "**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    }
  }
);
