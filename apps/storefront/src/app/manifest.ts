import type { MetadataRoute } from "next";
import { getStoreConfig } from "@/lib/store";

/** PWA manifest, generated per active client from its StoreConfig. */
export default function manifest(): MetadataRoute.Manifest {
  const config = getStoreConfig();
  return {
    name: config.brand.name,
    short_name: config.brand.name,
    description: `Shop ${config.brand.name} online.`,
    start_url: "/",
    display: "standalone",
    background_color: config.brand.colors.background,
    theme_color: config.brand.colors.primary,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
