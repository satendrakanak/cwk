"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Bell,
  CalendarClock,
  Copy,
  Eye,
  Image as ImageIcon,
  Megaphone,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Users as UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MediaModal } from "@/components/media/media-modal";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { engagementClientService } from "@/services/engagement/engagement.client";
import { userClientService } from "@/services/users/user.client";
import { courseClientService } from "@/services/courses/course.client";
import type { Course } from "@/types/course";
import type {
  AutomationJob,
  CreateBroadcastPayload,
  CreateSchedulerPayload,
  EngagementAudience,
  EngagementDashboard,
  NotificationBroadcast,
  NotificationChannel,
  NotificationRule,
  UpsertNotificationRulePayload,
} from "@/types/engagement";
import type { User } from "@/types/user";
import type { FileType } from "@/types/file";
import { formatDateTime } from "@/utils/formate-date";

const channelOptions: Array<{ value: NotificationChannel; label: string }> = [
  { value: "in_app", label: "In-app" },
  { value: "push", label: "Push" },
  { value: "email", label: "Email" },
];

const audienceOptions: Array<{ value: EngagementAudience; label: string }> = [
  { value: "all_users", label: "All users" },
  { value: "enrolled_users", label: "Users enrolled in any course" },
  { value: "course_enrolled", label: "Users enrolled in one course" },
  { value: "selected_users", label: "Selected users" },
  { value: "role", label: "Role based" },
];

type ScheduleFrequency = "daily" | "weekly" | "monthly" | "custom";

type ReadableSchedule = {
  frequency: ScheduleFrequency;
  time: string;
  dayOfWeek: string;
  dayOfMonth: string;
};

const defaultReadableSchedule: ReadableSchedule = {
  frequency: "daily",
  time: "09:00",
  dayOfWeek: "1",
  dayOfMonth: "1",
};

const weekDays = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const defaultBroadcast: CreateBroadcastPayload = {
  title: "",
  message: "",
  href: "",
  imageUrl: "",
  audience: "all_users",
  channels: ["in_app", "push"],
  audienceFilters: {},
  selectedUserIds: [],
  sendNow: true,
};

const defaultScheduler: CreateSchedulerPayload = {
  name: "",
  description: "",
  status: "paused",
  triggerType: "cron",
  cronExpression: "0 9 * * *",
  timezone: "Asia/Kolkata",
  actionType: "notification_broadcast",
  actionPayload: {
    title: "",
    message: "",
    audience: "all_users",
  },
};

const defaultRule: UpsertNotificationRulePayload = {
  eventKey: "",
  label: "",
  description: "",
  isEnabled: true,
  audience: "all_users",
  channels: ["in_app", "push"],
  type: "info",
  titleTemplate: "",
  messageTemplate: "",
  hrefTemplate: "",
  imageUrl: "",
  filters: {},
};

export function EngagementDashboardClient({
  initialData,
}: {
  initialData: EngagementDashboard;
}) {
  const [data, setData] = useState(initialData);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] =
    useState<CreateBroadcastPayload>(defaultBroadcast);
  const [schedulerForm, setSchedulerForm] =
    useState<CreateSchedulerPayload>(defaultScheduler);
  const [ruleForm, setRuleForm] =
    useState<UpsertNotificationRulePayload>(defaultRule);
  const [editingScheduler, setEditingScheduler] = useState<AutomationJob | null>(
    null,
  );
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [deleteSchedulerTarget, setDeleteSchedulerTarget] =
    useState<AutomationJob | null>(null);
  const [deleteRuleTarget, setDeleteRuleTarget] =
    useState<NotificationRule | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [schedulerUserSearch, setSchedulerUserSearch] = useState("");
  const [mediaTarget, setMediaTarget] = useState<
    "broadcast" | "scheduler" | "rule" | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  useEffect(() => {
    void Promise.all([
      userClientService.list({ limit: 30 }).then((response) => {
        setUsers(response.data.data);
      }),
      courseClientService.getAll().then((response) => {
        setCourses(response.data.data);
      }),
    ]).catch(() => undefined);
  }, []);

  const selectedUsers = useMemo(() => {
    const selectedIds = new Set(broadcastForm.selectedUserIds ?? []);
    return users.filter((user) => selectedIds.has(user.id));
  }, [broadcastForm.selectedUserIds, users]);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshingStats(true);
    try {
      const response = await engagementClientService.getDashboard();
      setData(response.data);
    } catch {
      // Keep the dashboard usable if a background stats refresh misses once.
    } finally {
      setIsRefreshingStats(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshDashboard();
      }
    }, 5_000);

    return () => window.clearInterval(interval);
  }, [refreshDashboard]);

  async function handleBroadcastSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await engagementClientService.createBroadcast(normalizeBroadcastPayload(broadcastForm));
      toast.success(broadcastForm.sendNow ? "Notification sent" : "Broadcast saved");
      setBroadcastOpen(false);
      setBroadcastForm(defaultBroadcast);
      await refreshDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send broadcast");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSchedulerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingScheduler) {
        await engagementClientService.updateScheduler(
          editingScheduler.id,
          schedulerForm,
        );
      } else {
        await engagementClientService.createScheduler(schedulerForm);
      }
      toast.success(editingScheduler ? "Scheduler updated" : "Scheduler saved");
      setSchedulerOpen(false);
      setEditingScheduler(null);
      setSchedulerForm(defaultScheduler);
      await refreshDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save scheduler");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRuleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingRule) {
        await engagementClientService.updateRule(editingRule.id, ruleForm);
      } else {
        await engagementClientService.createRule(ruleForm);
      }
      toast.success(editingRule ? "Rule updated" : "Rule saved");
      setRuleOpen(false);
      setEditingRule(null);
      setRuleForm(defaultRule);
      await refreshDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save rule");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleRule(rule: NotificationRule, isEnabled: boolean) {
    try {
      await engagementClientService.updateRule(rule.id, { isEnabled });
      await refreshDashboard();
      toast.success(isEnabled ? "Rule enabled" : "Rule disabled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update rule");
    }
  }

  async function toggleScheduler(job: AutomationJob) {
    try {
      await engagementClientService.updateScheduler(job.id, {
        status: job.status === "active" ? "paused" : "active",
      });
      await refreshDashboard();
      toast.success(job.status === "active" ? "Scheduler paused" : "Scheduler activated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update scheduler");
    }
  }

  async function runScheduler(job: AutomationJob) {
    try {
      await engagementClientService.runScheduler(job.id);
      await refreshDashboard();
      toast.success("Scheduler executed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not run scheduler");
    }
  }

  async function deleteScheduler(job: AutomationJob) {
    try {
      await engagementClientService.deleteScheduler(job.id);
      await refreshDashboard();
      setDeleteSchedulerTarget(null);
      toast.success("Scheduler deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete scheduler");
    }
  }

  async function deleteRule(rule: NotificationRule) {
    try {
      await engagementClientService.deleteRule(rule.id);
      await refreshDashboard();
      setDeleteRuleTarget(null);
      toast.success("Rule deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete rule");
    }
  }

  function openCreateScheduler() {
    setEditingScheduler(null);
    setSchedulerForm(defaultScheduler);
    setSchedulerOpen(true);
  }

  function openEditScheduler(job: AutomationJob) {
    setEditingScheduler(job);
    setSchedulerForm({
      name: job.name,
      description: job.description ?? "",
      status: job.status,
      triggerType: job.triggerType,
      cronExpression: job.cronExpression ?? "0 9 * * *",
      timezone: job.timezone || "Asia/Kolkata",
      eventKey: job.eventKey ?? null,
      actionType: job.actionType,
      actionPayload: job.actionPayload ?? {},
      conditions: job.conditions ?? {},
    });
    setSchedulerOpen(true);
  }

  function openCreateRule() {
    setEditingRule(null);
    setRuleForm(defaultRule);
    setRuleOpen(true);
  }

  function openEditRule(rule: NotificationRule) {
    setEditingRule(rule);
    setRuleForm({
      eventKey: rule.eventKey,
      label: rule.label,
      description: rule.description ?? "",
      isEnabled: rule.isEnabled,
      audience: rule.audience,
      channels: rule.channels,
      type: rule.type,
      titleTemplate: rule.titleTemplate,
      messageTemplate: rule.messageTemplate,
      hrefTemplate: rule.hrefTemplate ?? "",
      imageUrl: rule.imageUrl ?? "",
      filters: rule.filters ?? {},
    });
    setRuleOpen(true);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-(--brand-100) bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] p-6 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex rounded-full border border-(--brand-200) bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-(--brand-700) dark:border-white/10 dark:bg-white/8 dark:text-[var(--brand-200)]">
              Engagement
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Automation & notifications
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Manage dynamic schedulers, automatic notification rules, and custom
                broadcasts from one admin workspace.
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            <Dialog
              open={schedulerOpen}
              onOpenChange={(open) => {
                setSchedulerOpen(open);
                if (!open) {
                  setEditingScheduler(null);
                  setSchedulerForm(defaultScheduler);
                }
              }}
            >
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={openCreateScheduler}
              >
                <CalendarClock className="size-4" />
                New scheduler
              </Button>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingScheduler ? "Edit scheduler" : "Create scheduler"}
                  </DialogTitle>
                </DialogHeader>
                <SchedulerForm
                  form={schedulerForm}
                  setForm={setSchedulerForm}
                  users={users}
                  courses={courses}
                  userSearch={schedulerUserSearch}
                  setUserSearch={setSchedulerUserSearch}
                  onChooseImage={() => setMediaTarget("scheduler")}
                  isSaving={isSaving}
                  onSubmit={handleSchedulerSubmit}
                />
              </DialogContent>
            </Dialog>
            <Dialog
              open={ruleOpen}
              onOpenChange={(open) => {
                setRuleOpen(open);
                if (!open) {
                  setEditingRule(null);
                  setRuleForm(defaultRule);
                }
              }}
            >
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={openCreateRule}
              >
                <Settings2 className="size-4" />
                New rule
              </Button>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? "Edit notification rule" : "Create notification rule"}
                  </DialogTitle>
                </DialogHeader>
                <RuleForm
                  form={ruleForm}
                  setForm={setRuleForm}
                  onChooseImage={() => setMediaTarget("rule")}
                  isSaving={isSaving}
                  onSubmit={handleRuleSubmit}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl">
                  <Send className="size-4" />
                  Send notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Custom notification</DialogTitle>
                </DialogHeader>
                <BroadcastForm
                  form={broadcastForm}
                  setForm={setBroadcastForm}
                  users={users}
                  courses={courses}
                  selectedUsers={selectedUsers}
                  userSearch={userSearch}
                  setUserSearch={setUserSearch}
                  onChooseImage={() => setMediaTarget("broadcast")}
                  isSaving={isSaving}
                  onSubmit={handleBroadcastSubmit}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SummaryCard icon={CalendarClock} label="Active schedulers" value={data.summary.activeSchedulers} />
          <SummaryCard icon={Settings2} label="Enabled rules" value={data.summary.enabledRules} />
          <SummaryCard icon={Megaphone} label="Sent broadcasts" value={data.summary.broadcastsSent} />
          <SummaryCard icon={Bell} label="Scheduled" value={data.summary.scheduledBroadcasts} />
        </div>
      </section>

      <Tabs defaultValue="broadcasts" className="space-y-4">
        <TabsList className="h-auto flex-wrap rounded-2xl p-1">
          <TabsTrigger value="broadcasts" className="rounded-xl">
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="rules" className="rounded-xl">
            Notification rules
          </TabsTrigger>
          <TabsTrigger value="schedulers" className="rounded-xl">
            Dynamic schedulers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts">
          <BroadcastsPanel
            broadcasts={data.broadcasts}
            isRefreshing={isRefreshingStats}
            onRefresh={refreshDashboard}
            onSend={async (id) => {
              await engagementClientService.sendBroadcast(id);
              await refreshDashboard();
              toast.success("Broadcast sent");
            }}
            onDuplicate={async (id) => {
              await engagementClientService.duplicateBroadcast(id);
              await refreshDashboard();
              toast.success("Broadcast copy created");
            }}
            onDelete={async (id) => {
              await engagementClientService.deleteBroadcast(id);
              await refreshDashboard();
              toast.success("Broadcast deleted");
            }}
            onUseAsTemplate={(broadcast) => {
              setBroadcastForm({
                title: broadcast.title,
                message: broadcast.message,
                href: broadcast.href ?? "",
                imageUrl: broadcast.imageUrl ?? "",
                audience: broadcast.audience,
                channels: broadcast.channels,
                audienceFilters: broadcast.audienceFilters ?? {},
                selectedUserIds:
                  Array.isArray(broadcast.audienceFilters?.selectedUserIds)
                    ? broadcast.audienceFilters.selectedUserIds.map(Number)
                    : [],
                sendNow: true,
              });
              setBroadcastOpen(true);
            }}
          />
        </TabsContent>
        <TabsContent value="rules">
          <RulesPanel
            rules={data.rules}
            onCreate={openCreateRule}
            onEdit={openEditRule}
            onDelete={setDeleteRuleTarget}
            onToggle={toggleRule}
          />
        </TabsContent>
        <TabsContent value="schedulers">
          <SchedulersPanel
            jobs={data.jobs}
            onCreate={openCreateScheduler}
            onEdit={openEditScheduler}
            onToggle={toggleScheduler}
            onRun={runScheduler}
            onDelete={setDeleteSchedulerTarget}
          />
        </TabsContent>
      </Tabs>

      <MediaModal
        open={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        previewType="image"
        onSelect={(file: FileType) => {
          if (mediaTarget === "broadcast") {
            setBroadcastForm((current) => ({
              ...current,
              imageUrl: file.path,
            }));
          }

          if (mediaTarget === "scheduler") {
            setSchedulerForm((current) => ({
              ...current,
              actionPayload: {
                ...(current.actionPayload ?? {}),
                imageUrl: file.path,
              },
            }));
          }

          if (mediaTarget === "rule") {
            setRuleForm((current) => ({
              ...current,
              imageUrl: file.path,
            }));
          }

          setMediaTarget(null);
        }}
      />

      <ConfirmDeleteDialog
        deleteText="scheduler"
        open={Boolean(deleteSchedulerTarget)}
        onClose={() => setDeleteSchedulerTarget(null)}
        onConfirm={() => deleteSchedulerTarget && void deleteScheduler(deleteSchedulerTarget)}
      />

      <ConfirmDeleteDialog
        deleteText="notification rule"
        open={Boolean(deleteRuleTarget)}
        onClose={() => setDeleteRuleTarget(null)}
        onConfirm={() => deleteRuleTarget && void deleteRule(deleteRuleTarget)}
      />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
        <Icon className="size-5 text-(--brand-600)" />
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function BroadcastsPanel({
  broadcasts,
  isRefreshing,
  onRefresh,
  onSend,
  onDuplicate,
  onDelete,
  onUseAsTemplate,
}: {
  broadcasts: NotificationBroadcast[];
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onSend: (id: number) => Promise<void>;
  onDuplicate: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUseAsTemplate: (broadcast: NotificationBroadcast) => void;
}) {
  return (
    <Card className="rounded-[28px]">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-5" />
          Broadcast history
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full rounded-xl sm:w-auto"
          disabled={isRefreshing}
          onClick={() => void onRefresh()}
        >
          <RefreshCw className={["size-4", isRefreshing ? "animate-spin" : ""].join(" ")} />
          Refresh stats
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {broadcasts.length ? (
          broadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className="rounded-2xl border p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950 dark:text-white">{broadcast.title}</h3>
                    <Badge variant={broadcast.status === "sent" ? "default" : "secondary"}>
                      {broadcast.status}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {broadcast.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    Created {formatDateTime(broadcast.createdAt)}
                    {broadcast.sentAt ? ` • Sent ${formatDateTime(broadcast.sentAt)}` : ""}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-xl"
                      aria-label="Open broadcast actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {broadcast.status !== "sent" ? (
                      <DropdownMenuItem onClick={() => onSend(broadcast.id)}>
                        <Send className="size-4" />
                        Send now
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => onUseAsTemplate(broadcast)}>
                      <Copy className="size-4" />
                      Edit and resend
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(broadcast.id)}>
                      <Copy className="size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(broadcast.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <BroadcastMetric label="Total" value={broadcast.stats?.totalRecipients ?? broadcast.recipientCount} icon={UsersIcon} />
                <BroadcastMetric label="Sent" value={broadcast.stats?.delivered ?? broadcast.deliveredCount} icon={Send} />
                <BroadcastMetric label="Failed" value={broadcast.stats?.failed ?? 0} icon={Bell} />
                <BroadcastMetric label="Read" value={broadcast.stats?.read ?? 0} icon={Eye} />
                <BroadcastMetric label="Clicked" value={broadcast.stats?.clicked ?? 0} icon={MousePointerClick} />
                <BroadcastMetric label="CTR" value={`${broadcast.stats?.clickRate ?? 0}%`} icon={Sparkles} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No broadcasts yet" description="Festival offers, announcements, and course alerts will appear here." />
        )}
      </CardContent>
    </Card>
  );
}

function BroadcastMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 px-3 py-2 dark:bg-white/6">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{label}</span>
        <Icon className="size-3.5 text-(--brand-600)" />
      </div>
      <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function RulesPanel({
  rules,
  onCreate,
  onEdit,
  onDelete,
  onToggle,
}: {
  rules: NotificationRule[];
  onCreate: () => void;
  onEdit: (rule: NotificationRule) => void;
  onDelete: (rule: NotificationRule) => void;
  onToggle: (rule: NotificationRule, isEnabled: boolean) => Promise<void>;
}) {
  return (
    <Card className="rounded-[28px]">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="size-5" />
          Automatic rules
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full rounded-xl sm:w-auto"
          onClick={onCreate}
        >
          <Plus className="size-4" />
          Add rule
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {rules.length ? (
          rules.map((rule) => (
            <div key={rule.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-(--brand-600)">
                    {rule.eventKey}
                  </p>
                  <h3 className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {rule.label}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {rule.description || "No description added."}
                  </p>
                </div>
                <Switch
                  checked={rule.isEnabled}
                  onCheckedChange={(value) => onToggle(rule, value)}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{audienceLabel(rule.audience)}</Badge>
                {rule.channels.map((channel) => (
                  <Badge key={channel} variant="outline">{channelLabel(channel)}</Badge>
                ))}
              </div>
              <div className="mt-4 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">{rule.titleTemplate}</p>
                <p className="mt-1 line-clamp-2">{rule.messageTemplate}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => onEdit(rule)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => onDelete(rule)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2">
            <EmptyState
              title="No notification rules yet"
              description="Create automatic event-based rules such as class reminders, exam results, and course updates."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SchedulersPanel({
  jobs,
  onCreate,
  onEdit,
  onToggle,
  onRun,
  onDelete,
}: {
  jobs: AutomationJob[];
  onCreate: () => void;
  onEdit: (job: AutomationJob) => void;
  onToggle: (job: AutomationJob) => Promise<void>;
  onRun: (job: AutomationJob) => Promise<void>;
  onDelete: (job: AutomationJob) => void;
}) {
  return (
    <Card className="rounded-[28px]">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-5" />
          Dynamic schedulers
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full rounded-xl sm:w-auto"
          onClick={onCreate}
        >
          <Plus className="size-4" />
          Add scheduler
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length ? (
          jobs.map((job) => (
            <div key={job.id} className="rounded-2xl border p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950 dark:text-white">{job.name}</h3>
                    <Badge variant={job.status === "active" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{job.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {describeSchedule(job)} • Runs: {job.runCount} • Failures: {job.failureCount}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onRun(job)}>
                    <Play className="size-4" />
                    Run
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onEdit(job)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onToggle(job)}>
                    {job.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => onDelete(job)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No schedulers yet" description="Create reusable cron jobs for future automation without hardcoding." />
        )}
      </CardContent>
    </Card>
  );
}

function BroadcastForm({
  form,
  setForm,
  users,
  courses,
  selectedUsers,
  userSearch,
  setUserSearch,
  onChooseImage,
  isSaving,
  onSubmit,
}: {
  form: CreateBroadcastPayload;
  setForm: (form: CreateBroadcastPayload) => void;
  users: User[];
  courses: Course[];
  selectedUsers: User[];
  userSearch: string;
  setUserSearch: (value: string) => void;
  onChooseImage: () => void;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName ?? ""} ${user.email}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );

  const courseId = String(form.audienceFilters?.courseId ?? "");

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </Field>
        <Field label="Target">
          <Select value={form.audience} onValueChange={(value) => setForm({ ...form, audience: value as EngagementAudience })}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Message">
        <Textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Action link">
          <Input value={form.href ?? ""} onChange={(event) => setForm({ ...form, href: event.target.value })} placeholder="/courses" />
        </Field>
        <NotificationImageField
          label="Notification image"
          value={form.imageUrl ?? ""}
          onChoose={onChooseImage}
          onClear={() => setForm({ ...form, imageUrl: "" })}
        />
      </div>
      {form.audience === "course_enrolled" ? (
        <Field label="Course">
          <Select
            value={courseId}
            onValueChange={(value) =>
              setForm({
                ...form,
                audienceFilters: { ...(form.audienceFilters ?? {}), courseId: Number(value) },
              })
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}
      {form.audience === "selected_users" ? (
        <div className="rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Select users</p>
              <p className="text-sm text-slate-500">Search and pick recipients without a long dropdown.</p>
            </div>
            <Badge variant="secondary">{selectedUsers.length} selected</Badge>
          </div>
          <Input className="mt-3" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users" />
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
            {filteredUsers.map((user) => {
              const checked = form.selectedUserIds?.includes(user.id) ?? false;
              return (
                <label key={user.id} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => {
                      const current = new Set(form.selectedUserIds ?? []);
                      if (value) current.add(user.id);
                      else current.delete(user.id);
                      setForm({ ...form, selectedUserIds: [...current] });
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{user.firstName} {user.lastName}</span>
                    <span className="block truncate text-xs text-slate-500">{user.email}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        {channelOptions.map((channel) => (
          <label key={channel.value} className="flex items-center gap-3 rounded-2xl border p-3">
            <Checkbox
              checked={form.channels.includes(channel.value)}
              onCheckedChange={(value) => {
                const current = new Set(form.channels);
                if (value) current.add(channel.value);
                else current.delete(channel.value);
                setForm({ ...form, channels: [...current] as NotificationChannel[] });
              }}
            />
            <span>{channel.label}</span>
          </label>
        ))}
      </div>
      <label className="flex items-center justify-between rounded-2xl border p-4">
        <span>
          <span className="block font-semibold">Send immediately</span>
          <span className="text-sm text-slate-500">
            Keep this on to send now. Turn it off to save this broadcast as a
            draft.
          </span>
        </span>
        <Switch checked={Boolean(form.sendNow)} onCheckedChange={(value) => setForm({ ...form, sendNow: value })} />
      </label>
      <Button className="w-full rounded-2xl" disabled={isSaving}>
        <Send className="size-4" />
        {isSaving ? "Sending..." : "Send notification"}
      </Button>
    </form>
  );
}

function RuleForm({
  form,
  setForm,
  onChooseImage,
  isSaving,
  onSubmit,
}: {
  form: UpsertNotificationRulePayload;
  setForm: (form: UpsertNotificationRulePayload) => void;
  onChooseImage: () => void;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="rounded-2xl border bg-muted/35 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Notification rules kya hain?</p>
        <p className="mt-1 leading-6">
          Rule ek event based automation hai. Jaise future me
          <span className="font-medium text-foreground"> class_created</span>,
          <span className="font-medium text-foreground"> exam_passed</span>, ya
          <span className="font-medium text-foreground"> order_completed</span>
          event trigger hoga, toh ye rule decide karega notification kisko,
          kis channel par, kis title/message ke sath bhejna hai.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Event key">
          <Input
            value={form.eventKey}
            onChange={(event) => setForm({ ...form, eventKey: event.target.value })}
            placeholder="class_created"
            required
          />
        </Field>
        <Field label="Rule label">
          <Input
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
            placeholder="Class created notification"
            required
          />
        </Field>
      </div>

      <Field label="Description">
        <Textarea
          value={form.description ?? ""}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Explain when this rule should be used."
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Audience">
          <Select
            value={form.audience}
            onValueChange={(value) =>
              setForm({ ...form, audience: value as EngagementAudience })
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Action link template">
          <Input
            value={form.hrefTemplate ?? ""}
            onChange={(event) => setForm({ ...form, hrefTemplate: event.target.value })}
            placeholder="/course/{{courseSlug}}/learn"
          />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {channelOptions.map((channel) => (
          <label key={channel.value} className="flex items-center gap-3 rounded-2xl border p-3">
            <Checkbox
              checked={form.channels?.includes(channel.value) ?? false}
              onCheckedChange={(value) => {
                const current = new Set(form.channels ?? []);
                if (value) current.add(channel.value);
                else current.delete(channel.value);
                setForm({ ...form, channels: [...current] as NotificationChannel[] });
              }}
            />
            <span>{channel.label}</span>
          </label>
        ))}
      </div>

      <Field label="Title template">
        <Input
          value={form.titleTemplate}
          onChange={(event) => setForm({ ...form, titleTemplate: event.target.value })}
          placeholder="{{courseTitle}} class is scheduled"
          required
        />
      </Field>

      <Field label="Message template">
        <Textarea
          value={form.messageTemplate}
          onChange={(event) => setForm({ ...form, messageTemplate: event.target.value })}
          placeholder="Your class starts at {{startTime}}."
          required
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <NotificationImageField
          label="Rule image"
          value={form.imageUrl ?? ""}
          onChoose={onChooseImage}
          onClear={() => setForm({ ...form, imageUrl: "" })}
        />
        <label className="flex items-center justify-between rounded-2xl border p-4">
          <span>
            <span className="block font-semibold">Rule enabled</span>
            <span className="text-sm text-muted-foreground">
              When disabled, this event will not send notifications.
            </span>
          </span>
          <Switch
            checked={Boolean(form.isEnabled)}
            onCheckedChange={(value) => setForm({ ...form, isEnabled: value })}
          />
        </label>
      </div>

      <Button className="w-full rounded-2xl" disabled={isSaving}>
        <Save className="size-4" />
        {isSaving ? "Saving..." : "Save rule"}
      </Button>
    </form>
  );
}

function SchedulerForm({
  form,
  setForm,
  users,
  courses,
  userSearch,
  setUserSearch,
  onChooseImage,
  isSaving,
  onSubmit,
}: {
  form: CreateSchedulerPayload;
  setForm: (form: CreateSchedulerPayload) => void;
  users: User[];
  courses: Course[];
  userSearch: string;
  setUserSearch: (value: string) => void;
  onChooseImage: () => void;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const payload = form.actionPayload ?? {};
  const schedulerAudience = String(payload.audience ?? "all_users") as EngagementAudience;
  const schedulerFilters =
    typeof payload.audienceFilters === "object" && payload.audienceFilters
      ? (payload.audienceFilters as Record<string, unknown>)
      : {};
  const selectedSchedulerUserIds = Array.isArray(schedulerFilters.selectedUserIds)
    ? schedulerFilters.selectedUserIds.map(Number).filter(Boolean)
    : [];
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName ?? ""} ${user.email}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );

  function updateActionPayload(next: Record<string, unknown>) {
    setForm({ ...form, actionPayload: { ...payload, ...next } });
  }

  function updateAudienceFilters(next: Record<string, unknown>) {
    updateActionPayload({
      audienceFilters: {
        ...schedulerFilters,
        ...next,
      },
    });
  }

  const [schedule, setSchedule] = useState<ReadableSchedule>(() =>
    parseReadableSchedule(form.cronExpression),
  );

  useEffect(() => {
    setSchedule(parseReadableSchedule(form.cronExpression));
  }, [form.cronExpression]);

  function updateSchedule(next: Partial<ReadableSchedule>) {
    const nextSchedule = { ...schedule, ...next };
    setSchedule(nextSchedule);
    setForm({
      ...form,
      cronExpression:
        nextSchedule.frequency === "custom"
          ? form.cronExpression
          : buildCronExpression(nextSchedule),
      conditions: {
        ...(form.conditions ?? {}),
        readableSchedule: getSchedulePreview(nextSchedule),
      },
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Scheduler name">
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </Field>
        <Field label="Status">
          <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as "active" | "paused" })}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      </Field>
      <div className="rounded-2xl border p-4">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">When should this run?</p>
          <p className="text-sm text-slate-500">
            Choose timing in normal language. The system will generate the cron
            schedule automatically.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Repeat">
            <Select
              value={schedule.frequency}
              onValueChange={(value) =>
                updateSchedule({ frequency: value as ScheduleFrequency })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Advanced cron</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {schedule.frequency !== "custom" ? (
            <Field label="Time">
              <Input
                type="time"
                value={schedule.time}
                onChange={(event) => updateSchedule({ time: event.target.value })}
                required
              />
            </Field>
          ) : (
            <Field label="Cron expression">
              <Input
                value={form.cronExpression ?? ""}
                onChange={(event) =>
                  setForm({ ...form, cronExpression: event.target.value })
                }
                placeholder="0 9 * * *"
                required
              />
            </Field>
          )}
        </div>

        {schedule.frequency === "weekly" ? (
          <div className="mt-4">
            <Field label="Day">
              <Select
                value={schedule.dayOfWeek}
                onValueChange={(value) => updateSchedule({ dayOfWeek: value })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}

        {schedule.frequency === "monthly" ? (
          <div className="mt-4">
            <Field label="Date of month">
              <Select
                value={schedule.dayOfMonth}
                onValueChange={(value) => updateSchedule({ dayOfMonth: value })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, index) => String(index + 1)).map(
                    (day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl bg-(--brand-50) px-4 py-3 text-sm text-(--brand-800) dark:bg-white/8 dark:text-slate-200">
          {schedule.frequency === "custom"
            ? `Runs using cron: ${form.cronExpression || "not set"}`
            : getSchedulePreview(schedule)}
        </div>

        <Field label="Timezone">
          <Input
            value={form.timezone ?? "Asia/Kolkata"}
            onChange={(event) => setForm({ ...form, timezone: event.target.value })}
          />
        </Field>
      </div>
      <div className="rounded-2xl border p-4">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-(--brand-600)" />
          <p className="font-semibold">Task to perform at this time</p>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          When this scheduler runs, it will send this notification to the
          selected audience.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input
              value={String(payload.title ?? "")}
              onChange={(event) => updateActionPayload({ title: event.target.value })}
              required
            />
          </Field>
          <Field label="Audience">
            <Select
              value={schedulerAudience}
              onValueChange={(value) => updateActionPayload({ audience: value })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {schedulerAudience === "course_enrolled" ? (
          <div className="mt-4">
            <Field label="Course">
              <Select
                value={String(schedulerFilters.courseId ?? "")}
                onValueChange={(value) => updateAudienceFilters({ courseId: Number(value) })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}

        {schedulerAudience === "selected_users" ? (
          <div className="mt-4 rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Custom users</p>
                <p className="text-sm text-slate-500">
                  Scheduler will send only to these selected users.
                </p>
              </div>
              <Badge variant="secondary">{selectedSchedulerUserIds.length} selected</Badge>
            </div>
            <Input
              className="mt-3"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search users"
            />
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {filteredUsers.map((user) => {
                const checked = selectedSchedulerUserIds.includes(user.id);
                return (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        const current = new Set(selectedSchedulerUserIds);
                        if (value) current.add(user.id);
                        else current.delete(user.id);
                        updateAudienceFilters({ selectedUserIds: [...current] });
                      }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {user.email}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {schedulerAudience === "role" ? (
          <div className="mt-4">
            <Field label="Role names">
              <Input
                value={
                  Array.isArray(schedulerFilters.roles)
                    ? schedulerFilters.roles.join(", ")
                    : ""
                }
                onChange={(event) =>
                  updateAudienceFilters({
                    roles: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="student, faculty"
              />
            </Field>
          </div>
        ) : null}

        <Field label="Message">
          <Textarea
            value={String(payload.message ?? "")}
            onChange={(event) => updateActionPayload({ message: event.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Action link">
            <Input
              value={String(payload.href ?? "")}
              onChange={(event) => updateActionPayload({ href: event.target.value })}
              placeholder="/courses"
            />
          </Field>
          <NotificationImageField
            label="Notification image"
            value={String(payload.imageUrl ?? "")}
            onChoose={onChooseImage}
            onClear={() => updateActionPayload({ imageUrl: "" })}
          />
        </div>
      </div>
      <Button className="w-full rounded-2xl" disabled={isSaving}>
        <Save className="size-4" />
        {isSaving ? "Saving..." : "Save scheduler"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed p-10 text-center">
      <Sparkles className="mx-auto size-8 text-(--brand-600)" />
      <p className="mt-3 font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function NotificationImageField({
  label,
  value,
  onChoose,
  onClear,
}: {
  label: string;
  value: string;
  onChoose: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-2xl border p-3">
        <div className="flex items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50 dark:bg-white/6">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="size-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {value ? "Image selected" : "No image selected"}
            </p>
            <p className="mt-1 line-clamp-1 break-all text-xs text-slate-500">
              {value || "Choose from media library"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1 rounded-xl"
            onClick={onChoose}
          >
            <ImageIcon className="size-4" />
            Select media
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-xl"
              onClick={onClear}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function normalizeBroadcastPayload(payload: CreateBroadcastPayload): CreateBroadcastPayload {
  return {
    ...payload,
    href: payload.href?.trim() || null,
    imageUrl: payload.imageUrl?.trim() || null,
    channels: payload.channels.length ? payload.channels : ["in_app"],
  };
}

function audienceLabel(value: EngagementAudience) {
  return audienceOptions.find((option) => option.value === value)?.label ?? value;
}

function channelLabel(value: NotificationChannel) {
  return channelOptions.find((option) => option.value === value)?.label ?? value;
}

function buildCronExpression(schedule: ReadableSchedule) {
  const [hour = "9", minute = "0"] = schedule.time.split(":");
  const normalizedHour = String(Number(hour));
  const normalizedMinute = String(Number(minute));

  if (schedule.frequency === "weekly") {
    return `${normalizedMinute} ${normalizedHour} * * ${schedule.dayOfWeek}`;
  }

  if (schedule.frequency === "monthly") {
    return `${normalizedMinute} ${normalizedHour} ${schedule.dayOfMonth} * *`;
  }

  return `${normalizedMinute} ${normalizedHour} * * *`;
}

function parseReadableSchedule(cronExpression?: string | null): ReadableSchedule {
  if (!cronExpression) return defaultReadableSchedule;
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) return { ...defaultReadableSchedule, frequency: "custom" };

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return { ...defaultReadableSchedule, frequency: "daily", time };
  }

  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
    return {
      ...defaultReadableSchedule,
      frequency: "weekly",
      time,
      dayOfWeek,
    };
  }

  if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
    return {
      ...defaultReadableSchedule,
      frequency: "monthly",
      time,
      dayOfMonth,
    };
  }

  return { ...defaultReadableSchedule, frequency: "custom" };
}

function getSchedulePreview(schedule: ReadableSchedule) {
  const timeLabel = formatTimeLabel(schedule.time);

  if (schedule.frequency === "weekly") {
    const day = weekDays.find((item) => item.value === schedule.dayOfWeek)?.label;
    return `Runs every ${day ?? "selected day"} at ${timeLabel}`;
  }

  if (schedule.frequency === "monthly") {
    return `Runs every month on day ${schedule.dayOfMonth} at ${timeLabel}`;
  }

  return `Runs every day at ${timeLabel}`;
}

function describeSchedule(job: AutomationJob) {
  const readable = job.conditions?.readableSchedule;
  if (typeof readable === "string" && readable.trim()) return readable;

  if (job.cronExpression) {
    const parsed = parseReadableSchedule(job.cronExpression);
    if (parsed.frequency !== "custom") return getSchedulePreview(parsed);
    return `Advanced schedule: ${job.cronExpression}`;
  }

  return job.eventKey ? `Runs on event: ${job.eventKey}` : "Schedule not configured";
}

function formatTimeLabel(value: string) {
  const [rawHour = "0", rawMinute = "0"] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}
