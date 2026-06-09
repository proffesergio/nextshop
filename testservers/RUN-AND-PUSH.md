# ▶️ Run locally & push to GitHub

For the NextShop factory repo → **https://github.com/proffesergio/nextshop.git**

---

## 1. Run locally

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
pnpm install
```

**All storefronts at once** (compare designs side by side):
```bash
./testservers/run-all.sh      # 🥬 :3000 · 🧵 :3001 · base :3002
./testservers/stop-all.sh
```

**One storefront** (with the Phase 1 search + cart UX):
```bash
STORE_CLIENT=finnish-grocer pnpm --filter @nextshop/storefront dev    # http://localhost:3000
STORE_CLIENT=freestylebd    pnpm --filter @nextshop/storefront dev    # http://localhost:3001
```

**Real database** (optional — in-memory demo data works without it):
```bash
# Create a free Neon project → copy the connection string → add to apps/storefront/.env.local:
# DATABASE_URL=postgresql://...
pnpm --filter @nextshop/db db:push    # push schema to Neon
```
Owner admin (`/admin`, planned) is not yet available.

Checks before pushing:
```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
```

---

## 2. First push to GitHub

```bash
cd /home/hossain/Documents/grocery-app
git init
git branch -M main
git add -A
git commit -m "feat: NextShop factory — Phase 0 foundation + Phase 1 storefront UX"

git remote add origin https://github.com/proffesergio/nextshop.git
git push -u origin main
```
(If the remote already has commits: `git pull --rebase origin main` first, then push.)

---

## 3. Pushing updates (day to day)

Work on a branch, open a PR, merge to `main`:
```bash
git switch -c ui/cart-drawer-polish
# …edit…
pnpm test && pnpm typecheck && pnpm lint        # keep it green
git commit -am "feat(ui): polish cart drawer empty state"
git push -u origin ui/cart-drawer-polish        # open a PR on GitHub → merge
```

Branch-name scopes (see [`../executing-plans/git-and-admin-playbook.md`](../executing-plans/git-and-admin-playbook.md)):
- `ui/…`, `storefront/…`, `commerce-core/…` → shared (affects the template + every client)
- `client/<id>/…` → one client only

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on every push/PR.

---

## 4. Publishing the shared packages — npm (public)

Decided: shared `@nextshop/*` packages publish **publicly to npmjs.com** (scope `@nextshop`,
independent of the GitHub owner). Full setup + flow:
**[`../executing-plans/npm-publishing-and-environments.md`](../executing-plans/npm-publishing-and-environments.md)**.

In short — one-time: create a free npm org `nextshop`, add an `NPM_TOKEN` GitHub secret. Then:
```bash
pnpm changeset            # describe a change + bump (per PR)
# merge to main → release.yml opens a "Version Packages" PR → merge it → packages publish to npm
```
Client repos consume the public packages (no auth) and update with:
```bash
pnpm update @nextshop/ui @nextshop/config @nextshop/commerce-core
```
