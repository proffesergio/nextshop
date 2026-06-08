import type { Metadata, Viewport } from "next";
import { BrandStyle } from "@nextshop/ui";
import "@nextshop/ui/styles.css";
import { getStoreConfig } from "@/lib/store";

const config = getStoreConfig();

export const metadata: Metadata = {
  title: `${config.brand.name} — Fresh online store`,
  description: `Shop ${config.brand.name} online. Fast, fresh, delivered.`,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: config.brand.name },
};

export const viewport: Viewport = {
  themeColor: config.brand.colors.primary,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={config.locales.default}>
      <head>
        <BrandStyle config={config} />
      </head>
      <body>{children}</body>
    </html>
  );
}
