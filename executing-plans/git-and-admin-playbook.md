# 🚀 Executing Plan — Git strategy, per-client deploys & shop-owner admin access

How to put this repo under git, ship UI updates to **individual** storefronts without disturbing
the others, and grant a shop owner admin access. Read alongside [`../docs/PLAYBOOK.md`](../docs/PLAYBOOK.md).

---

## 1. Initialize the repo

Pick a name (suggestions: **ShopForge**, Storefront Factory, CommerceLoom, OmniStore, Bazaar Engine).
Example uses `shopforge`.

```bash
cd /home/hossain/Documents/grocery-app
git init
git branch -M main
git add -A
git commit -m "chore: initial commit — ShopForge multi-storefront commerce template"

# GitHub (private recommended)
gh repo create shopforge --private --source=. --remote=origin --push
# …or set the remote manually:
# git remote add origin git@github.com:<you>/shopforge.git && git push -u origin main
```

> The dual-graph already tracks context for crash recovery; once git exists, the **code-review-graph**
> build also activates (it diffs against git).

---

## 2. The golden rule for many storefronts

**Express per-client differences as DATA, not divergent code.** Every store ships from the *same*
`main`. A client differs only by:

1. its **`clients/<id>/store.config.ts`** (brand, gradients, domains, locale, currency, payments,
   warehouses), and
2. **feature flags** (`featureFlags.*`) that switch whole modules on/off.

This keeps one history for everyone — fix a bug once, every store gets it. **Avoid long-lived
per-client branches**; they drift and force manual back-porting (the exact pain we designed out).

When a client genuinely needs bespoke UI beyond config → put it behind a **feature flag** or a
small **per-client override**, still on `main` (see §5). Forking the repo per client is the
anti-pattern.

---

## 3. Branching model (trunk-based)

```
main ─────●─────●─────●─────●──────────────►   (always deployable; all stores build from here)
           \         \
            \          client/freestylebd/size-guide   (short-lived, merges back)
             ui/cart-drawer                              (shared improvement, benefits all)
```

- **Short-lived branches**, merged via PR, deleted after merge.
- **Branch naming** signals scope:
  - `ui/<change>`, `storefront/<change>`, `engine/<change>` → shared (affects every store)
  - `client/<id>/<change>` → touches only `clients/<id>` (one store)
- **Conventional commits with a scope** so history is filterable per store:
  ```
  feat(ui): add cart drawer with slide-in animation
  fix(storefront): correct currency formatting at checkout
  feat(freestylebd): enable size guide on product pages
  chore(finnish-grocer): update hero gradient to autumn palette
  ```
- **Release tags** (`v1.3.0`) let a cautious client pin to a stable version while others ride
  `main` (see §4).

---

## 4. Pushing an update to ONE storefront's UI

There are two cases.

### Case A — brand/theme/flag change (most common, no code)
Edit only that client's config:
```bash
git switch -c client/finnish-grocer/winter-theme
# edit clients/finnish-grocer/store.config.ts (gradients, colors, flags…)
git commit -am "chore(finnish-grocer): switch to winter gradient palette"
# open PR → merge to main
```
Only Tuore's deployment rebuilds (see the per-client build gate below). FreeStyleBD is untouched.

### Case B — bespoke UI for one client only (code)
Gate it so other stores never see it:
```tsx
// in a shared component
{config.featureFlags.sizeGuide && <SizeGuide />}
```
Add `sizeGuide` to the flag schema, turn it on only in `clients/freestylebd/store.config.ts`.
Merge to `main`; every store has the *code*, only FreeStyleBD has it *on*.

### Per-client build isolation (Vercel)
Each storefront = **its own Vercel project**, all pointing at the same repo, with:
- **Root Directory:** `apps/storefront`
- **Env:** `STORE_CLIENT=<id>`, `DATABASE_URL` (Neon connection string)
- **Ignored Build Step** (so a store only rebuilds when *its* config or shared code changes):

```bash
# Vercel → Project → Settings → Git → Ignored Build Step (for client <id>)
git diff HEAD^ HEAD --quiet -- apps/storefront packages clients/<id> pnpm-lock.yaml && exit 0 || exit 1
# exit 0 = skip build, exit 1 = build
```

So a commit touching `clients/finnish-grocer/**` rebuilds **only** Tuore; a commit touching
`packages/ui/**` rebuilds **all** stores (intended — shared design system).

### Pinning a conservative client to a release
Point that client's Vercel **Production Branch** at a release branch/tag (e.g. `release/v1.3`)
instead of `main`. They upgrade by fast-forwarding that branch when ready — no surprise changes.

---

## 5. (Optional) Per-client component overrides

If config + flags aren't enough, support overrides without forking:

```
clients/<id>/overrides/   ← optional client-specific components (e.g. Hero.tsx)
```
Resolve them with a small loader that prefers `clients/<STORE_CLIENT>/overrides/<Name>` and falls
back to `@nextshop/ui`. Keep overrides rare — every override is something you maintain twice.

---

## 6. Give a shop owner admin access

Owners will manage their store from the **owner admin** — a custom `/admin` section inside the
Next.js app, built with **Auth.js** over **`@nextshop/db`** (Neon Postgres). This is **planned,
not yet built**.

When the owner admin is available, the flow will be:
- Create an owner account directly in the `@nextshop/db` users table (or via an invite flow in the
  admin UI).
- The owner logs in at `https://<storefront>/admin`, changes their password on first login, and
  manages products, orders, and inventory from there.
- Each client has its **own Neon DB**, so owner data is fully isolated — one owner cannot see
  another client's data.

For now, product and order data can be managed by seeding the Neon DB directly or via API calls.

### What owners can do vs. what stays with you (planned)
| Owner (admin panel) | You (developer) |
|----------------------|-----------------|
| Products, categories, prices, images | Code, deploys, env/secrets |
| Inventory | Adding payment providers / regions in code |
| Orders: fulfil, refund, status | DB (Neon), hosting, domain DNS |
| View customers | Feature-flag / theme changes via config PR |

---

## 7. Quick reference

```bash
# shared improvement (all stores)
git switch -c ui/<change> && git commit -am "feat(ui): <change>" && # PR → main

# single-store change (one store)
git switch -c client/<id>/<change> && git commit -am "chore(<id>): <change>" && # PR → main

# cut a release for cautious clients
git switch -c release/v1.3 && git push -u origin release/v1.3
```
