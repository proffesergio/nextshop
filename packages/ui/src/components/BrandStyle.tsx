import { brandToCssString, type StoreConfig } from "@nextshop/config";

/**
 * Injects a client's brand tokens as CSS custom properties on :root.
 * Render this once near the top of the app (it is SSR-safe — just a <style>).
 * Switching STORE_CLIENT swaps the whole palette with zero code changes.
 */
export function BrandStyle({ config }: { config: StoreConfig }) {
  return <style dangerouslySetInnerHTML={{ __html: `:root{${brandToCssString(config)}}` }} />;
}
