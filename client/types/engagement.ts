export type EngagementAudience =
  | "all_users"
  | "enrolled_users"
  | "course_enrolled"
  | "selected_users"
  | "role";

export type NotificationChannel = "in_app" | "push" | "email";

export type AutomationJobStatus = "active" | "paused";
export type AutomationTriggerType = "cron" | "one_time" | "event";
export type BroadcastStatus = "draft" | "scheduled" | "sent" | "failed";

export type NotificationRule = {
  id: number;
  eventKey: string;
  label: string;
  description?: string | null;
  isEnabled: boolean;
  audience: EngagementAudience;
  channels: NotificationChannel[];
  type: string;
  titleTemplate: string;
  messageTemplate: string;
  hrefTemplate?: string | null;
  imageUrl?: string | null;
  filters?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationBroadcast = {
  id: number;
  title: string;
  message: string;
  href?: string | null;
  imageUrl?: string | null;
  type: string;
  audience: EngagementAudience;
  channels: NotificationChannel[];
  audienceFilters?: Record<string, unknown> | null;
  status: BroadcastStatus;
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  deliveredCount: number;
  failureReason?: string | null;
  stats?: BroadcastStats;
  createdAt: string;
  updatedAt: string;
};

export type BroadcastStats = {
  totalRecipients: number;
  notificationsCreated: number;
  delivered: number;
  failed: number;
  read: number;
  clicked: number;
  readRate: number;
  clickRate: number;
};

export type AutomationJob = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  status: AutomationJobStatus;
  triggerType: AutomationTriggerType;
  cronExpression?: string | null;
  timezone: string;
  eventKey?: string | null;
  actionType: string;
  actionPayload?: Record<string, unknown> | null;
  conditions?: Record<string, unknown> | null;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  runCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
};

export type EngagementDashboard = {
  summary: {
    activeSchedulers: number;
    enabledRules: number;
    broadcastsSent: number;
    scheduledBroadcasts: number;
  };
  jobs: AutomationJob[];
  rules: NotificationRule[];
  broadcasts: NotificationBroadcast[];
};

export type CreateBroadcastPayload = {
  title: string;
  message: string;
  href?: string | null;
  imageUrl?: string | null;
  type?: string;
  audience: EngagementAudience;
  channels: NotificationChannel[];
  audienceFilters?: Record<string, unknown> | null;
  selectedUserIds?: number[];
  sendNow?: boolean;
};

export type UpsertNotificationRulePayload = {
  eventKey: string;
  label: string;
  description?: string | null;
  isEnabled?: boolean;
  audience: EngagementAudience;
  channels?: NotificationChannel[];
  type?: string;
  titleTemplate: string;
  messageTemplate: string;
  hrefTemplate?: string | null;
  imageUrl?: string | null;
  filters?: Record<string, unknown> | null;
};

export type CreateSchedulerPayload = {
  name: string;
  description?: string | null;
  status: AutomationJobStatus;
  triggerType: AutomationTriggerType;
  cronExpression?: string | null;
  timezone?: string;
  eventKey?: string | null;
  actionType?: string;
  actionPayload?: Record<string, unknown> | null;
  conditions?: Record<string, unknown> | null;
};
