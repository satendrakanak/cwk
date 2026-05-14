import { AccessControlDashboard } from "@/components/admin/settings/access-control-dashboard";
import { LockedContentNotice } from "@/components/admin/shared/locked-content-notice";
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
    return (
      <LockedContentNotice
        title="Access control is locked"
        description={getErrorMessage(error)}
      />
    );
  }

  return <AccessControlDashboard data={data} />;
};

export default AccessControlPage;
