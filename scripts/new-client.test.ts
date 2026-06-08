import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "./new-client.js";

let clientsDir: string;

const EXAMPLE_CONFIG = `import { defineConfig } from "@nextshop/config";

export default defineConfig({
  id: "example-co",
  brand: {
    name: "Example Co",
  },
  domains: {
    primary: "shop.example.com",
  },
});
`;

const INDEX = `import type { ClientRegistry } from "@nextshop/config";
import exampleCo from "./_example/store.config.js";
// new:client imports — do not remove this marker

export const registry: ClientRegistry = {
  [exampleCo.id]: exampleCo,
  // new:client registry — do not remove this marker
};
`;

beforeEach(() => {
  clientsDir = mkdtempSync(join(tmpdir(), "clients-"));
  mkdirSync(join(clientsDir, "_example"), { recursive: true });
  writeFileSync(join(clientsDir, "_example", "store.config.ts"), EXAMPLE_CONFIG);
  writeFileSync(join(clientsDir, "index.ts"), INDEX);
});

afterEach(() => {
  rmSync(clientsDir, { recursive: true, force: true });
});

describe("createClient", () => {
  it("copies the base clone into a new client directory with the new id", () => {
    createClient("acme-foods", { clientsDir });
    const cfgPath = join(clientsDir, "acme-foods", "store.config.ts");
    expect(existsSync(cfgPath)).toBe(true);
    const cfg = readFileSync(cfgPath, "utf8");
    expect(cfg).toContain('id: "acme-foods"');
    expect(cfg).not.toContain('id: "example-co"');
  });

  it("humanizes the brand name and sets a default primary domain", () => {
    createClient("acme-foods", { clientsDir });
    const cfg = readFileSync(join(clientsDir, "acme-foods", "store.config.ts"), "utf8");
    expect(cfg).toContain('name: "Acme Foods"');
    expect(cfg).toContain('primary: "shop.acme-foods.com"');
  });

  it("registers the client in index.ts (import + registry entry, markers preserved)", () => {
    createClient("acme-foods", { clientsDir });
    const index = readFileSync(join(clientsDir, "index.ts"), "utf8");
    expect(index).toContain('import acmeFoods from "./acme-foods/store.config.js";');
    expect(index).toContain("[acmeFoods.id]: acmeFoods,");
    expect(index).toContain("// new:client imports — do not remove this marker");
    expect(index).toContain("// new:client registry — do not remove this marker");
  });

  it("rejects a non-kebab-case company name", () => {
    expect(() => createClient("Acme_Foods", { clientsDir })).toThrow(/kebab-case/);
  });

  it("refuses to overwrite an existing client", () => {
    createClient("acme-foods", { clientsDir });
    expect(() => createClient("acme-foods", { clientsDir })).toThrow(/already exists/);
  });
});
