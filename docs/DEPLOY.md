# 🚀 Running & Deploying NextShop

How to run a client storefront on your own machine/server, and how to put it online
for free (Vercel) before you buy a domain.

---

## 1 · Run on your local server

```bash
# one-time
git clone https://github.com/proffesergio/nextshop.git
cd nextshop
export PATH="$HOME/.npm-global/bin:$PATH"   # if pnpm isn't on PATH
pnpm install

# dev mode (hot reload) — pick the client with STORE_CLIENT
STORE_CLIENT=finnish-grocer pnpm --filter @nextshop/storefront dev
# → http://localhost:3000          (storefront)
# → http://localhost:3000/admin    (owner admin)

# production mode on the server
cd apps/storefront
STORE_CLIENT=finnish-grocer pnpm build
STORE_CLIENT=finnish-grocer pnpm start    # serves on port 3000
```

**Admin login (dev / no env set):** `owner@nextshop.dev` / `nextshop-dev`.
In production you **must** set real credentials (see env table below) — the dev
fallback is disabled when `NODE_ENV=production` has no `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

**Environment variables** (`apps/storefront/.env.example` is the template — copy to `.env.local`):

| Var | What | Required? |
|-----|------|-----------|
| `STORE_CLIENT` | Which client to serve (`finnish-grocer`, `freestylebd`, …) | yes |
| `DATABASE_URL` | Neon Postgres URL. **Unset = in-memory demo data** (resets on restart) | for real data |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Owner admin login | yes in production |
| `AUTH_SECRET` | Session signing secret — `openssl rand -base64 32` | yes in production |

**Real database (free Neon tier):**
1. Create a project at <https://neon.tech> (free), copy the connection string.
2. `DATABASE_URL=postgres://… pnpm --filter @nextshop/db db:push` (creates tables).
3. Start the app with the same `DATABASE_URL`. First products can be added in `/admin/products`.

**Expose your local server to the internet without a domain (optional):**
`cloudflared tunnel --url http://localhost:3000` gives you a free public
`https://….trycloudflare.com` URL — handy for showing a client a demo.

---

## 2 · Deploy to Vercel (free Hobby plan)

One Vercel **project per client** — same repo, different `STORE_CLIENT`.

1. Go to <https://vercel.com/new> → **Import** `proffesergio/nextshop`.
2. **Root Directory:** `apps/storefront` (click *Edit* next to the detected root).
   Vercel auto-detects Next.js + pnpm workspaces; keep the default build settings.
3. **Environment variables** (Project → Settings → Environment Variables):
   - `STORE_CLIENT` = `finnish-grocer` (or the client this project serves)
   - `AUTH_SECRET` = output of `openssl rand -base64 32`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` = the shop owner's login
   - `DATABASE_URL` = Neon connection string (optional — without it the store
     runs on demo data and **orders are lost on each cold start**, demo only)
4. **Deploy.** You get `https://<project>.vercel.app` for free.
5. Repeat (New Project → same repo) with `STORE_CLIENT=freestylebd` for the next client.

When you buy domains later: Project → Settings → Domains → add
`shop.<client-domain>` and follow the DNS instructions; config in
`clients/<id>/store.config.ts` already records the intended domains.

**Free alternatives** if you outgrow Vercel's Hobby terms: Cloudflare Pages
(`@cloudflare/next-on-pages`), Netlify (Next runtime), or Render free web service
(`pnpm install && pnpm --filter @nextshop/storefront build`, start command
`pnpm --filter @nextshop/storefront start`). Vercel is the least friction for Next.js 14.

---

## 3 · CI/CD (already wired)

- **`.github/workflows/ci.yml`** — every push/PR: lint, typecheck, unit tests, build,
  then a Playwright smoke test (Chromium, `STORE_CLIENT=finnish-grocer`).
- **`.github/workflows/release.yml`** — on `main`: Changesets opens/updates a
  *Version Packages* PR; merging it publishes the bumped `@nextshop/*` packages
  (needs the `NPM_TOKEN` repo secret).
- **Vercel** auto-deploys every push to `main` once the project is imported —
  green CI + auto deploy = the CD half.
