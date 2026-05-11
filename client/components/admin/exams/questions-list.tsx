"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileQuestion, ListChecks, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  AdminResourceDashboard,
  DeleteSelectedButton,
} from "@/components/admin/shared/admin-resource-dashboard";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import { Question, QuestionBankCategory } from "@/types/exam";
import { CreateQuestionDialog } from "./create-question-dialog";
import { getQuestionColumns } from "./question-columns";

type DialogState = {
  mode: "edit" | "duplicate";
  question: Question;
} | null;

export function QuestionsList({
  questions,
  categories,
}: {
  questions: Question[];
  categories: QuestionBankCategory[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [deleteItem, setDeleteItem] = useState<Question | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const columns = useMemo(
    () =>
      getQuestionColumns(
        (question) => setDialogState({ mode: "edit", question }),
        (question) => setDialogState({ mode: "duplicate", question }),
        setDeleteItem,
      ),
    [],
  );

  const deleteQuestions = async (items: Question[]) => {
    try {
      setLoading(true);
      await Promise.all(items.map((item) => examClientService.deleteQuestion(item.id)));
      toast.success(
        items.length === 1
          ? "Question deleted"
          : `${items.length} questions deleted`,
      );
      setDeleteItem(null);
      setBulkDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Question Bank"
        title="Questions dashboard"
        description="Create, edit, duplicate, filter, and export reusable questions for exams."
        data={questions}
        columns={columns}
        searchPlaceholder="Search questions by title, prompt, category, or type"
        searchFields={[
          (question) => question.title,
          (question) => question.prompt,
          (question) => question.category?.name,
          (question) => question.type,
        ]}
        stats={[
          { label: "Total Questions", value: questions.length, icon: FileQuestion },
          {
            label: "Auto Graded",
            value: questions.filter((question) => question.type !== "essay").length,
            icon: ShieldCheck,
          },
          {
            label: "Categories Used",
            value: new Set(
              questions
                .map((question) => question.category?.id)
                .filter(Boolean),
            ).size,
            icon: ListChecks,
          },
        ]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add Question
          </Button>
        }
        selectedActions={(selectedRows) => (
          <DeleteSelectedButton
            disabled={!selectedRows.length}
            onClick={() => {
              setSelectedForDelete(selectedRows);
              setBulkDeleteOpen(true);
            }}
          />
        )}
        exportFileName="questions-export.xlsx"
        mapExportRow={(question) => ({
          ID: question.id,
          Title: question.title,
          Type: question.type,
          Category: question.category?.name ?? "Uncategorized",
          Points: question.defaultPoints,
          NegativeMarks: question.defaultNegativeMarks,
          CreatedAt: question.createdAt,
        })}
        emptyTitle="No questions found"
        emptyDescription="Questions will appear here once they are added to the bank."
      />

      <CreateQuestionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
      />
      <CreateQuestionDialog
        open={Boolean(dialogState)}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        categories={categories}
        mode={dialogState?.mode}
        question={dialogState?.question}
      />
      <ConfirmDeleteDialog
        deleteText="question"
        open={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteQuestions([deleteItem])}
        loading={loading}
      />
      <ConfirmDeleteDialog
        deleteText="selected questions"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => deleteQuestions(selectedForDelete)}
        loading={loading}
      />
    </>
  );
}
