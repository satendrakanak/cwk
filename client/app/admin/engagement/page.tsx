import { EngagementDashboardLoader } from "@/components/admin/engagement/engagement-dashboard-loader";
import { engagementServerService } from "@/services/engagement/engagement.server";
import type { EngagementDashboard } from "@/types/engagement";

const emptyData: EngagementDashboard = {
  summary: {
    activeSchedulers: 0,
    enabledRules: 0,
    broadcastsSent: 0,
    scheduledBroadcasts: 0,
  },
  jobs: [],
  rules: [],
  broadcasts: [],
};

export default async function EngagementPage() {
  let data = emptyData;

  try {
    const response = await engagementServerService.getDashboard();
    data = response.data;
  } catch (error) {
    console.error(error);
  }

  return <EngagementDashboardLoader initialData={data} />;
}
