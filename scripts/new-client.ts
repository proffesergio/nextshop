import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface CreateClientOptions {
  /** Directory holding the client configs + index.ts. Defaults to <repo>/clients. */
  clientsDir?: string;
}

/** "acme-foods" -> "Acme Foods" */
function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** "acme-foods" -> "acmeFoods" */
function camelize(slug: string): string {
  const parts = slug.split("-");
  return (
    parts[0] +
    parts
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
  );
}

function defaultClientsDir(): string {
  // scripts/ sits next to clients/ at the repo root
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "clients");
}

/**
 * Scaffold a new client storefront from the `_example` base clone:
 * copies the directory, rewrites id/name/domain, and registers it in index.ts.
 * Returns the path to the created client directory.
 */
export function createClient(company: string, opts: CreateClientOptions = {}): string {
  if (!KEBAB.test(company)) {
    throw new Error(`Company id "${company}" must be lowercase kebab-case (e.g. "acme-foods").`);
  }
  const clientsDir = opts.clientsDir ?? defaultClientsDir();
  const targetDir = join(clientsDir, company);
  if (existsSync(targetDir)) {
    throw new Error(`Client "${company}" already exists at ${targetDir}.`);
  }

  // 1. Copy the base clone.
  cpSync(join(clientsDir, "_example"), targetDir, { recursive: true });

  // 2. Rewrite the copied config.
  const cfgPath = join(targetDir, "store.config.ts");
  let cfg = readFileSync(cfgPath, "utf8");
  cfg = cfg
    .replace('id: "example-co"', `id: "${company}"`)
    .replace('name: "Example Co"', `name: "${humanize(company)}"`)
    .replace('primary: "shop.example.com"', `primary: "shop.${company}.com"`);
  writeFileSync(cfgPath, cfg);

  // 3. Register in index.ts (insert before the marker comments).
  const indexPath = join(clientsDir, "index.ts");
  const varName = camelize(company);
  let index = readFileSync(indexPath, "utf8");
  index = index.replace(
    "// new:client imports — do not remove this marker",
    `import ${varName} from "./${company}/store.config.js";\n// new:client imports — do not remove this marker`,
  );
  index = index.replace(
    "// new:client registry — do not remove this marker",
    `[${varName}.id]: ${varName},\n  // new:client registry — do not remove this marker`,
  );
  writeFileSync(indexPath, index);

  return targetDir;
}

// CLI entry: `pnpm new:client <company>`
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const company = process.argv[2];
  if (!company) {
    console.error("Usage: pnpm new:client <company-kebab-case>");
    process.exit(1);
  }
  const dir = createClient(company);
  console.log(`✓ Created client "${company}" at ${dir}`);
  console.log("  Next: edit store.config.ts (brand, gradients, domains, payments) — see docs/PLAYBOOK.md");
}
