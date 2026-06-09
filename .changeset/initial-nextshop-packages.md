---
"@nextshop/config": minor
"@nextshop/ui": minor
"@nextshop/commerce-core": minor
"@nextshop/tsconfig": minor
"@nextshop/eslint-config": minor
---

Initial published release of the shared NextShop packages (config, ui, commerce-core, tsconfig,
eslint-config) for the factory model — client repos consume these from GitHub Packages and pull
fixes via `pnpm update`. Phase 1 adds commerce-core (cart/search/money) plus search, category
filtering, and a cart drawer in the UI.
