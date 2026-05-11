import CheckoutClient from "@/components/checkout/checkout-client";
import { getErrorMessage } from "@/lib/error-handler";
import { settingsServerService } from "@/services/settings/settings.server";
import { Gateway } from "@/types/settings";

export default async function CheckoutPage() {
  let gateways: Gateway[] = [];
  try {
    const response = await settingsServerService.getGatewaysInfo();
    gateways = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return <CheckoutClient gateways={gateways} />;
}
