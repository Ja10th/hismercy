import { getAppSettings } from "@/lib/settings";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getAppSettings();
  return <CheckoutClient deliverySettings={settings.delivery} />;
}