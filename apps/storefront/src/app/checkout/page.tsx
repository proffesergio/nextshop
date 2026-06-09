import { getStoreConfig } from "@/lib/store";
import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  const config = getStoreConfig();
  return <CheckoutForm config={config} />;
}
