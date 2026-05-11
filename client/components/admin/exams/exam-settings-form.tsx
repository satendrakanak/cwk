"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CorrectAnswerVisibility, Exam, ExamStatus } from "@/types/exam";
import { User } from "@/types/user";

type ExamSettingsFormProps = {
  exam: Exam;
  courses: Pick<Course, "id" | "title">[];
  faculties: User[];
  hideFacultySelector?: boolean;
};

export function ExamSettingsForm({
  exam,
  courses,
  faculties,
  hideFacultySelector = false,
}: ExamSettingsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(exam.title);
  const [description, setDescription] = useState(exam.description ?? "");
  const [instructions, setInstructions] = useState(exam.instructions ?? "");
  const [status, setStatus] = useState<ExamStatus>(exam.status);
  const [passingPercentage, setPassingPercentage] = useState(
    String(Number(exam.passingPercentage)),
  );
  const [durationMinutes, setDurationMinutes] = useState(
    exam.durationMinutes ? String(exam.durationMinutes) : "",
  );
  const [attemptLimit, setAttemptLimit] = useState(
    exam.attemptLimit ? String(exam.attemptLimit) : "",
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState(
    exam.courses?.map((course) => course.id) ?? [],
  );
  const [selectedFacultyIds, setSelectedFacultyIds] = useState(
    exam.faculties?.map((faculty) => faculty.id) ?? [],
  );
  const [randomizeQuestions, setRandomizeQuestions] = useState(
    exam.randomizeQuestions,
  );
  const [shuffleOptions, setShuffleOptions] = useState(exam.shuffleOptions);
  const [adaptiveMode, setAdaptiveMode] = useState(exam.adaptiveMode);
  const [retryPenaltyPercentage, setRetryPenaltyPercentage] = useState(
    String(Number(exam.retryPenaltyPercentage || 0)),
  );
  const [allowedIpRanges, setAllowedIpRanges] = useState(
    exam.allowedIpRanges?.join("\n") ?? "",
  );
  const [fullscreenRequired, setFullscreenRequired] = useState(
    exam.fullscreenRequired,
  );
  const [serverTimerEnabled, setServerTimerEnabled] = useState(
    exam.serverTimerEnabled,
  );
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(
    exam.autoSubmitEnabled,
  );
  const [correctAnswerVisibility, setCorrectAnswerVisibility] =
    useState<CorrectAnswerVisibility>(exam.correctAnswerVisibility);
  const [perQuestionFeedbackEnabled, setPerQuestionFeedbackEnabled] = useState(
    exam.perQuestionFeedbackEnabled,
  );
  const [overallFeedback, setOverallFeedback] = useState(
    exam.overallFeedback ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleId = (
    id: number,
    values: number[],
    setValues: (ids: number[]) => void,
  ) => {
    setValues(
      values.includes(id)
        ? values.filter((item) => item !== id)
        : [...values, id],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      await examClientService.updateExam(exam.id, {
        title,
        description: description || undefined,
        instructions: instructions || undefined,
        status,
        passingPercentage: Number(passingPercentage || 40),
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        attemptLimit: attemptLimit ? Number(attemptLimit) : undefined,
        randomizeQuestions,
        shuffleOptions,
        adaptiveMode,
        retryPenaltyPercentage: Number(retryPenaltyPercentage || 0),
        fullscreenRequired,
        allowedIpRanges: allowedIpRanges
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        serverTimerEnabled,
        autoSubmitEnabled,
        perQuestionFeedbackEnabled,
        overallFeedback: overallFeedback || undefined,
        correctAnswerVisibility,
        courseIds: selectedCourseIds,
        facultyIds: hideFacultySelector ? undefined : selectedFacultyIds,
      });
      toast.success("Exam updated");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Exam Settings</CardTitle>
      </CardHeader>
      <CardContent>
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
            <NumberField
              id="passing-percentage"
              label="Passing %"
              value={passingPercentage}
              min={0}
              max={100}
              onChange={setPassingPercentage}
            />
            <NumberField
              id="duration-minutes"
              label="Duration Minutes"
              value={durationMinutes}
              min={1}
              onChange={setDurationMinutes}
            />
            <NumberField
              id="attempt-limit"
              label="Attempt Limit"
              value={attemptLimit}
              min={1}
              onChange={setAttemptLimit}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SelectionPanel
              title="Assigned Courses"
              items={courses.map((course) => ({ id: course.id, label: course.title }))}
              selectedIds={selectedCourseIds}
              onToggle={(id) =>
                toggleId(id, selectedCourseIds, setSelectedCourseIds)
              }
            />
            {hideFacultySelector ? null : (
              <SelectionPanel
                title="Assigned Faculties"
                items={faculties.map((faculty) => ({
                  id: faculty.id,
                  label: `${faculty.firstName} ${faculty.lastName ?? ""}`.trim(),
                }))}
                selectedIds={selectedFacultyIds}
                onToggle={(id) =>
                  toggleId(id, selectedFacultyIds, setSelectedFacultyIds)
                }
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
              label="Adaptive retry mode"
              checked={adaptiveMode}
              onCheckedChange={setAdaptiveMode}
            />
            <NumberField
              id="retry-penalty"
              label="Retry penalty %"
              value={retryPenaltyPercentage}
              min={0}
              max={100}
              onChange={setRetryPenaltyPercentage}
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
            <ToggleRow
              label="Per question feedback"
              checked={perQuestionFeedbackEnabled}
              onCheckedChange={setPerQuestionFeedbackEnabled}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="allowed-ip-ranges">Allowed IP ranges</Label>
              <Textarea
                id="allowed-ip-ranges"
                value={allowedIpRanges}
                onChange={(event) => setAllowedIpRanges(event.target.value)}
                rows={4}
                placeholder="Leave blank for all locations. Add one IP/range per line."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overall-feedback">Overall feedback</Label>
              <Textarea
                id="overall-feedback"
                value={overallFeedback}
                onChange={(event) => setOverallFeedback(event.target.value)}
                rows={4}
                placeholder="Optional message shown after submission."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Correct Answer Visibility</Label>
            <NativeSelect
              className="w-full"
              value={correctAnswerVisibility}
              onChange={(event) =>
                setCorrectAnswerVisibility(
                  event.target.value as CorrectAnswerVisibility,
                )
              }
            >
              <NativeSelectOption value="never">Never</NativeSelectOption>
              <NativeSelectOption value="after_submit">After Submit</NativeSelectOption>
              <NativeSelectOption value="after_passing">After Passing</NativeSelectOption>
              <NativeSelectOption value="after_exam_close">After Exam Close</NativeSelectOption>
            </NativeSelect>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
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
      <div className="max-h-56 space-y-2 overflow-y-auto p-3">
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
