import { AccessControlDashboard } from "@/components/admin/settings/access-control-dashboard";
import { getErrorMessage } from "@/lib/error-handler";
import { accessControlServerService } from "@/services/access-control/access-control.server";
import { AccessControlDashboardData } from "@/types/access-control";

const AccessControlPage = async () => {
  let data: AccessControlDashboardData = {
    roles: [],
    permissions: [],
  };

  try {
    const response = await accessControlServerService.getDashboard();
    data = response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return <AccessControlDashboard data={data} />;
};

export default AccessControlPage;
