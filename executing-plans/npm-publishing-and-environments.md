# 📦 npm publishing, repo management & environments

How the **factory repo** and **client shop repos** fit together via **public npm packages**, and
**when to run local vs production** servers for each shop's storefront and admin.

---

## A. One-time npm setup (public `@nextshop`)

1. Create a free account at **npmjs.com**.
2. Create a **free org** named **`nextshop`** (npm → *Add Organization* → Free / public). This owns the
   `@nextshop` scope — independent of your GitHub owner (`proffesergio`), so the brand stays clean.
3. Create an **automation access token** (npm → *Access Tokens* → *Granular/Automation*, publish scope).
4. In the GitHub repo `proffesergio/nextshop` → *Settings → Secrets → Actions*, add **`NPM_TOKEN`** = that token.
5. First publish (either let CI do it, or once locally):
   ```bash
   npm login                 # local, one time
   pnpm version-packages     # applies the pending changeset bumps
   pnpm release              # publishes @nextshop/* to npmjs (public)
   ```
   After this, anyone can `npm install @nextshop/ui` (public, no auth).

The repo is already wired: `publishConfig.registry = registry.npmjs.org`, `access: public`,
`.changeset` access `public`, and `release.yml` publishes with `NODE_AUTH_TOKEN=${{ secrets.NPM_TOKEN }}`.

## B. Day-to-day publishing flow

```bash
# after changing a shared package (ui / config / commerce-core / …)
pnpm changeset            # pick the package(s) + bump (patch/minor/major), write a summary
git commit -am "feat(ui): …"
git push                  # PR → merge to main
```
On merge, `release.yml` opens a **“Version Packages”** PR (bumps + changelogs). **Merge that PR →
packages publish to npm automatically.** Semver: `patch` = fixes, `minor` = features, `major` = breaking.

---

## C. How the repos fit together

```
proffesergio/nextshop  (FACTORY)                 npmjs.com
  packages/* ───────── pnpm release ───────────►  @nextshop/ui, @nextshop/config,
  apps/* (template)                               @nextshop/commerce-core, …
        │                                                 ▲
        │ create client repo from template                │  pnpm add / pnpm update
        ▼                                                 │
  proffesergio/tuore        ─ depends on ──────────────────┤
  proffesergio/freestylebd  ─ depends on ──────────────────┘
   (each: own repo, own Vercel, own Neon DB + admin)
```

**Factory repo** = template + shared packages + tooling. You publish packages from here.
**Each client repo** = a thin app that *installs* the public packages:
```jsonc
// client repo package.json
"dependencies": {
  "@nextshop/ui": "^1.2.0",
  "@nextshop/config": "^1.2.0",
  "@nextshop/commerce-core": "^1.2.0"
}
```
- **Shared fix/feature** → factory repo → `pnpm changeset` → publish → each client `pnpm update @nextshop/*`.
- **Client-specific work** → that client's repo only (its own branches/PRs). Cannot affect other shops.
- Pin per client: a cautious shop stays on `^1.2.0`; bump when ready. No forced upgrades.

> **Tip:** keep `@nextshop/ui` consumed via Next `transpilePackages` in each client app (it ships TS
> source). The client template's `next.config.js` already lists the scope.

---

## D. When to create & test each server (per client)

Each shop has one deployable unit: a **Next.js storefront** (Vercel) whose API route handlers
talk directly to **`@nextshop/db`** (Neon Postgres). Bring it up in stages — only as far as the
work needs.

| Stage | When | Storefront | Backend / DB |
|------|------|-----------|--------------|
| **Local** | Every change; building a feature | `pnpm --filter @nextshop/storefront dev` (`:3000`) | in-memory demo data (no DB needed); set `DATABASE_URL` + run `pnpm --filter @nextshop/db db:push` to use a real Neon DB |
| **Preview / staging** | Onboarding a client; client review/sign-off; before launch | Vercel **Preview** deploy (per PR / `staging.<domain>`) | a **staging** Neon DB (`DATABASE_URL` in Vercel preview env) |
| **Production** | Shop goes live | Vercel **Production** (`shop.<domain>`) | **production** Neon DB (free tier; upgrade for high traffic), backups on |

**Rules of thumb**
- **Local is always first** — never build/test a feature against production. Storefront uses
  in-memory demo data when `DATABASE_URL` is unset, so you can build UI with zero infra.
- **Create the Neon DB when you need real data** — products, inventory, orders, payments. Before
  that, the in-memory fallback is enough for UI work.
- **Stand up staging when a human needs to look** — client review, QA of checkout/payments, or testing a
  package upgrade (`pnpm update @nextshop/*`) before it hits production.
- **Production only at launch**, and each client gets **its own** production storefront + backend + DB
  (full isolation; one shop's load/incident never touches another).
- **Test order:** local (unit/e2e + manual) → staging (smoke the full flow incl. payments in test mode)
  → production (post-deploy smoke). CI (`ci.yml`) runs lint/typecheck/test/build on every push.

### Running multiple shops locally at once
Use the factory's `./testservers/run-all.sh` (storefronts on `:3000/:3001/:3002`). For real client
repos, run each shop's `storefront` from its own repo on distinct ports (backend is embedded).

---

## E. Quick reference

```bash
# publish a shared change (factory repo)
pnpm changeset && git commit -am "feat(...)" && git push      # → merge release PR → npm publish

# in a client shop repo
pnpm add @nextshop/ui @nextshop/config @nextshop/db @nextshop/commerce-core  # first time
pnpm update @nextshop/*                                        # pull latest shared fixes
pnpm --filter @nextshop/storefront dev    # local storefront :3000 (in-memory demo data)
# to use a real Neon DB: set DATABASE_URL + pnpm --filter @nextshop/db db:push
```
