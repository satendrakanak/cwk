"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  CalendarPlus,
  CalendarDays,
  Check,
  Circle,
  Clock,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { facultyWorkspaceClient } from "@/services/faculty/faculty-workspace.client";
import type {
  FacultyBatchStudent,
  FacultyCourseBatch,
  FacultyCourseStudent,
  FacultyWorkspaceCourse,
} from "@/types/faculty-workspace";
import {
  formatDate,
  getDatedLifecycle,
  type DatedLifecycle,
} from "@/utils/formate-date";

type FacultyBatchesPageProps = {
  batches: FacultyCourseBatch[];
  courses: FacultyWorkspaceCourse[];
  todayKey: string;
};

type BatchLifecycle = DatedLifecycle;

type BatchSectionConfig = {
  key: BatchLifecycle;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
};

const BATCH_SECTIONS: BatchSectionConfig[] = [
  {
    key: "active",
    title: "Active batches",
    description: "Running cohorts that need regular attention.",
    icon: Users,
    iconClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "upcoming",
    title: "Upcoming batches",
    description: "Scheduled cohorts that are about to begin.",
    icon: Clock,
    iconClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    key: "recent",
    title: "Recent and completed",
    description: "Completed batches kept for review and reports.",
    icon: Archive,
    iconClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
  {
    key: "draft",
    title: "Draft batches",
    description: "Preparation work that is not live yet.",
    icon: Circle,
    iconClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    key: "cancelled",
    title: "Cancelled batches",
    description: "Stopped cohorts retained for history.",
    icon: X,
    iconClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
];

export function FacultyBatchesPage({
  batches,
  courses,
  todayKey,
}: FacultyBatchesPageProps) {
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<FacultyCourseBatch | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatchLifecycle | "all">("all");
  const studentCount = batches.reduce(
    (total, batch) =>
      total +
      batch.students.filter((student) => student.status === "active").length,
    0,
  );
  const sessionCount = batches.reduce(
    (total, batch) => total + batch.sessions.length,
    0,
  );
  const filteredBatches = batches.filter((batch) => {
    const needle = search.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      batch.name.toLowerCase().includes(needle) ||
      batch.course.title.toLowerCase().includes(needle) ||
      (batch.code ?? "").toLowerCase().includes(needle);
    const matchesStatus =
      statusFilter === "all" || getBatchLifecycle(batch, todayKey) === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const groupedBatches = groupBatchesByLifecycle(filteredBatches, todayKey);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Batches
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Faculty-led course batches
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cohorts connect assigned courses, students, sessions, and reminders.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedBatch(null);
              setBatchDialogOpen(true);
            }}
          >
            Create batch
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={groupBatchesByLifecycle(batches, todayKey).upcoming.length}
        />
        <StatCard icon={Users} label="Active students" value={studentCount} />
        <StatCard icon={CalendarDays} label="Class sessions" value={sessionCount} />
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Batch list</h2>
            <p className="text-sm text-muted-foreground">
              {filteredBatches.length} batches in the current view.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,18rem)_12rem]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search batch, code, course"
                className="h-9 pl-9"
              />
            </div>
            <NativeSelect
              className="h-9 w-full"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as BatchLifecycle | "all")
              }
            >
              <NativeSelectOption value="all">All batches</NativeSelectOption>
              <NativeSelectOption value="active">Active</NativeSelectOption>
              <NativeSelectOption value="upcoming">Upcoming</NativeSelectOption>
              <NativeSelectOption value="recent">Completed</NativeSelectOption>
              <NativeSelectOption value="draft">Draft</NativeSelectOption>
              <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>

        <div className="space-y-6">
          {filteredBatches.length ? (
            BATCH_SECTIONS.map((section) => {
              const sectionBatches = groupedBatches[section.key];

              if (!sectionBatches.length) return null;

              return (
                <BatchSection
                  key={section.key}
                  section={section}
                  batches={sectionBatches}
                  todayKey={todayKey}
                  onEdit={(batch) => {
                    setSelectedBatch(batch);
                    setBatchDialogOpen(true);
                  }}
                  onManageStudents={(batch) => {
                    setSelectedBatch(batch);
                    setStudentDialogOpen(true);
                  }}
                />
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed bg-background p-8 text-center">
              <p className="text-sm font-medium">No batches found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a batch or adjust the current filters.
              </p>
            </div>
          )}
        </div>
      </section>

      <BatchDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        courses={courses}
        batch={selectedBatch}
        todayKey={todayKey}
      />
      {selectedBatch ? (
        <BatchStudentsDialog
          open={studentDialogOpen}
          onOpenChange={setStudentDialogOpen}
          batch={selectedBatch}
          todayKey={todayKey}
        />
      ) : null}
    </div>
  );
}

function BatchCard({
  batch,
  todayKey,
  onEdit,
  onManageStudents,
}: {
  batch: FacultyCourseBatch;
  todayKey: string;
  onEdit: () => void;
  onManageStudents: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const activeStudents = batch.students.filter((item) => item.status === "active");
  const lifecycle = getBatchLifecycle(batch, todayKey);
  const tone = getBatchTone(lifecycle);
  const canScheduleClass = lifecycle === "active" || lifecycle === "upcoming";

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await facultyWorkspaceClient.deleteBatch(batch.id);
      toast.success("Batch deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className={`rounded-xl border p-4 ${tone.cardClass}`}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{batch.name}</h3>
              <Badge variant="outline" className={tone.badgeClass}>
                {tone.label}
              </Badge>
              {batch.code ? <Badge variant="secondary">{batch.code}</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{batch.course.title}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{activeStudents.length} students</span>
              <span>{batch.sessions.length} sessions</span>
              {batch.capacity ? <span>Capacity {batch.capacity}</span> : null}
              {batch.startDate ? <span>Starts {formatDate(batch.startDate)}</span> : null}
              {batch.endDate ? <span>Ends {formatDate(batch.endDate)}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {canScheduleClass ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/faculty/calendar?action=create&batchId=${batch.id}`}>
                  <CalendarPlus className="mr-2 size-4" />
                  Schedule
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={onManageStudents}>
              <UserPlus className="mr-2 size-4" />
              Students
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      <ConfirmDeleteDialog
        deleteText="batch"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}

function BatchSection({
  section,
  batches,
  todayKey,
  onEdit,
  onManageStudents,
}: {
  section: BatchSectionConfig;
  batches: FacultyCourseBatch[];
  todayKey: string;
  onEdit: (batch: FacultyCourseBatch) => void;
  onManageStudents: (batch: FacultyCourseBatch) => void;
}) {
  const Icon = section.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`flex size-9 items-center justify-center rounded-lg ${section.iconClass}`}>
            <Icon className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{section.title}</h3>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>
        </div>
        <Badge variant="outline">{batches.length}</Badge>
      </div>

      <div className="space-y-3">
        {batches.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            todayKey={todayKey}
            onEdit={() => onEdit(batch)}
            onManageStudents={() => onManageStudents(batch)}
          />
        ))}
      </div>
    </div>
  );
}

function BatchDialog({
  open,
  onOpenChange,
  courses,
  batch,
  todayKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: FacultyWorkspaceCourse[];
  batch: FacultyCourseBatch | null;
  todayKey: string;
}) {
  const router = useRouter();
  const isReopenableBatch = batch
    ? getBatchLifecycle(batch, todayKey) === "recent"
    : false;
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    courseId: courses[0]?.id ? String(courses[0].id) : "",
    status: "draft",
    startDate: "",
    endDate: "",
    capacity: "",
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      name: batch?.name ?? "",
      code: batch?.code ?? "",
      description: batch?.description ?? "",
      courseId: batch?.course.id ? String(batch.course.id) : courses[0]?.id ? String(courses[0].id) : "",
      status: batch?.status ?? "draft",
      startDate: batch?.startDate ?? "",
      endDate: batch?.endDate ?? "",
      capacity: batch?.capacity ? String(batch.capacity) : "",
    });
  }, [batch, courses, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      const payload = {
        name: form.name,
        code: form.code || undefined,
        description: form.description || undefined,
        courseId: Number(form.courseId),
        status: form.status,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      };

      if (batch) {
        await facultyWorkspaceClient.updateBatch(batch.id, payload);
        toast.success("Batch updated");
      } else {
        await facultyWorkspaceClient.createBatch(payload);
        toast.success("Batch created");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{batch ? "Edit batch" : "Create batch"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isReopenableBatch ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
              This batch is currently completed by its status or end date. Update
              the status to Active and move the end date forward to reopen student
              and class actions.
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Batch name">
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </Field>
            <Field label="Code">
              <Input
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value })}
                placeholder="APR-2026"
              />
            </Field>
            <Field label="Course">
              <NativeSelect
                value={form.courseId}
                onChange={(event) => setForm({ ...form, courseId: event.target.value })}
                required
              >
                {courses.map((course) => (
                  <NativeSelectOption key={course.id} value={String(course.id)}>
                    {course.title}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Status">
              <NativeSelect
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                <NativeSelectOption value="draft">Draft</NativeSelectOption>
                <NativeSelectOption value="active">Active</NativeSelectOption>
                <NativeSelectOption value="completed">Completed</NativeSelectOption>
                <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Start date">
              <Input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              />
            </Field>
            <Field label="Capacity">
              <Input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={3}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !courses.length}>
              {isSaving ? "Saving..." : "Save batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BatchStudentsDialog({
  open,
  onOpenChange,
  batch,
  todayKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: FacultyCourseBatch;
  todayKey: string;
}) {
  const router = useRouter();
  const isReadOnly = getBatchLifecycle(batch, todayKey) === "recent";
  const [students, setStudents] = useState<FacultyCourseStudent[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<FacultyBatchStudent[]>(
    () => batch.students.filter((student) => student.status === "active"),
  );
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyStudentId, setBusyStudentId] = useState<number | null>(null);
  const activeStudentIds = useMemo(
    () =>
      new Set(
        assignedStudents.map((student) => student.student.id),
      ),
    [assignedStudents],
  );
  const availableStudents = students.filter((student) => {
    const needle = search.trim().toLowerCase();
    const fullName =
      `${student.user.firstName} ${student.user.lastName ?? ""}`.toLowerCase();
    const matchesSearch =
      !needle ||
      fullName.includes(needle) ||
      student.user.email.toLowerCase().includes(needle);

    return !activeStudentIds.has(student.user.id) && matchesSearch;
  });

  useEffect(() => {
    if (!open) return;

    setAssignedStudents(batch.students.filter((student) => student.status === "active"));
    if (isReadOnly) {
      setStudents([]);
      return;
    }

    facultyWorkspaceClient
      .getCourseStudents(batch.course.id)
      .then((response) => setStudents(response.data))
      .catch((error: unknown) => toast.error(getErrorMessage(error)));
  }, [batch.course.id, batch.students, isReadOnly, open]);

  async function handleAddStudent(userId: number) {
    if (isReadOnly) return;

    const selectedStudent = students.find((student) => student.user.id === userId);
    if (!selectedStudent) return;

    const optimisticStudent: FacultyBatchStudent = {
      id: -userId,
      status: "active",
      joinedAt: new Date().toISOString(),
      student: selectedStudent.user,
    };

    setAssignedStudents((current) => [...current, optimisticStudent]);
    try {
      setIsSaving(true);
      setBusyStudentId(userId);
      await facultyWorkspaceClient.addBatchStudent(batch.id, userId);
      toast.success("Student added to batch");
      router.refresh();
    } catch (error: unknown) {
      setAssignedStudents((current) =>
        current.filter((student) => student.student.id !== userId),
      );
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
      setBusyStudentId(null);
    }
  }

  async function handleRemoveStudent(studentId: number) {
    if (isReadOnly) return;

    const removedStudent = assignedStudents.find(
      (student) => student.student.id === studentId,
    );
    setAssignedStudents((current) =>
      current.filter((student) => student.student.id !== studentId),
    );

    try {
      setBusyStudentId(studentId);
      await facultyWorkspaceClient.removeBatchStudent(batch.id, studentId);
      toast.success("Student removed");
      router.refresh();
    } catch (error: unknown) {
      if (removedStudent) {
        setAssignedStudents((current) => [...current, removedStudent]);
      }
      toast.error(getErrorMessage(error));
    } finally {
      setBusyStudentId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? "Batch students" : "Manage students"}</DialogTitle>
        </DialogHeader>

        <div className={isReadOnly ? "grid gap-4" : "grid gap-4 lg:grid-cols-2"}>
          {!isReadOnly ? (
            <div className="rounded-xl border bg-background">
              <div className="border-b p-3">
                <p className="text-sm font-semibold">Available enrolled students</p>
                <p className="text-xs text-muted-foreground">
                  Search and add learners to this batch.
                </p>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email"
                    className="h-9 pl-9"
                  />
                </div>
              </div>

              <div className="max-h-[28rem] min-h-72 space-y-2 overflow-y-auto p-3">
                {availableStudents.length ? (
                  availableStudents.map((student) => (
                    <StudentPickerRow
                      key={student.user.id}
                      title={`${student.user.firstName} ${student.user.lastName ?? ""}`}
                      subtitle={student.user.email}
                      actionLabel="Add"
                      icon={UserPlus}
                      disabled={isSaving && busyStudentId === student.user.id}
                      onClick={() => handleAddStudent(student.user.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No available enrolled students found.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border bg-background">
            <div className="border-b p-3">
              <p className="text-sm font-semibold">Batch students</p>
              <p className="text-xs text-muted-foreground">
                {isReadOnly
                  ? `${assignedStudents.length} learners were part of this batch.`
                  : `${assignedStudents.length} active learners selected.`}
              </p>
            </div>

            <div className="max-h-[28rem] min-h-72 space-y-2 overflow-y-auto p-3">
              {assignedStudents.length ? (
                assignedStudents.map((student) => (
                  isReadOnly ? (
                    <StudentViewRow
                      key={student.id}
                      title={`${student.student.firstName} ${student.student.lastName ?? ""}`}
                      subtitle={student.student.email}
                    />
                  ) : (
                    <StudentPickerRow
                      key={student.id}
                      title={`${student.student.firstName} ${student.student.lastName ?? ""}`}
                      subtitle={student.student.email}
                      actionLabel="Remove"
                      icon={X}
                      variant="outline"
                      disabled={busyStudentId === student.student.id}
                      onClick={() => handleRemoveStudent(student.student.id)}
                    />
                  )
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No students added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentViewRow({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="truncate text-sm font-medium">{title}</p>
      <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function StudentPickerRow({
  title,
  subtitle,
  actionLabel,
  icon: Icon,
  onClick,
  disabled,
  variant = "secondary",
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  icon: typeof Check;
  onClick: () => void;
  disabled?: boolean;
  variant?: "secondary" | "outline";
}) {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Button
        type="button"
        variant={variant}
        size="sm"
        disabled={disabled}
        onClick={onClick}
      >
        <Icon className="size-4" />
        {actionLabel}
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function getBatchLifecycle(
  batch: FacultyCourseBatch,
  todayKey: string,
): BatchLifecycle {
  return getDatedLifecycle(batch, todayKey);
}

function groupBatchesByLifecycle(
  batches: FacultyCourseBatch[],
  todayKey: string,
) {
  return batches.reduce<Record<BatchLifecycle, FacultyCourseBatch[]>>(
    (groups, batch) => {
      groups[getBatchLifecycle(batch, todayKey)].push(batch);
      return groups;
    },
    {
      active: [],
      upcoming: [],
      recent: [],
      draft: [],
      cancelled: [],
    },
  );
}

function getBatchTone(lifecycle: BatchLifecycle) {
  const tones: Record<
    BatchLifecycle,
    { label: string; cardClass: string; badgeClass: string }
  > = {
    active: {
      label: "Active",
      cardClass: "border-emerald-500/25 bg-emerald-500/5",
      badgeClass: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    },
    upcoming: {
      label: "Upcoming",
      cardClass: "border-sky-500/25 bg-sky-500/5",
      badgeClass: "border-sky-500/30 text-sky-700 dark:text-sky-300",
    },
    recent: {
      label: "Completed",
      cardClass: "border-slate-500/20 bg-muted/25",
      badgeClass: "border-slate-500/30 text-slate-700 dark:text-slate-300",
    },
    draft: {
      label: "Draft",
      cardClass: "border-amber-500/25 bg-amber-500/5",
      badgeClass: "border-amber-500/30 text-amber-700 dark:text-amber-300",
    },
    cancelled: {
      label: "Cancelled",
      cardClass: "border-rose-500/25 bg-rose-500/5",
      badgeClass: "border-rose-500/30 text-rose-700 dark:text-rose-300",
    },
  };

  return tones[lifecycle];
}
