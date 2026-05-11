import { apiClient, withAuthRetry } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AutomationJob,
  CreateBroadcastPayload,
  CreateSchedulerPayload,
  EngagementDashboard,
  NotificationBroadcast,
  NotificationRule,
  BroadcastStats,
  UpsertNotificationRulePayload,
} from "@/types/engagement";

export const engagementClientService = {
  getDashboard: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<EngagementDashboard>>("/api/engagement/dashboard"),
    ),

  createBroadcast: (payload: CreateBroadcastPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<NotificationBroadcast>>(
        "/api/engagement/broadcasts",
        payload,
      ),
    ),

  sendBroadcast: (id: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<NotificationBroadcast>>(
        `/api/engagement/broadcasts/${id}/send`,
      ),
    ),

  duplicateBroadcast: (id: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<NotificationBroadcast>>(
        `/api/engagement/broadcasts/${id}/duplicate`,
      ),
    ),

  deleteBroadcast: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/engagement/broadcasts/${id}`,
      ),
    ),

  getBroadcastStats: (id: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<BroadcastStats>>(
        `/api/engagement/broadcasts/${id}/stats`,
      ),
    ),

  updateRule: (id: number, payload: Partial<UpsertNotificationRulePayload>) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<NotificationRule>>(
        `/api/engagement/notification-rules/${id}`,
        payload,
      ),
    ),

  createRule: (payload: UpsertNotificationRulePayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<NotificationRule>>(
        "/api/engagement/notification-rules",
        payload,
      ),
    ),

  deleteRule: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/engagement/notification-rules/${id}`,
      ),
    ),

  createScheduler: (payload: CreateSchedulerPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<AutomationJob>>(
        "/api/engagement/schedulers",
        payload,
      ),
    ),

  updateScheduler: (id: number, payload: Partial<CreateSchedulerPayload>) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<AutomationJob>>(
        `/api/engagement/schedulers/${id}`,
        payload,
      ),
    ),

  runScheduler: (id: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<unknown>>(`/api/engagement/schedulers/${id}/run`),
    ),

  deleteScheduler: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/engagement/schedulers/${id}`,
      ),
    ),
};
