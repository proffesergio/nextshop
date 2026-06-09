# 🏗️ Architecture — Factory template + independent client repos

**Decision (locked):** Maximum client independence.
- Each client = its **own git repo**, its **own Vercel deploy**, its **own dedicated backend (custom, Next + Neon Postgres via @nextshop/db) + admin**.
- This repo is the **factory / control-plane + template**: it holds the shared packages (published to a
  private registry), the base storefront + backend, docs, and the tooling to spin up client repos.
- Shared fixes propagate via **published versioned packages** (`pnpm update`), not copy-paste.

This reconciles "separate repo per client" with "keep this repo as a storefront manager": the manager
is a control-plane that *generates and versions* many independent storefronts.

```
shopforge  (THIS repo — factory + template, published packages)
  packages/config        -> @scope/config        (published)
  packages/ui            -> @scope/ui             (published)
  packages/commerce-core -> @scope/commerce-core  (published; shared commerce logic, Phase 1+)
  packages/db            -> backend (repository + Neon/Drizzle + in-memory fallback)
  apps/storefront        -> base store (template) + API route handlers
  scripts/create-client-repo.ts
        │
        ├──► repo: tuore        (own repo) ── Vercel ── Neon DB   🥬
        └──► repo: freestylebd  (own repo) ── Vercel ── Neon DB   🧵
```

---

## How a client repo is structured

A client repo is a **thin app** that owns its design/strategy and depends on shared packages by version:

```
tuore/                       (independent repo)
  apps/storefront/           own pages, can diverge freely; API routes talk to @scope/db
  store.config.ts            this client's single config (no registry, no STORE_CLIENT)
  package.json               depends on @scope/ui, @scope/config, @scope/db, @scope/commerce-core (^x.y.z)
  .npmrc                     points @scope to the private registry (read token)
```

To get an upstream fix: `pnpm update @scope/ui @scope/config @scope/commerce-core`. No merge conflicts,
because the client owns its app code and only consumes the packages.

---

## Publishing the shared packages (GitHub Packages)

> Prereq: decide the **repo name / GitHub org** — the npm **scope must match it** (e.g. org `shopforge`
> → `@shopforge/ui`). Tell me the name and I'll wire the scope.

In each shared package's `package.json`:
```jsonc
{
  "name": "@scope/ui",
  "version": "1.0.0",
  "publishConfig": { "registry": "https://npm.pkg.github.com" },
  "repository": { "type": "git", "url": "https://github.com/<org>/shopforge.git" },
  "files": ["dist"]          // publish built output (add a build step: tsup/tsc)
}
```
Root `.npmrc`:
```
@scope:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```
- **Versioning:** add **Changesets** (`@changesets/cli`). Each change → `pnpm changeset`; release bumps
  versions + changelogs across packages.
- **Build step:** shared packages currently export raw TS source (fine inside this monorepo). For
  external consumption they must **build to `dist`** (add `tsup` or `tsc -b`) and publish that.
- **CI publish:** a GitHub Action runs `changeset version` + `changeset publish` on merge to `main`
  (or on a release tag), pushing new versions to GitHub Packages.

---

## Creating a new client repo

Two clean options (the `create-client-repo` script will wrap one):

**A. GitHub template repo (recommended):** maintain a thin **`shopforge-client-template`** repo (the
client structure above). Spin up a client:
```bash
gh repo create <client> --private --template <org>/shopforge-client-template
# then: set store.config.ts, .npmrc token, env, deploy
```

**B. Scripted:** `pnpm create:client <name>` → uses `degit`/`gh` to materialize the template, sets the
client `id`/brand/domain, and opens the repo.

Each new client gets its **own Neon database**:
```bash
# in the client repo
# 1. Create a free Neon project at neon.tech → copy the connection string
# 2. Add DATABASE_URL to the storefront env (Vercel env vars or .env.local)
pnpm --filter @nextshop/db db:push    # create tables in this client's Neon DB
# The storefront's API routes (POST /api/orders, etc.) talk directly to @nextshop/db
# Owner admin (/admin inside the Next app, Auth.js over @nextshop/db) — planned
```

---

## Migration checklist (turn the current monorepo into the factory)

- [ ] Lock the repo name / GitHub org (sets the package scope).
- [ ] Rename packages `@nextshop/*` → `@<scope>/*`; add `publishConfig` + build step (`tsup`/`tsc`) + `files`.
- [ ] Add **Changesets** + a publish GitHub Action (GitHub Packages).
- [ ] Add `packages/commerce-core` for shared commerce logic/extensions (cart/checkout/…, grows in Phase 1+).
- [ ] Reframe the multi-client `clients/` registry as **template demo data**; the real client unit is a
      single `store.config.ts` in a client repo.
- [ ] Build the **client template** (`shopforge-client-template`) + `create-client-repo` tooling.
- [ ] Update `README.md` / `docs/PLAYBOOK.md` to the factory model (replace "one codebase, many stores"
      with "template + independent client repos").
- [ ] Document the **dedicated-backend-per-client** setup (own Neon DB, own `DATABASE_URL`, owner admin — custom, planned).

---

## Trade-off note (so it's on record)

This model maximizes isolation: a change to one client's repo can **never** break another, and each
owner's admin/data is fully separate. The cost — propagating improvements — is handled by the published
packages (`pnpm update`). The residual cost is **N Neon databases to operate** (Neon free tier covers
small clients); move very small clients to a shared DB later if needed (a per-client choice).
