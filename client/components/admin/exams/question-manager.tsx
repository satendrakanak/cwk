"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import { Question, QuestionBankCategory, QuestionType } from "@/types/exam";
import { CreateQuestionDialog } from "./create-question-dialog";

const questionTypeLabels: Record<QuestionType, string> = {
  mcq_single: "MCQ Single",
  mcq_multiple: "MCQ Multiple",
  true_false: "True / False",
  short_answer: "Short Answer",
  numerical: "Numerical",
  matching: "Matching",
  essay: "Essay",
};

type QuestionDialogState = {
  mode: "edit" | "duplicate";
  question: Question;
} | null;

export function QuestionManager({
  questions,
  categories,
}: {
  questions: Question[];
  categories: QuestionBankCategory[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [type, setType] = useState<"all" | QuestionType>("all");
  const [dialogState, setDialogState] = useState<QuestionDialogState>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        !needle ||
        question.title.toLowerCase().includes(needle) ||
        question.prompt.toLowerCase().includes(needle);
      const matchesCategory =
        categoryId === "all" || String(question.category?.id ?? "") === categoryId;
      const matchesType = type === "all" || question.type === type;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [categoryId, questions, search, type]);

  const handleDelete = async () => {
    if (!deleteQuestion) return;

    try {
      setIsDeleting(true);
      await examClientService.deleteQuestion(deleteQuestion.id);
      toast.success("Question deleted");
      setDeleteQuestion(null);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Manage Questions</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questions"
              className="h-9 sm:w-64"
            />
            <NativeSelect
              className="w-full sm:w-48"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <NativeSelectOption value="all">All categories</NativeSelectOption>
              {categories.map((category) => (
                <NativeSelectOption key={category.id} value={category.id}>
                  {category.parent
                    ? `${category.parent.name} / ${category.name}`
                    : category.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              className="w-full sm:w-44"
              value={type}
              onChange={(event) => setType(event.target.value as "all" | QuestionType)}
            >
              <NativeSelectOption value="all">All types</NativeSelectOption>
              {Object.entries(questionTypeLabels).map(([value, label]) => (
                <NativeSelectOption key={value} value={value}>
                  {label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Marks</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length ? (
              filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {question.title}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {question.prompt}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {questionTypeLabels[question.type]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {question.category?.name ?? "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>{Number(question.defaultPoints || 0)}</div>
                    <div className="text-xs text-muted-foreground">
                      -{Number(question.defaultNegativeMarks || 0)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() =>
                            setDialogState({ mode: "edit", question })
                          }
                        >
                          <Edit className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDialogState({ mode: "duplicate", question })
                          }
                        >
                          <Copy className="size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteQuestion(question)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-muted-foreground"
                >
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
          open={Boolean(deleteQuestion)}
          onClose={() => setDeleteQuestion(null)}
          onConfirm={handleDelete}
          loading={isDeleting}
        />
      </CardContent>
    </Card>
  );
}
