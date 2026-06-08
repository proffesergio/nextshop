# @nextshop/medusa

Medusa v2 backend for the Storefront Factory. Provides the commerce API,
admin dashboard, and seed data for all storefronts.

## Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- (Optional) Redis — enables distributed event bus and workflow engine

## Setup

```bash
cp apps/medusa/.env.template apps/medusa/.env
# Edit apps/medusa/.env — fill in DATABASE_URL, JWT_SECRET, COOKIE_SECRET
```

## Run migrations and start

```bash
# Apply DB schema
pnpm --filter @nextshop/medusa exec medusa db:migrate

# Start the server (hot-reloads in dev)
pnpm --filter @nextshop/medusa dev
```

Admin dashboard is available at `http://localhost:9000/app`.

## Seed sample data

After the server has started at least once (so Medusa registers its modules):

```bash
pnpm --filter @nextshop/medusa seed
```

This creates a Europe/EUR region, a default sales channel, a warehouse stock
location, and sample grocery + clothing products (including a Bangladesh-sourced
Alphonso Mango and export-quality clothing for the FreeStyleBD storefront).

## Build for production

```bash
pnpm --filter @nextshop/medusa build
```

Output is written to `.medusa/server`.
