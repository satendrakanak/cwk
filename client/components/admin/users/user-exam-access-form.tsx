"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { courseExamsClientService } from "@/services/course-exams/course-exams.client";
import { UserExamAccessOverview } from "@/types/exam";
import { getErrorMessage } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UserExamAccessFormProps {
  userId: number;
  items: UserExamAccessOverview[];
}

export function UserExamAccessForm({
  userId,
  items: initialItems,
}: UserExamAccessFormProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<
    Record<
      number,
      {
        extraAttempts: string;
        bypassAttendanceRequirement: boolean;
        note: string;
      }
    >
  >(
    Object.fromEntries(
      initialItems.map((item) => [
        item.courseId,
        {
          extraAttempts: String(item.extraAttempts ?? 0),
          bypassAttendanceRequirement: Boolean(item.bypassAttendanceRequirement),
          note: item.note || "",
        },
      ]),
    ),
  );

  if (!items.length) return null;

  const updateDraft = (
    courseId: number,
    key: "extraAttempts" | "bypassAttendanceRequirement" | "note",
    value: string | boolean,
  ) => {
    setDrafts((current) => ({
      ...current,
      [courseId]: {
        extraAttempts: current[courseId]?.extraAttempts ?? "0",
        bypassAttendanceRequirement:
          current[courseId]?.bypassAttendanceRequirement ?? false,
        note: current[courseId]?.note ?? "",
        [key]: value,
      },
    }));
  };

  const saveOverride = (courseId: number) => {
    const draft = drafts[courseId] || {
      extraAttempts: "0",
      bypassAttendanceRequirement: false,
      note: "",
    };

    startTransition(async () => {
      try {
        const response = await courseExamsClientService.upsertUserAccessOverride(
          userId,
          {
            courseId,
            extraAttempts: Number(draft.extraAttempts || 0),
            bypassAttendanceRequirement: draft.bypassAttendanceRequirement,
            note: draft.note,
          },
        );
        setItems(response.data);
        toast.success("Exam attempt access updated");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)] dark:text-[var(--brand-200)]">
          Final Exam Access
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
          Manage user-wise extra exam attempts
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
          If a learner exhausts all attempts, management can extend access
          course-wise from here without changing the global exam settings.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const draft = drafts[item.courseId] || {
            extraAttempts: String(item.extraAttempts ?? 0),
            bypassAttendanceRequirement: Boolean(
              item.bypassAttendanceRequirement,
            ),
            note: item.note || "",
          };

          return (
            <div
              key={item.courseId}
              className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/6"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-950 dark:text-white">
                      {item.courseTitle}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {item.examMode === "advanced" ? "Advanced exam" : "Legacy exam"} •
                      Base attempts {formatAttemptCount(item.baseAttempts)} •
                      Effective attempts {formatAttemptCount(item.effectiveAttempts)} •
                      Used {item.attemptsUsed} • Remaining{" "}
                      {formatAttemptCount(item.remainingAttempts)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.passed
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/16 dark:text-emerald-200"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/16 dark:text-amber-200"
                    }`}
                  >
                    {item.passed ? "Exam already passed" : "Still retry eligible"}
                  </span>
                </div>

                <div className="grid gap-3 xl:min-w-[360px] xl:max-w-[420px] xl:flex-1">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Extra attempts
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.extraAttempts}
                      onChange={(event) =>
                        updateDraft(item.courseId, "extraAttempts", event.target.value)
                      }
                    />
                  </div>
                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                    <Checkbox
                      checked={draft.bypassAttendanceRequirement}
                      onCheckedChange={(checked) =>
                        updateDraft(
                          item.courseId,
                          "bypassAttendanceRequirement",
                          checked === true,
                        )
                      }
                    />
                    <span>
                      <span className="block font-medium text-slate-800 dark:text-slate-100">
                        Waive live-class attendance gate
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-300">
                        Use this for genuine medical, technical, or management
                        exceptions. Attempts still follow the limit above.
                      </span>
                    </span>
                  </label>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Internal note
                    </label>
                    <Textarea
                      rows={3}
                      value={draft.note}
                      onChange={(event) =>
                        updateDraft(item.courseId, "note", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveOverride(item.courseId)}
                    >
                      Save access override
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatAttemptCount(value: number | null) {
  return value === null ? "Unlimited" : value;
}
