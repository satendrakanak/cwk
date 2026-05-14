import { LicenseAdminClient } from "@/components/admin/licenses/license-admin-client";
import { licenseServerService } from "@/services/licenses/license.server";

export const dynamic = "force-dynamic";

export default async function AdminLicensePage() {
  const response = await licenseServerService.getCurrent();

  return <LicenseAdminClient initialSummary={response.data} />;
}
