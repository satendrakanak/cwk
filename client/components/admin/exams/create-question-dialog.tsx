"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import {
  Question,
  QuestionBankCategory,
  QuestionContent,
  QuestionType,
} from "@/types/exam";

const questionTypes: { label: string; value: QuestionType }[] = [
  { label: "MCQ Single", value: "mcq_single" },
  { label: "MCQ Multiple", value: "mcq_multiple" },
  { label: "True / False", value: "true_false" },
  { label: "Short Answer", value: "short_answer" },
  { label: "Numerical", value: "numerical" },
  { label: "Matching", value: "matching" },
  { label: "Essay", value: "essay" },
];

type CreateQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: QuestionBankCategory[];
  question?: Question | null;
  mode?: "create" | "edit" | "duplicate";
};

export function CreateQuestionDialog({
  open,
  onOpenChange,
  categories,
  question,
  mode = "create",
}: CreateQuestionDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<QuestionType>("mcq_single");
  const [categoryId, setCategoryId] = useState("");
  const [defaultPoints, setDefaultPoints] = useState("1");
  const [negativeMarks, setNegativeMarks] = useState("0");
  const [optionsText, setOptionsText] = useState("");
  const [acceptedAnswersText, setAcceptedAnswersText] = useState("");
  const [allowPartialMarking, setAllowPartialMarking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = mode === "edit";
  const isDuplicate = mode === "duplicate";

  const showOptions = useMemo(
    () => ["mcq_single", "mcq_multiple", "true_false", "matching"].includes(type),
    [type],
  );

  useEffect(() => {
    if (!open) return;

    if (!question) {
      setTitle("");
      setPrompt("");
      setType("mcq_single");
      setCategoryId("");
      setDefaultPoints("1");
      setNegativeMarks("0");
      setOptionsText("");
      setAcceptedAnswersText("");
      setAllowPartialMarking(true);
      return;
    }

    setTitle(isDuplicate ? `${question.title} Copy` : question.title);
    setPrompt(question.prompt);
    setType(question.type);
    setCategoryId(question.category?.id ? String(question.category.id) : "");
    setDefaultPoints(String(Number(question.defaultPoints || 1)));
    setNegativeMarks(String(Number(question.defaultNegativeMarks || 0)));
    setOptionsText(
      (question.content.options ?? [])
        .map((option) => `${option.isCorrect ? "*" : ""}${option.text}`)
        .join("\n"),
    );
    setAcceptedAnswersText(
      [
        ...(question.content.acceptedAnswers ?? []),
        ...(question.content.numericalAnswers ?? []).map((item) =>
          item.tolerance !== undefined
            ? `${item.value} ± ${item.tolerance}`
            : String(item.value),
        ),
        question.content.rubric ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    setAllowPartialMarking(question.allowPartialMarking);
  }, [isDuplicate, open, question]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content: QuestionContent = {};
    const acceptedAnswers = acceptedAnswersText
      .split("\n")
      .map((answer) => answer.trim())
      .filter(Boolean);

    if (showOptions) {
      content.options = optionsText
        .split("\n")
        .map((line, index) => {
          const isCorrect = line.trim().startsWith("*");
          return {
            id: `option-${index + 1}`,
            text: line.replace(/^\*/, "").trim(),
            isCorrect,
          };
        })
        .filter((option) => option.text);
    }

    if (acceptedAnswers.length) {
      if (type === "numerical") {
        content.numericalAnswers = acceptedAnswers
          .map((answer) => {
            const [valueText, toleranceText] = answer.split("±");
            const value = Number(valueText.trim());
            const tolerance = toleranceText ? Number(toleranceText.trim()) : undefined;
            return Number.isFinite(value) ? { value, tolerance } : null;
          })
          .filter(Boolean) as NonNullable<QuestionContent["numericalAnswers"]>;
      } else if (type === "essay") {
        content.rubric = acceptedAnswers.join("\n");
      } else {
        content.acceptedAnswers = acceptedAnswers;
      }
    }

    try {
      setIsSaving(true);
      const payload = {
        title,
        prompt,
        type,
        content,
        defaultPoints: Number(defaultPoints || 1),
        defaultNegativeMarks: Number(negativeMarks || 0),
        allowPartialMarking,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };

      if (isEdit && question) {
        await examClientService.updateQuestion(question.id, payload);
        toast.success("Question updated");
      } else {
        await examClientService.createQuestion(payload);
        toast.success(isDuplicate ? "Question duplicated" : "Question added to bank");
      }
      onOpenChange(false);
      setTitle("");
      setPrompt("");
      setOptionsText("");
      setAcceptedAnswersText("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Question"
              : isDuplicate
                ? "Duplicate Question"
                : "Add Question"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="question-title">Title</Label>
              <Input
                id="question-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <NativeSelect
                className="w-full"
                value={type}
                onChange={(event) => setType(event.target.value as QuestionType)}
              >
                {questionTypes.map((item) => (
                  <NativeSelectOption key={item.value} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-prompt">Prompt</Label>
            <Textarea
              id="question-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <NativeSelect
                className="w-full"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <NativeSelectOption value="">Uncategorized</NativeSelectOption>
                {categories.map((category) => (
                  <NativeSelectOption key={category.id} value={category.id}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-points">Points</Label>
              <Input
                id="question-points"
                type="number"
                min="0"
                step="0.5"
                value={defaultPoints}
                onChange={(event) => setDefaultPoints(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-negative">Negative Marks</Label>
              <Input
                id="question-negative"
                type="number"
                min="0"
                step="0.5"
                value={negativeMarks}
                onChange={(event) => setNegativeMarks(event.target.value)}
              />
            </div>
          </div>

          {showOptions ? (
            <div className="space-y-2">
              <Label htmlFor="question-options">Options</Label>
              <Textarea
                id="question-options"
                value={optionsText}
                onChange={(event) => setOptionsText(event.target.value)}
                rows={5}
                placeholder="Use * before correct options"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="accepted-answers">Accepted Answers / Rubric Notes</Label>
            <Textarea
              id="accepted-answers"
              value={acceptedAnswersText}
              onChange={(event) => setAcceptedAnswersText(event.target.value)}
              rows={3}
              placeholder="One answer per line"
            />
          </div>

          <label className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            Partial marking
            <Switch
              checked={allowPartialMarking}
              onCheckedChange={setAllowPartialMarking}
            />
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save Question"
                  : isDuplicate
                    ? "Duplicate Question"
                    : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
