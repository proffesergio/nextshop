import { notFound } from "next/navigation";
import { Page } from "@nextshop/ui";
import { getStoreConfig } from "@/lib/store";
import { getStoreRepository } from "@/lib/products";
import { OrderTracking } from "@/components/OrderTracking";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage({ params }: Props) {
  const { id } = await params;
  const config = getStoreConfig();
  const order = await getStoreRepository().getOrder(id);
  if (!order) notFound();
  return (
    <Page>
      <main className="u-container" style={{ padding: "var(--space-6) 0", maxWidth: 720 }}>
        <a href="/" style={{ textDecoration: "none", opacity: 0.7, fontWeight: 500 }}>
          ← Back to {config.brand.name}
        </a>
        <div style={{ marginTop: "var(--space-4)" }}>
          <OrderTracking initial={order} gps={config.featureFlags.gpsTracking} locale={config.locales.default} />
        </div>
      </main>
    </Page>
  );
}
