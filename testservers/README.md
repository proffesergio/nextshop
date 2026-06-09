# 🧪 testservers — run every storefront locally

How to spin up each client's **storefront** on your machine to preview different designs side by
side, and how this maps to the future **one-repo-per-client** workflow where each app pushes its
own design updates to its own GitHub repo.

## Ports

| App | Client | URL | Command env |
|-----|--------|-----|-------------|
| Storefront | Tuore 🥬 (grocery/FI) | http://localhost:3000 | `STORE_CLIENT=finnish-grocer` |
| Storefront | FreeStyleBD 🧵 (clothing/BD) | http://localhost:3001 | `STORE_CLIENT=freestylebd` |
| Storefront | Example Co (base) | http://localhost:3002 | `STORE_CLIENT=example-co` |
| Owner admin | /admin in the Next app (planned) | — | Auth.js over `@nextshop/db` |

## Prerequisites

```bash
export PATH="$HOME/.npm-global/bin:$PATH"   # pnpm on PATH
pnpm install
```
The storefronts run **without a database** — `@nextshop/db` falls back to in-memory demo data
when `DATABASE_URL` is unset. To use a real database: create a free **Neon** project, set
`DATABASE_URL` in `apps/storefront/.env.local`, and run `pnpm --filter @nextshop/db db:push`.

## Run ONE storefront (most common)

```bash
STORE_CLIENT=finnish-grocer pnpm --filter @nextshop/storefront dev      # http://localhost:3000
# switch client by changing STORE_CLIENT and re-running
STORE_CLIENT=freestylebd    pnpm --filter @nextshop/storefront dev
```

## Run ALL storefronts at once (compare designs)

Each instance needs its **own build dir** (`NEXT_DIST_DIR`) and port, or they fight over `.next`:

```bash
./testservers/run-all.sh      # starts 3 storefronts on :3000/:3001/:3002 (background)
./testservers/stop-all.sh     # stops them
```
Logs stream to `testservers/logs/<client>.log`.

## Connect a real database (optional — in-memory demo data works out of the box)

```bash
# 1. Create a free Neon project at neon.tech → copy the connection string
# 2. Add it to the storefront env:
echo 'DATABASE_URL=postgresql://...' >> apps/storefront/.env.local
# 3. Push the schema to Neon:
pnpm --filter @nextshop/db db:push
```

The owner admin (`/admin` inside the Next app, Auth.js over `@nextshop/db`) is **planned** and
not yet available.

---

## 🔮 Future: one repo per client (the factory model)

Today these storefronts are one app switched by `STORE_CLIENT` (template/demo). In production each
client is its **own repo** with its **own Neon DB**, consuming the shared `@nextshop/*` packages.
Local testing + pushing **design updates** then looks like:

```bash
# in the client's own repo (e.g. tuore/)
pnpm install
pnpm --filter storefront dev            # test that client's design locally (:3000)
# DATABASE_URL points to this client's own Neon DB

# make design changes (its own store.config.ts / components), then:
git switch -c design/autumn-hero
git commit -am "feat(design): autumn hero gradient + new banner"
git push -u origin design/autumn-hero   # PR → that client's repo only; no other store affected

# pull shared fixes/features from the template packages:
pnpm update @nextshop/ui @nextshop/config
```

So each app evolves and ships **independently** to its own GitHub repo, while shared improvements
arrive via `pnpm update`. See [`../executing-plans/architecture-template-and-client-repos.md`](../executing-plans/architecture-template-and-client-repos.md)
and [`../executing-plans/git-and-admin-playbook.md`](../executing-plans/git-and-admin-playbook.md).
