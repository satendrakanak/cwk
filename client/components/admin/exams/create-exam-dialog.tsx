"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Course } from "@/types/course";
import {
  CorrectAnswerVisibility,
  ExamStatus,
  Question,
  QuestionBankCategory,
} from "@/types/exam";
import { User } from "@/types/user";

type CreateExamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Pick<Course, "id" | "title">[];
  faculties: User[];
  questions: Question[];
  categories: QuestionBankCategory[];
  defaultCourseIds?: number[];
  defaultFacultyIds?: number[];
  afterCreateBasePath?: string;
  hideFacultySelector?: boolean;
};

export function CreateExamDialog({
  open,
  onOpenChange,
  courses,
  faculties,
  questions,
  categories,
  defaultCourseIds = [],
  defaultFacultyIds = [],
  afterCreateBasePath,
  hideFacultySelector = false,
}: CreateExamDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState<ExamStatus>("draft");
  const [passingPercentage, setPassingPercentage] = useState("40");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [attemptLimit, setAttemptLimit] = useState("1");
  const [selectedCourseIds, setSelectedCourseIds] =
    useState<number[]>(defaultCourseIds);
  const [selectedFacultyIds, setSelectedFacultyIds] =
    useState<number[]>(defaultFacultyIds);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [fullscreenRequired, setFullscreenRequired] = useState(false);
  const [serverTimerEnabled, setServerTimerEnabled] = useState(true);
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);
  const [correctAnswerVisibility, setCorrectAnswerVisibility] =
    useState<CorrectAnswerVisibility>("after_submit");
  const [isSaving, setIsSaving] = useState(false);

  const toggleId = (id: number, values: number[], setValues: (ids: number[]) => void) => {
    setValues(values.includes(id) ? values.filter((item) => item !== id) : [...values, id]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      const response = await examClientService.createExam({
        title,
        description: description || undefined,
        instructions: instructions || undefined,
        status,
        passingPercentage: Number(passingPercentage || 40),
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        attemptLimit: attemptLimit ? Number(attemptLimit) : undefined,
        randomizeQuestions,
        shuffleOptions,
        fullscreenRequired,
        serverTimerEnabled,
        autoSubmitEnabled,
        correctAnswerVisibility,
        courseIds: selectedCourseIds,
        facultyIds: selectedFacultyIds,
      });

      toast.success("Exam created");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setInstructions("");
      setSelectedCourseIds(defaultCourseIds);
      setSelectedFacultyIds(defaultFacultyIds);
      if (afterCreateBasePath) {
        router.push(`${afterCreateBasePath}/${response.data.id}`);
      }
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Exam</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exam-title">Title</Label>
              <Input
                id="exam-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <NativeSelect
                className="w-full"
                value={status}
                onChange={(event) => setStatus(event.target.value as ExamStatus)}
              >
                <NativeSelectOption value="draft">Draft</NativeSelectOption>
                <NativeSelectOption value="published">Published</NativeSelectOption>
                <NativeSelectOption value="archived">Archived</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exam-description">Description</Label>
            <Textarea
              id="exam-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exam-instructions">Instructions</Label>
            <Textarea
              id="exam-instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="passing-percentage">Passing %</Label>
              <Input
                id="passing-percentage"
                type="number"
                min="0"
                max="100"
                value={passingPercentage}
                onChange={(event) => setPassingPercentage(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration-minutes">Duration Minutes</Label>
              <Input
                id="duration-minutes"
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attempt-limit">Attempt Limit</Label>
              <Input
                id="attempt-limit"
                type="number"
                min="1"
                value={attemptLimit}
                onChange={(event) => setAttemptLimit(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SelectionPanel
              title="Assign Courses"
              items={courses.map((course) => ({ id: course.id, label: course.title }))}
              selectedIds={selectedCourseIds}
              onToggle={(id) => toggleId(id, selectedCourseIds, setSelectedCourseIds)}
            />
            {hideFacultySelector ? null : (
              <SelectionPanel
                title="Assign Faculties"
                items={faculties.map((faculty) => ({
                  id: faculty.id,
                  label: `${faculty.firstName} ${faculty.lastName ?? ""}`.trim(),
                }))}
                selectedIds={selectedFacultyIds}
                onToggle={(id) => toggleId(id, selectedFacultyIds, setSelectedFacultyIds)}
              />
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ToggleRow
              label="Randomize questions"
              checked={randomizeQuestions}
              onCheckedChange={setRandomizeQuestions}
            />
            <ToggleRow
              label="Shuffle options"
              checked={shuffleOptions}
              onCheckedChange={setShuffleOptions}
            />
            <ToggleRow
              label="Full screen required"
              checked={fullscreenRequired}
              onCheckedChange={setFullscreenRequired}
            />
            <ToggleRow
              label="Server timer"
              checked={serverTimerEnabled}
              onCheckedChange={setServerTimerEnabled}
            />
            <ToggleRow
              label="Auto submit"
              checked={autoSubmitEnabled}
              onCheckedChange={setAutoSubmitEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Correct Answer Visibility</Label>
            <NativeSelect
              className="w-full"
              value={correctAnswerVisibility}
              onChange={(event) =>
                setCorrectAnswerVisibility(event.target.value as CorrectAnswerVisibility)
              }
            >
              <NativeSelectOption value="never">Never</NativeSelectOption>
              <NativeSelectOption value="after_submit">After Submit</NativeSelectOption>
              <NativeSelectOption value="after_passing">After Passing</NativeSelectOption>
              <NativeSelectOption value="after_exam_close">After Exam Close</NativeSelectOption>
            </NativeSelect>
          </div>

          <p className="text-xs text-muted-foreground">
            Question rules are configured after the exam is created. Current bank:
            {" "}
            {questions.length} questions across {categories.length} categories.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Create Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectionPanel({
  title,
  items,
  selectedIds,
  onToggle,
}: {
  title: string;
  items: { id: number; label: string }[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="rounded-md border border-border">
      <div className="border-b border-border px-3 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto p-3">
        {items.length ? (
          items.map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => onToggle(item.id)}
              />
              <span className="line-clamp-1">{item.label}</span>
            </label>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No records found.</p>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
