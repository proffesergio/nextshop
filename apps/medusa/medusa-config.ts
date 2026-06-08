import { defineConfig } from "@medusajs/utils";

// Load required env vars — fail fast at boot rather than at runtime.
const DATABASE_URL = process.env.DATABASE_URL!;
const JWT_SECRET = process.env.JWT_SECRET ?? "supersecret";
const COOKIE_SECRET = process.env.COOKIE_SECRET ?? "supersecret";

const STORE_CORS = process.env.STORE_CORS ?? "http://localhost:3000";
const ADMIN_CORS = process.env.ADMIN_CORS ?? "http://localhost:9000";
const AUTH_CORS = process.env.AUTH_CORS ?? "http://localhost:3000,http://localhost:9000";

export default defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseDriverOptions: {
      connection: { ssl: false },
    },
    http: {
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
    // Optional: use Redis for event bus and workflow engine when available.
    redisUrl: process.env.REDIS_URL,
  },
  admin: {
    // Admin dashboard served at /app by default.
    disable: false,
  },
  modules: [
    // Event bus: use Redis when REDIS_URL is set, fall back to in-memory.
    ...(process.env.REDIS_URL
      ? [
          {
            resolve: "@medusajs/event-bus-redis",
            options: { redisUrl: process.env.REDIS_URL },
          },
          {
            resolve: "@medusajs/workflow-engine-redis",
            options: { redis: { url: process.env.REDIS_URL } },
          },
        ]
      : [
          { resolve: "@medusajs/event-bus-local" },
          { resolve: "@medusajs/workflow-engine-inmemory" },
        ]),
    // Cache: in-memory is fine for development; swap to cache-redis in production.
    { resolve: "@medusajs/cache-inmemory" },
  ],
});
