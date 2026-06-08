# 🧭 writing-plans

Per-phase / per-feature implementation plans. **One `.md` per phase or feature.**

## Convention

- Name files `phase-<n>-<topic>.md` or `<feature>.md`.
- A plan has: **Context** (why), **Goal**, **Tasks** (checklist), **Files**, **Verification**.
- Build from the plan test-first (TDD). Update [`../ROADMAP.md`](../ROADMAP.md) status as you go.

## Continuation method (resume without re-reading everything)

1. **Start:** dual-graph `graph_continue` → `graph_scan(pwd)` if `needs_project` → `graph_read`
   only recommended files. No broad grep / whole-repo reads.
2. **During:** `graph_add_memory` for decisions/tasks/blockers; `graph_register_edit` after edits.
3. **End / after a crash:** update [`../CONTEXT.md`](../CONTEXT.md) (Current Task / Key Decisions /
   Next Steps) — it is the fast resume point.

## Index

- [phase-0-foundation.md](phase-0-foundation.md) — monorepo, config, design system, clients, scaffolder
- [phase-1-storefront-ux.md](phase-1-storefront-ux.md) — search, cart, shopping lists, checkout
