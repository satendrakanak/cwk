"use client";

import * as z from "zod";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { courseExamSchema } from "@/schemas/courses";
import { courseClientService } from "@/services/courses/course.client";
import { Course } from "@/types/course";
import { getErrorMessage } from "@/lib/error-handler";

interface CourseExamFormProps {
  course: Course;
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createOption = (text = "", isCorrect = false) => ({
  id: createId(),
  text,
  isCorrect,
});

const createQuestion = () => ({
  id: createId(),
  prompt: "",
  type: "single" as const,
  points: 1,
  explanation: "",
  acceptedAnswers: [],
  options: [createOption(), createOption()],
});

export function CourseExamForm({ course }: CourseExamFormProps) {
  const router = useRouter();
  const form = useForm<
    z.input<typeof courseExamSchema>,
    unknown,
    z.output<typeof courseExamSchema>
  >({
    resolver: zodResolver(courseExamSchema),
    mode: "onChange",
    defaultValues: {
      exam: course.exam
        ? {
            ...course.exam,
            timeLimitMinutes: course.exam.timeLimitMinutes ?? undefined,
            questions: course.exam.questions.map((question) => ({
              ...question,
              explanation: question.explanation ?? "",
              acceptedAnswers: question.acceptedAnswers ?? [],
              options: question.options.map((option) => ({
                id: option.id,
                text: option.text,
                isCorrect: !!option.isCorrect,
              })),
            })),
          }
        : {
            title: "",
            description: "",
            instructions: "",
            passingPercentage: 70,
            maxAttempts: 3,
            timeLimitMinutes: undefined,
            showResultImmediately: true,
            isPublished: false,
            questions: [createQuestion()],
          },
    },
  });

  const questionArray = useFieldArray({
    control: form.control,
    name: "exam.questions",
  });
  const showResultImmediately = useWatch({
    control: form.control,
    name: "exam.showResultImmediately",
  });
  const isPublished = useWatch({
    control: form.control,
    name: "exam.isPublished",
  });

  const onSubmit = async (data: z.infer<typeof courseExamSchema>) => {
    try {
      const exam = data.exam
        ? {
            ...data.exam,
            description: data.exam.description?.trim() || "",
            instructions: data.exam.instructions?.trim() || "",
            questions: data.exam.questions.map((question) => ({
              ...question,
              prompt: question.prompt.trim(),
              explanation: question.explanation?.trim() || "",
              acceptedAnswers:
                question.type === "short_text"
                  ? question.acceptedAnswers
                      ?.map((answer) => answer.trim())
                      .filter(Boolean) || []
                  : [],
              options:
                question.type === "short_text"
                  ? []
                  : question.options.map((option) => ({
                      ...option,
                      text: option.text.trim(),
                      isCorrect:
                        question.type === "drag_drop"
                          ? false
                          : option.isCorrect,
                    })),
            })),
          }
        : null;

      await courseClientService.update(course.id, { exam });
      router.refresh();
      toast.success("Course exam updated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--brand-700) dark:text-(--brand-200)">
            Final Exam
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
            Build the assessment learners must clear
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
            Create a Moodle-style final assessment with a pass percentage,
            attempt limit, timing, and question-level scoring. Certificates
            unlock only after the learner passes this exam.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => questionArray.append(createQuestion())}
          >
            <Plus className="size-4" />
            Add question
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
            onClick={() =>
              form.reset({
                exam: {
                  title: "",
                  description: "",
                  instructions: "",
                  passingPercentage: 70,
                  maxAttempts: 3,
                  timeLimitMinutes: undefined,
                  showResultImmediately: true,
                  isPublished: false,
                  questions: [createQuestion()],
                },
              })
            }
          >
            Reset exam
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white"
            onClick={async () => {
              try {
                await courseClientService.update(course.id, { exam: null });
                router.refresh();
                toast.success("Course exam removed successfully");
              } catch (error: unknown) {
                toast.error(getErrorMessage(error));
              }
            }}
          >
            Remove exam
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/4">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Exam title</FieldLabel>
                <Input
                  {...form.register("exam.title")}
                  className="h-12 rounded-2xl px-4"
                  placeholder="Final certification assessment"
                />
                <FieldError errors={[form.formState.errors.exam?.title]} />
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  {...form.register("exam.description")}
                  rows={3}
                  className="min-h-24 rounded-2xl px-4 py-3"
                  placeholder="Short intro shown before the learner starts the exam."
                />
                <FieldError
                  errors={[form.formState.errors.exam?.description]}
                />
              </Field>

              <Field>
                <FieldLabel>Instructions</FieldLabel>
                <Textarea
                  {...form.register("exam.instructions")}
                  rows={4}
                  className="min-h-28 rounded-2xl px-4 py-3"
                  placeholder="Mention negative marking policy, time guidance, and passing rule."
                />
                <FieldError
                  errors={[form.formState.errors.exam?.instructions]}
                />
              </Field>
            </FieldGroup>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Passing %</FieldLabel>
                <Input
                  type="number"
                  {...form.register("exam.passingPercentage")}
                  className="h-12 rounded-2xl px-4"
                />
                <FieldError
                  errors={[form.formState.errors.exam?.passingPercentage]}
                />
              </Field>

              <Field>
                <FieldLabel>Max attempts</FieldLabel>
                <Input
                  type="number"
                  {...form.register("exam.maxAttempts")}
                  className="h-12 rounded-2xl px-4"
                />
                <FieldError
                  errors={[form.formState.errors.exam?.maxAttempts]}
                />
              </Field>

              <Field>
                <FieldLabel>Time limit (minutes)</FieldLabel>
                <Input
                  type="number"
                  {...form.register("exam.timeLimitMinutes")}
                  className="h-12 rounded-2xl px-4"
                  placeholder="Optional"
                />
                <FieldError
                  errors={[form.formState.errors.exam?.timeLimitMinutes]}
                />
              </Field>
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Show result immediately
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Learner sees score and pass status right after submission.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!!showResultImmediately}
                  onChange={(event) =>
                    form.setValue(
                      "exam.showResultImmediately",
                      event.target.checked,
                    )
                  }
                  className="size-5 accent-(--brand-600)"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Publish this exam
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Published exams become mandatory for certificate
                    eligibility.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!!isPublished}
                  onChange={(event) =>
                    form.setValue("exam.isPublished", event.target.checked)
                  }
                  className="size-5 accent-(--brand-600)"
                />
              </label>
            </div>
          </div>
        </div>

        <FieldGroup className="gap-5">
          {questionArray.fields.map((questionField, questionIndex) => (
            <QuestionEditor
              key={questionField.id}
              control={form.control}
              errors={form.formState.errors}
              register={form.register}
              removeQuestion={() => questionArray.remove(questionIndex)}
              questionIndex={questionIndex}
            />
          ))}
        </FieldGroup>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="rounded-2xl px-6"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save exam"}
          </Button>
        </div>
      </form>
    </div>
  );
}

type QuestionEditorProps = {
  questionIndex: number;
  register: UseFormRegister<z.input<typeof courseExamSchema>>;
  control: Control<z.input<typeof courseExamSchema>>;
  errors: FieldErrors<z.input<typeof courseExamSchema>>;
  removeQuestion: () => void;
};

function QuestionEditor({
  questionIndex,
  register,
  control,
  errors,
  removeQuestion,
}: QuestionEditorProps) {
  const questionType = useWatch({
    control,
    name: `exam.questions.${questionIndex}.type`,
  });
  const optionsArray = useFieldArray({
    control,
    name: `exam.questions.${questionIndex}.options`,
  });

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Question {questionIndex + 1}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add prompt, marks, and correct option selection.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          onClick={removeQuestion}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field className="lg:col-span-3">
          <FieldLabel>Question prompt</FieldLabel>
          <Textarea
            {...register(`exam.questions.${questionIndex}.prompt`)}
            rows={3}
            className="min-h-24 rounded-2xl px-4 py-3"
            placeholder="Write the question exactly as it should appear to the learner."
          />
          <FieldError
            errors={[errors.exam?.questions?.[questionIndex]?.prompt]}
          />
        </Field>

        <Field>
          <FieldLabel>Question type</FieldLabel>
          <select
            {...register(`exam.questions.${questionIndex}.type`)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-xs outline-none transition focus:border-(--brand-500) focus:ring-2 focus:ring-(--brand-500)/20 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
          >
            <option value="single">Single choice</option>
            <option value="multiple">Multiple choice</option>
            <option value="true_false">True / False</option>
            <option value="short_text">Short written answer</option>
            <option value="drag_drop">Drag and drop order</option>
          </select>
          <FieldError
            errors={[errors.exam?.questions?.[questionIndex]?.type]}
          />
        </Field>

        <Field>
          <FieldLabel>Points</FieldLabel>
          <Input
            type="number"
            {...register(`exam.questions.${questionIndex}.points`)}
            className="h-12 w-full! rounded-2xl px-4"
          />
          <FieldError
            errors={[errors.exam?.questions?.[questionIndex]?.points]}
          />
        </Field>

        <Field className="lg:col-span-3">
          <FieldLabel>Explanation (optional)</FieldLabel>
          <Textarea
            {...register(`exam.questions.${questionIndex}.explanation`)}
            rows={2}
            className="min-h-20 rounded-2xl px-4 py-3"
            placeholder="Shown after submission to explain the correct answer."
          />
        </Field>
      </div>

      <div className="mt-5 space-y-3">
        {questionType === "short_text" ? (
          <ShortAnswerEditor
            questionIndex={questionIndex}
            control={control}
            register={register}
            errors={errors}
          />
        ) : (
          <>
            {optionsArray.fields.map((optionField, optionIndex) => (
              <div
                key={optionField.id}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/8 md:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <div className="flex items-center gap-2 pt-1">
                  {questionType === "drag_drop" ? (
                    <>
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-white/10 dark:text-slate-300"
                        onClick={() =>
                          optionIndex > 0 &&
                          optionsArray.move(optionIndex, optionIndex - 1)
                        }
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-white/10 dark:text-slate-300"
                        onClick={() =>
                          optionIndex < optionsArray.fields.length - 1 &&
                          optionsArray.move(optionIndex, optionIndex + 1)
                        }
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </>
                  ) : (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register(
                          `exam.questions.${questionIndex}.options.${optionIndex}.isCorrect`,
                        )}
                        className="size-4 accent-(--brand-600)"
                      />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Correct
                      </span>
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    {...register(
                      `exam.questions.${questionIndex}.options.${optionIndex}.text`,
                    )}
                    className="h-11 rounded-2xl px-4"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  {questionType === "drag_drop" ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      The current top-to-bottom order is treated as the correct
                      answer sequence.
                    </p>
                  ) : null}
                  <FieldError
                    errors={[
                      errors.exam?.questions?.[questionIndex]?.options?.[
                        optionIndex
                      ]?.text,
                    ]}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => optionsArray.remove(optionIndex)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <FieldError
              errors={[errors.exam?.questions?.[questionIndex]?.options]}
            />

            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => optionsArray.append(createOption())}
            >
              <Plus className="size-4" />
              {questionType === "drag_drop"
                ? "Add draggable item"
                : "Add option"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function ShortAnswerEditor({
  questionIndex,
  control,
  register,
  errors,
}: Pick<
  QuestionEditorProps,
  "questionIndex" | "control" | "register" | "errors"
>) {
  const acceptedAnswersArray = useFieldArray({
    control,
    name: `exam.questions.${questionIndex}.acceptedAnswers` as any,
  });

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/8">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Accepted answers
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Add all valid written answers a learner can type.
        </p>
      </div>

      {acceptedAnswersArray.fields.map((field, answerIndex) => (
        <div
          key={field.id}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
        >
          <Input
            {...register(
              `exam.questions.${questionIndex}.acceptedAnswers.${answerIndex}`,
            )}
            className="h-11 rounded-2xl px-4"
            placeholder={`Accepted answer ${answerIndex + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => acceptedAnswersArray.remove(answerIndex)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <FieldError
        errors={[errors.exam?.questions?.[questionIndex]?.acceptedAnswers]}
      />

      <Button
        type="button"
        variant="outline"
        className="rounded-2xl"
        onClick={() => acceptedAnswersArray.append("")}
      >
        <Plus className="size-4" />
        Add accepted answer
      </Button>
    </div>
  );
}
