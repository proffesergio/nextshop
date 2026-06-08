# CONTEXT — resume point

**Current Task:** Phase 0 foundation of the multi-storefront commerce template (Turborepo + Medusa + Next.js).

**Key Decisions:**
- Engine = Medusa.js; storefront = Next.js PWA.
- **ARCHITECTURE PIVOT (locked):** maximum client isolation — this repo becomes a **factory/template +
  control-plane**; each client = its OWN repo, OWN Vercel deploy, OWN dedicated Medusa backend+DB+admin.
  Shared fixes propagate via **published versioned packages** (GitHub Packages, `pnpm update`), not copy.
  See `executing-plans/architecture-template-and-client-repos.md`.
- The current `clients/<id>/store.config.ts` registry + `STORE_CLIENT` becomes **template demo data**;
  the real client unit is a single `store.config.ts` in a client repo. Demo clients: finnish-grocer
  (grocery/FI), freestylebd (clothing/BD), _example.
- BLOCKER before publishing: lock repo name / GitHub org (sets npm scope, e.g. @shopforge/*). Names
  suggested: ShopForge, ValoShop, NextBazaar, Lumo, NextKauppa.
- Per-feature plans → `writing-plans/*.md`; architecture/exec plans → `executing-plans/*.md`;
  continuation = graph-first (graph_continue → scan → read).

**Done so far (Phase 0 COMPLETE):** root monorepo; `packages/{tsconfig,eslint-config,config,ui}`;
`apps/storefront` (Next.js PWA); `apps/medusa` (engine + seed, incl. Bangladesh Alphonso Mango +
export-quality clothing); `clients/*`; `scripts/new-client.ts`; docs (`README.md`, `docs/PLAYBOOK.md`,
`ROADMAP.md`, `writing-plans/`); CI (`.github/workflows/ci.yml`) + Playwright smoke.
**Verification all green:** typecheck 6/6, lint 5/5, tests 17 passing, storefront builds for both
clients, theme-switch + `pnpm new:client` proven. (No git yet — user inits manually.)

**Next Steps:**
- Phase 1 (storefront UX/UI): wire real Medusa Store API, search+autocomplete, cart, shopping lists,
  checkout with delivery/pickup slots. Plan: `writing-plans/phase-1-storefront-ux.md`.
- To actually RUN Medusa: needs Postgres + `.env` (from `apps/medusa/.env.template`), then
  `pnpm --filter @nextshop/medusa dev` and `... seed`.
- Full plan: `~/.claude/plans/brainstorming-with-user-friendly-hazy-peach.md`.
