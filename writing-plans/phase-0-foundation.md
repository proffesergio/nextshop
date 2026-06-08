# Phase 0 — Foundation

## Context
Stand up the config-driven multi-storefront skeleton so Phases 1–5 are pure feature work.
Engine = Medusa; storefront = Next.js PWA; reuse = one codebase, many stores via `STORE_CLIENT`.

## Goal
A coherent empty skeleton: monorepo, theming, design system, storefront shell, clients +
`new:client`, docs, CI — runnable and re-skinnable with zero code changes per client.

## Tasks
- [x] Turborepo + pnpm workspace (`turbo.json`, `pnpm-workspace.yaml`, shared tsconfig/eslint)
- [x] `packages/config` — `StoreConfig` zod schema, `loadStoreConfig`, brand→CSS tokens (+ vitest)
- [x] `packages/ui` — design system: `BrandStyle`, `Hero`, `ProductCard/Grid`, `Button`, `Header/Footer`, motion
- [x] `apps/storefront` — Next.js App Router PWA; resolves active client; themed home + product grid
- [x] `clients/_example` (base clone), `clients/finnish-grocer`, `clients/freestylebd`, `clients/index.ts`
- [x] `scripts/new-client.ts` — `pnpm new:client <company>` (TDD, 5/5)
- [x] Docs: `README.md`, `docs/PLAYBOOK.md`, `ROADMAP.md`, `CONTEXT.md`, `writing-plans/`
- [ ] `apps/medusa` — engine config + seed (sample products incl. a Bangladesh-sourced item)
- [ ] CI (GitHub Actions): lint → typecheck → test → build → audit; Playwright smoke
- [ ] Verification pass

## Key files
`packages/config/src/schema.ts`, `packages/config/src/tokens.ts`, `clients/index.ts`,
`apps/storefront/src/lib/store.ts`, `scripts/new-client.ts`.

## Verification
1. `pnpm install && pnpm build` green.
2. `STORE_CLIENT=finnish-grocer` vs `freestylebd` visibly re-skins the storefront (palette,
   currency, copy) with no code change.
3. `pnpm new:client demo-co` produces a registered, runnable client.
4. `pnpm test` green (config + scripts + storefront); Playwright smoke passes.
5. Medusa admin reachable; seed products load.
