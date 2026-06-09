/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Per-instance build dir lets several storefronts (different STORE_CLIENT) run
  // concurrently without clobbering each other's .next cache. See testservers/.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: [
    "@nextshop/ui",
    "@nextshop/config",
    "@nextshop/clients",
    "@nextshop/commerce-core",
    "@nextshop/db",
  ],
  env: {
    STORE_CLIENT: process.env.STORE_CLIENT,
  },
  webpack: (config) => {
    // Workspace packages (@nextshop/*) are consumed as TypeScript source and use
    // ESM-style ".js" import specifiers. Tell webpack a ".js" request may resolve
    // to a ".ts"/".tsx" file so transpilePackages can load them.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

module.exports = nextConfig;
