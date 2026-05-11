"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, ClipboardList, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AdminResourceDashboard } from "@/components/admin/shared/admin-resource-dashboard";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import { Course } from "@/types/course";
import { Exam, Question, QuestionBankCategory } from "@/types/exam";
import { User } from "@/types/user";
import { CreateExamDialog } from "./create-exam-dialog";
import { getExamColumns } from "./exam-columns";

export function ExamsList({
  exams,
  categories,
  questions,
  courses,
  faculties,
}: {
  exams: Exam[];
  categories: QuestionBankCategory[];
  questions: Question[];
  courses: Course[];
  faculties: User[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const columns = useMemo(() => getExamColumns(), []);

  const duplicateSelected = async (selectedRows: Exam[]) => {
    const [first] = selectedRows;
    if (!first) return;

    try {
      await examClientService.createExam({
        title: `${first.title} Copy`,
        description: first.description ?? undefined,
        instructions: first.instructions ?? undefined,
        status: "draft",
        passingPercentage: Number(first.passingPercentage),
        durationMinutes: first.durationMinutes ?? undefined,
        attemptLimit: first.attemptLimit ?? undefined,
        randomizeQuestions: first.randomizeQuestions,
        shuffleOptions: first.shuffleOptions,
        adaptiveMode: first.adaptiveMode,
        retryPenaltyPercentage: Number(first.retryPenaltyPercentage),
        partialMarking: first.partialMarking,
        fullscreenRequired: first.fullscreenRequired,
        allowedIpRanges: first.allowedIpRanges ?? undefined,
        serverTimerEnabled: first.serverTimerEnabled,
        autoSubmitEnabled: first.autoSubmitEnabled,
        correctAnswerVisibility: first.correctAnswerVisibility,
        courseIds: first.courses?.map((course) => course.id) ?? [],
        facultyIds: first.faculties?.map((faculty) => faculty.id) ?? [],
      });
      toast.success("Exam duplicated as draft");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Assessment Engine"
        title="Exams dashboard"
        description="Manage reusable exams, course assignments, publish state, and secure attempt settings."
        data={exams}
        columns={columns}
        searchPlaceholder="Search exams by title, slug, course, or faculty"
        searchFields={[
          (exam) => exam.title,
          (exam) => exam.slug,
          (exam) => exam.status,
          (exam) => exam.courses?.map((course) => course.title).join(" "),
          (exam) => exam.faculties?.map((faculty) => faculty.email).join(" "),
        ]}
        stats={[
          { label: "Total Exams", value: exams.length, icon: BookOpenCheck },
          {
            label: "Published",
            value: exams.filter((exam) => exam.status === "published").length,
            icon: ShieldCheck,
          },
          {
            label: "Question Rules",
            value: exams.reduce(
              (sum, exam) =>
                sum + Number(exam.questionsCount ?? exam.questionRules?.length ?? 0),
              0,
            ),
            icon: ClipboardList,
          },
        ]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Exam
          </Button>
        }
        selectedActions={(selectedRows) => (
          <Button
            variant="outline"
            disabled={selectedRows.length !== 1}
            onClick={() => duplicateSelected(selectedRows)}
          >
            Duplicate Selected
          </Button>
        )}
        exportFileName="exams-export.xlsx"
        mapExportRow={(exam) => ({
          ID: exam.id,
          Title: exam.title,
          Status: exam.status,
          Courses: exam.courses?.map((course) => course.title).join(", ") ?? "",
          Faculties: exam.faculties?.map((faculty) => faculty.email).join(", ") ?? "",
          Attempts: exam.attemptsCount ?? 0,
          CreatedAt: exam.createdAt,
        })}
        emptyTitle="No exams found"
        emptyDescription="Create an exam and attach question rules to publish it."
      />

      <CreateExamDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        courses={courses}
        faculties={faculties}
        questions={questions}
        categories={categories}
      />
    </>
  );
}
