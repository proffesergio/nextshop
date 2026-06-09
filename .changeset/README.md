# Changesets

This folder holds [Changesets](https://github.com/changesets/changesets) — they version and
publish the shared `@nextshop/*` packages (config, ui, tsconfig, eslint-config) to GitHub Packages.

## Workflow

```bash
pnpm changeset            # describe a change + pick semver bump (run after a PR's work)
pnpm version-packages     # apply bumps + update changelogs (usually done by CI)
pnpm release              # publish to GitHub Packages (usually done by CI)
```

The private apps (`storefront`, `clients`, `scripts`) are ignored — they're never published;
they're the template, not shared libraries. Client repos consume the published packages and run
`pnpm update @nextshop/ui @nextshop/config` to pull fixes.
