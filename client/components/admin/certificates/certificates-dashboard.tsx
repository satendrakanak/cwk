"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Award,
  BookOpenCheck,
  Download,
  FileCheck2,
  GraduationCap,
  MailWarning,
  MoreHorizontal,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { AdminResourceDashboard } from "@/components/admin/shared/admin-resource-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { downloadRemoteFile } from "@/lib/download-file";
import { getErrorMessage } from "@/lib/error-handler";
import { certificateClientService } from "@/services/certificates/certificate.client";
import { engagementClientService } from "@/services/engagement/engagement.client";
import type {
  AdminCertificateDashboard,
  AdminCertificateRow,
  AdminCertificateStatus,
} from "@/types/certificate";
import type { NotificationChannel } from "@/types/engagement";
import { formatDateTime } from "@/utils/formate-date";

type CertificatesDashboardProps = {
  data: AdminCertificateDashboard;
};

const statusConfig: Record<
  AdminCertificateStatus,
  { label: string; className: string }
> = {
  issued: {
    label: "Issued",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
  },
  ready_to_generate: {
    label: "Ready",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200",
  },
  exam_pending: {
    label: "Exam pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200",
  },
  course_incomplete: {
    label: "Course pending",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-200",
  },
};

export function CertificatesDashboard({ data }: CertificatesDashboardProps) {
  const router = useRouter();
  const [workingRowId, setWorkingRowId] = useState<number | null>(null);
  const [notificationRows, setNotificationRows] = useState<
    AdminCertificateRow[]
  >([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState(
    "Complete your course certificate steps",
  );
  const [notificationMessage, setNotificationMessage] = useState(
    "Your certificate is waiting on the next step. Please open your learning dashboard, complete the pending requirement, and continue toward certification.",
  );
  const [notificationHref, setNotificationHref] = useState("/dashboard");
  const [notificationChannels, setNotificationChannels] = useState<
    NotificationChannel[]
  >(["in_app", "push", "email"]);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  async function handleDownload(row: AdminCertificateRow) {
    const fileUrl = row.certificate?.file?.path;
    if (!fileUrl) {
      toast.error("Certificate PDF is not available yet.");
      return;
    }

    const learnerName = getLearnerName(row)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const courseName = row.course.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await downloadRemoteFile(
      fileUrl,
      `${learnerName || "learner"}-${courseName || "course"}-certificate.pdf`,
    );
  }

  async function handleGenerate(row: AdminCertificateRow) {
    try {
      setWorkingRowId(row.id);
      await certificateClientService.generateForUserCourse(
        row.learner.id,
        row.course.id,
      );
      toast.success("Certificate generated and emailed to learner.");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingRowId(null);
    }
  }

  function openNotificationDialog(rows: AdminCertificateRow[]) {
    const uniqueRows = getUniqueLearnerRows(rows);
    setNotificationRows(uniqueRows);

    if (uniqueRows.length === 1) {
      const row = uniqueRows[0];
      const pendingText =
        row.status === "exam_pending"
          ? `Your ${row.course.title} certificate is almost ready. Please clear the final exam to unlock it.`
          : row.status === "course_incomplete"
            ? `Please continue ${row.course.title}. Complete the remaining learning steps to unlock your certificate.`
            : row.status === "ready_to_generate"
              ? `You are eligible for your ${row.course.title} certificate. Our team is generating it shortly.`
              : `Your ${row.course.title} certificate is ready to download.`;

      setNotificationTitle(
        row.status === "issued"
          ? "Your certificate is ready"
          : "Your certificate needs one more step",
      );
      setNotificationMessage(pendingText);
      setNotificationHref(`/course/${row.course.slug}/learn`);
    } else {
      setNotificationTitle("Complete your course certificate steps");
      setNotificationMessage(
        "Your certificate is waiting on the next step. Please open your learning dashboard, complete the pending requirement, and continue toward certification.",
      );
      setNotificationHref("/dashboard");
    }

    setNotificationOpen(true);
  }

  async function handleSendNotification() {
    const selectedUserIds = getUniqueLearnerRows(notificationRows).map(
      (row) => row.learner.id,
    );

    if (!selectedUserIds.length) {
      toast.error("Select at least one learner.");
      return;
    }

    if (!notificationChannels.length) {
      toast.error("Select at least one channel.");
      return;
    }

    try {
      setIsSendingNotification(true);
      await engagementClientService.createBroadcast({
        title: notificationTitle,
        message: notificationMessage,
        href: notificationHref,
        audience: "selected_users",
        selectedUserIds,
        audienceFilters: { selectedUserIds },
        channels: notificationChannels,
        type: "certificate",
        sendNow: true,
      });
      toast.success(`Notification sent to ${selectedUserIds.length} learner(s).`);
      setNotificationOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSendingNotification(false);
    }
  }

  const columns = useMemo<ColumnDef<AdminCertificateRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all certificate rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select certificate row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "learner",
        header: "Learner",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">
              {getLearnerName(row.original)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {row.original.learner.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => (
          <div>
            <p className="line-clamp-1 font-semibold text-slate-950 dark:text-white">
              {row.original.course.title}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enrolled {formatDateTime(row.original.enrolledAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="min-w-32">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {row.original.progress}%
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {row.original.completedLectures}/{row.original.totalLectures}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(row.original.progress, 100)}%` }}
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "examPassed",
        header: "Exam",
        cell: ({ row }) =>
          row.original.examRequired ? (
            <Badge variant={row.original.examPassed ? "default" : "outline"}>
              {row.original.examPassed ? "Passed" : "Pending"}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">Not required</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Certificate",
        cell: ({ row }) => {
          const config = statusConfig[row.original.status];
          return (
            <div className="space-y-2">
              <Badge variant="outline" className={config.className}>
                {config.label}
              </Badge>
              <p className="max-w-64 text-xs text-slate-500 dark:text-slate-400">
                {row.original.actionHint}
              </p>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open certificate actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {row.original.status === "ready_to_generate" ? (
                <DropdownMenuItem
                  disabled={workingRowId === row.original.id}
                  onClick={() => handleGenerate(row.original)}
                >
                  <RefreshCw className="size-4" />
                  {workingRowId === row.original.id
                    ? "Generating..."
                    : "Generate certificate"}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                disabled={!row.original.certificate?.file?.path}
                onClick={() => handleDownload(row.original)}
              >
                <Download className="size-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openNotificationDialog([row.original])}>
                <Send className="size-4" />
                Notify learner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [workingRowId],
  );

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Certificates"
        title="Certificates dashboard"
        description="Track course completion, exam clearance, issued certificates, and learners who need follow-up."
        data={data.rows}
        columns={columns}
        getRowId={(row) => String(row.id)}
        searchPlaceholder="Search learner, email, course, or certificate status"
        searchFields={[
          (row) => getLearnerName(row),
          (row) => row.learner.email,
          (row) => row.course.title,
          (row) => statusConfig[row.status].label,
          (row) => row.certificate?.certificateNumber,
        ]}
        stats={[
          {
            label: "Enrolled learners",
            value: data.summary.enrolledLearners,
            icon: GraduationCap,
          },
          {
            label: "Issued certificates",
            value: data.summary.issuedCertificates,
            icon: Award,
          },
          {
            label: "Ready to generate",
            value: data.summary.readyToGenerate,
            icon: FileCheck2,
          },
          {
            label: "Exam pending",
            value: data.summary.examPending,
            icon: MailWarning,
          },
          {
            label: "Course pending",
            value: data.summary.courseIncomplete,
            icon: BookOpenCheck,
          },
        ]}
        selectedActions={(selectedRows) => (
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/10"
            disabled={!selectedRows.length}
            onClick={() => openNotificationDialog(selectedRows)}
          >
            <Send className="size-4" />
            Notify selected
          </Button>
        )}
        exportFileName="certificates-dashboard.xlsx"
        mapExportRow={(row) => ({
          Learner: getLearnerName(row),
          Email: row.learner.email,
          Course: row.course.title,
          Progress: `${row.progress}%`,
          CompletedLectures: row.completedLectures,
          TotalLectures: row.totalLectures,
          ExamRequired: row.examRequired ? "Yes" : "No",
          ExamPassed: row.examPassed ? "Yes" : "No",
          Status: statusConfig[row.status].label,
          CertificateNumber: row.certificate?.certificateNumber ?? "",
          IssuedAt: row.certificate?.issuedAt ?? "",
        })}
        emptyTitle="No certificate records found"
        emptyDescription="Learner completion and certificate records will appear once users enroll in courses."
      />

      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send certificate follow-up</DialogTitle>
            <DialogDescription>
              Send through the internal notification system. Choose in-app, push,
              and email channels as needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold">
                {getUniqueLearnerRows(notificationRows).length} learner
                {getUniqueLearnerRows(notificationRows).length === 1 ? "" : "s"}{" "}
                selected
              </p>
              <div className="mt-3 max-h-32 space-y-2 overflow-y-auto pr-1">
                {getUniqueLearnerRows(notificationRows).map((row) => (
                  <div
                    key={row.learner.id}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {getLearnerName(row)}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {row.learner.email}
                      </span>
                    </span>
                    <Badge variant="outline" className={statusConfig[row.status].className}>
                      {statusConfig[row.status].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="certificate-notification-title">Title</Label>
                <Input
                  id="certificate-notification-title"
                  value={notificationTitle}
                  onChange={(event) => setNotificationTitle(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificate-notification-link">Action link</Label>
                <Input
                  id="certificate-notification-link"
                  value={notificationHref}
                  onChange={(event) => setNotificationHref(event.target.value)}
                  placeholder="/dashboard"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate-notification-message">Message</Label>
              <Textarea
                id="certificate-notification-message"
                value={notificationMessage}
                onChange={(event) => setNotificationMessage(event.target.value)}
                className="min-h-28"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {channelOptions.map((channel) => (
                <label
                  key={channel.value}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-background p-3"
                >
                  <Checkbox
                    checked={notificationChannels.includes(channel.value)}
                    onCheckedChange={(value) => {
                      const current = new Set(notificationChannels);
                      if (value) current.add(channel.value);
                      else current.delete(channel.value);
                      setNotificationChannels([...current]);
                    }}
                  />
                  <span>
                    <span className="block text-sm font-semibold">
                      {channel.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {channel.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <Button
              type="button"
              className="w-full rounded-2xl"
              disabled={isSendingNotification}
              onClick={handleSendNotification}
            >
              <Send className="size-4" />
              {isSendingNotification ? "Sending..." : "Send notification"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const channelOptions: Array<{
  value: NotificationChannel;
  label: string;
  description: string;
}> = [
  {
    value: "in_app",
    label: "In-app",
    description: "Dashboard notification center",
  },
  {
    value: "push",
    label: "Push",
    description: "Mobile/browser push alert",
  },
  {
    value: "email",
    label: "Email",
    description: "Configured mail delivery",
  },
];

function getUniqueLearnerRows(rows: AdminCertificateRow[]) {
  return Array.from(
    rows
      .reduce((map, row) => {
        if (!map.has(row.learner.id)) {
          map.set(row.learner.id, row);
        }
        return map;
      }, new Map<number, AdminCertificateRow>())
      .values(),
  );
}

function getLearnerName(row: AdminCertificateRow) {
  return (
    `${row.learner.firstName || ""} ${row.learner.lastName || ""}`.trim() ||
    row.learner.email ||
    "Learner"
  );
}
