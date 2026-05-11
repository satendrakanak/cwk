"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, Download, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { downloadRemoteFile } from "@/lib/download-file";
import { getErrorMessage } from "@/lib/error-handler";
import { cn } from "@/lib/utils";
import { certificateClientService } from "@/services/certificates/certificate.client";
import { examClientService } from "@/services/exams/exam.client";
import { Certificate } from "@/types/certificate";
import {
  LearnerCourseExamPayload,
  LearnerExamAttempt,
  LearnerExamQuestion,
} from "@/types/exam";
import { formatDateTime } from "@/utils/formate-date";

export function AdvancedCourseExamSection({
  courseId,
  refreshKey = 0,
  onSecureModeChange,
  onExitExam,
}: {
  courseId: number;
  refreshKey?: number;
  onSecureModeChange?: (isActive: boolean) => void;
  onExitExam?: () => void;
}) {
  const [payload, setPayload] = useState<LearnerCourseExamPayload>(null);
  const [attempt, setAttempt] = useState<LearnerExamAttempt | null>(null);
  const [submittedAttempt, setSubmittedAttempt] =
    useState<LearnerExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [isDownloadingCertificate, setIsDownloadingCertificate] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await examClientService.getCourseExamForLearner(courseId);
      setPayload(response.data);
      setAttempt(response.data?.activeAttempt ?? null);
      setSubmittedAttempt((current) => current ?? response.data?.attempts[0] ?? null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    onSecureModeChange?.(attempt?.status === "in_progress");
  }, [attempt?.status, onSecureModeChange]);

  useEffect(() => {
    if (!payload?.isPassed) {
      return;
    }

    let mounted = true;

    certificateClientService
      .getForCourse(courseId)
      .then((response) => {
        if (mounted) {
          setCertificate(response.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setCertificate(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [courseId, payload?.isPassed]);

  useEffect(() => {
    if (!attempt?.expiresAt || attempt.status !== "in_progress") {
      setTimeRemaining(null);
      return;
    }

    const tick = () => {
      const remaining = Math.max(
        Math.floor((new Date(attempt.expiresAt || 0).getTime() - Date.now()) / 1000),
        0,
      );
      setTimeRemaining(remaining);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [attempt?.expiresAt, attempt?.status]);

  const questions = useMemo(() => attempt?.questions ?? [], [attempt?.questions]);
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const answeredCount = questions.filter((question) => {
    const answer = answers[question.id];
    return (
      answer !== null &&
      answer !== undefined &&
      answer !== "" &&
      (!Array.isArray(answer) || answer.length > 0)
    );
  }).length;

  const startAttempt = async () => {
    try {
      setIsStarting(true);
      if (payload?.exam.fullscreenRequired) {
        if (!document.fullscreenEnabled) {
          toast.error("Fullscreen mode is required for this exam.");
          return;
        }
        await document.documentElement.requestFullscreen();
        setIsFullscreen(Boolean(document.fullscreenElement));
      }
      const response = await examClientService.startCourseExamAttempt(courseId);
      setAttempt(response.data);
      setSubmittedAttempt(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsStarting(false);
    }
  };

  const generateCertificate = useCallback(async () => {
    try {
      setIsGeneratingCertificate(true);
      const response = await certificateClientService.generateForCourse(courseId);
      setCertificate(response.data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsGeneratingCertificate(false);
    }
  }, [courseId]);

  const submitAttempt = useCallback(
    async (autoSubmitted = false) => {
      if (!attempt) return;

      const answerPayload = questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id] ?? null,
      }));

      const unanswered = answerPayload.filter((item) => {
        const value = item.answer;
        return (
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        );
      });

      if (unanswered.length && !autoSubmitted) {
        toast.error("Please answer all questions before submitting.");
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await examClientService.submitExamAttempt(
          attempt.id,
          answerPayload,
          autoSubmitted,
        );
        const nextAttempt = response.data;
        setAttempt(response.data);
        setSubmittedAttempt(nextAttempt);
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
        if (nextAttempt.passed && !nextAttempt.needsManualGrading) {
          await generateCertificate();
        }
        await load();
        toast.success(
          response.data.needsManualGrading
            ? "Exam submitted. Manual grading is pending."
            : response.data.passed
              ? "Great work. You passed the exam."
              : "Exam submitted. Please review your result.",
        );
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, attempt, generateCertificate, load, questions],
  );

  useEffect(() => {
    if (
      timeRemaining === 0 &&
      attempt?.status === "in_progress" &&
      payload?.exam.autoSubmitEnabled &&
      !isSubmitting
    ) {
      void submitAttempt(true);
    }
  }, [
    attempt?.status,
    isSubmitting,
    payload?.exam.autoSubmitEnabled,
    submitAttempt,
    timeRemaining,
  ]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.warning("Please stay on the exam screen while attempting.");
      }
    };
    const handleFullscreenChange = () => {
      const nextIsFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(nextIsFullscreen);
      if (payload?.exam.fullscreenRequired && !nextIsFullscreen) {
        toast.warning("Fullscreen mode is required for this exam.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [attempt, payload?.exam.fullscreenRequired]);

  const enterFullscreen = async () => {
    if (!document.fullscreenEnabled) {
      toast.error("Fullscreen mode is not available in this browser.");
      return;
    }

    await document.documentElement.requestFullscreen();
    setIsFullscreen(true);
  };

  const exitExam = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setIsFullscreen(false);
    onExitExam?.();
  };

  const downloadCertificate = async () => {
    try {
      const fileUrl = certificate?.file?.path;

      if (!fileUrl) {
        toast.error("Certificate file is not ready yet.");
        return;
      }

      setIsDownloadingCertificate(true);
      await downloadRemoteFile(
        fileUrl,
        `${certificate?.certificateNumber || "certificate"}.pdf`,
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDownloadingCertificate(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading exam workspace...
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="rounded-[28px] border border-border bg-card p-8 text-sm text-muted-foreground">
        Final exam is not assigned to this course yet.
      </div>
    );
  }

  const activeAttempt = attempt?.status === "in_progress" ? attempt : null;
  const latestAttempt =
    submittedAttempt ??
    (attempt?.status !== "in_progress" ? attempt : payload.attempts[0]);
  const showResultOnly = Boolean(latestAttempt?.passed || payload.isPassed);

  return (
    <div
      className={cn(
        "mx-auto w-full space-y-5",
        showResultOnly && !activeAttempt
          ? "flex min-h-[calc(100vh-8.5rem)] max-w-5xl items-center justify-center"
          : "max-w-6xl",
      )}
    >
      {!activeAttempt && !showResultOnly ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-muted/35 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Final Exam
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-card-foreground">
              {payload.exam.title}
            </h2>
            {payload.exam.description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {payload.exam.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-5 p-5 sm:p-6">
              {payload.exam.instructions ? (
                <div className="rounded-xl border border-border bg-background p-4">
                  <h3 className="font-semibold text-card-foreground">
                    Before you start
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {payload.exam.instructions}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-3">
                <ReadinessStep
                  title="Course complete"
                  description={
                    payload.isUnlocked
                      ? "You can start this exam."
                      : payload.unlockMessage
                  }
                  state={payload.isUnlocked ? "done" : "blocked"}
                />
                <ReadinessStep
                  title="Attempts available"
                  description={
                    payload.attemptsRemaining === null
                      ? "Unlimited attempts available."
                      : `${payload.attemptsRemaining} attempt left.`
                  }
                  state={payload.canAttempt || payload.isPassed ? "done" : "blocked"}
                />
                <ReadinessStep
                  title="Focused screen"
                  description={
                    payload.exam.fullscreenRequired
                      ? "Fullscreen will open before exam starts."
                      : "Keep this page open while attempting."
                  }
                  state="done"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-card-foreground">
                    Start only when you are ready.
                  </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are now in a dedicated exam workspace. Keep this page open
                  until you submit.
                  </p>
                </div>
                <Button
                  onClick={startAttempt}
                  disabled={!payload.canAttempt || isStarting}
                  className="sm:min-w-48"
                >
                  {isStarting
                    ? "Starting..."
                    : payload.exam.fullscreenRequired
                      ? "Start Fullscreen Exam"
                      : "Start Exam"}
                </Button>
              </div>

              {!payload.canAttempt ? (
                <p className="text-sm text-muted-foreground">
                  {!payload.isUnlocked
                    ? payload.unlockMessage
                    : payload.isPassed
                      ? "You have already passed this exam."
                      : "No attempts are available. Please contact support if management has approved another attempt."}
                </p>
              ) : null}
            </div>

            <div className="border-t border-border bg-muted/20 p-5 lg:border-l lg:border-t-0">
              <div className="grid gap-3">
                <MetricCard
                  label="Passing score"
                  value={`${payload.exam.passingPercentage}%`}
                />
                <MetricCard
                  label="Time limit"
                  value={
                    payload.exam.durationMinutes
                      ? `${payload.exam.durationMinutes} min`
                      : "No limit"
                  }
                />
                <MetricCard label="Used attempts" value={payload.attemptsUsed} />
                <MetricCard
                  label="Remaining"
                  value={formatAttemptCount(payload.attemptsRemaining)}
                />
                {payload.extraAttempts ? (
                  <MetricCard
                    label="Extra approved"
                    value={payload.extraAttempts}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeAttempt ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="sticky top-0 z-10 border-b border-border bg-card/95 p-4 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Exam in progress
                </p>
                <h3 className="mt-1 text-xl font-semibold text-card-foreground">
                  Question {Math.min(currentQuestionIndex + 1, questions.length)} of{" "}
                  {questions.length}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {answeredCount}/{questions.length} answered
                </span>
                {timeRemaining !== null ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {formatSeconds(timeRemaining)}
                  </span>
                ) : null}
                {payload.exam.fullscreenRequired ? (
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium",
                      isFullscreen
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600",
                    )}
                  >
                    {isFullscreen ? "Fullscreen active" : "Fullscreen needed"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[11rem_minmax(0,1fr)]">
            <div className="border-b border-border bg-muted/20 p-4 lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-6 gap-2 lg:grid-cols-3">
                {questions.map((question, index) => {
                  const isAnswered = answers[question.id] !== undefined;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={cn(
                        "h-10 rounded-lg border text-sm font-semibold transition",
                        index === currentQuestionIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : isAnswered
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                            : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {currentQuestion ? (
                <QuestionCard
                  question={currentQuestion}
                  index={currentQuestionIndex}
                  value={answers[currentQuestion.id]}
                  onChange={(value) =>
                    setAnswers((current) => ({
                      ...current,
                      [currentQuestion.id]: value,
                    }))
                  }
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex((current) =>
                      Math.max(current - 1, 0),
                    )
                  }
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <div className="flex justify-end gap-3">
                  {payload.exam.fullscreenRequired && !isFullscreen ? (
                    <Button variant="outline" onClick={enterFullscreen}>
                      Enter Fullscreen
                    </Button>
                  ) : null}
                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex((current) =>
                          Math.min(current + 1, questions.length - 1),
                        )
                      }
                    >
                      Save & Next
                    </Button>
                  ) : (
                    <Button
                      onClick={() => submitAttempt(false)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Exam"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {latestAttempt ? (
        <AttemptResult
          attempt={latestAttempt}
          overallFeedback={payload.exam.overallFeedback}
          certificate={certificate}
          isGeneratingCertificate={isGeneratingCertificate}
          isDownloadingCertificate={isDownloadingCertificate}
          onGenerateCertificate={generateCertificate}
          onDownloadCertificate={downloadCertificate}
          onExitExam={exitExam}
        />
      ) : null}
    </div>
  );
}

function QuestionCard({
  question,
  index,
  value,
  onChange,
}: {
  question: LearnerExamQuestion;
  index: number;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const selectedValues = Array.isArray(value) ? value.map(String) : [];
  const selectedValue = typeof value === "string" ? value : "";

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Question {index + 1}
          </p>
          <h5 className="mt-2 text-base font-semibold text-card-foreground">
            {question.prompt}
          </h5>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {question.points} pts
        </span>
      </div>

      {["mcq_single", "true_false"].includes(question.type) ? (
        <div className="mt-4 grid gap-2">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left text-sm leading-6 transition",
                selectedValue === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40",
              )}
            >
              {option.text}
            </button>
          ))}
        </div>
      ) : null}

      {question.type === "mcq_multiple" ? (
        <div className="mt-4 grid gap-2">
          {question.options.map((option) => {
            const checked = selectedValues.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onChange(
                    checked
                      ? selectedValues.filter((id) => id !== option.id)
                      : [...selectedValues, option.id],
                  )
                }
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm leading-6 transition",
                  checked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40",
                )}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      ) : null}

      {["short_answer", "essay", "numerical"].includes(question.type) ? (
        <Textarea
          className="mt-4"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          rows={question.type === "essay" ? 6 : 3}
        />
      ) : null}

      {question.type === "matching" ? (
        <Textarea
          className="mt-4"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          placeholder="Write matching pairs, one per line"
        />
      ) : null}
    </div>
  );
}

function AttemptResult({
  attempt,
  overallFeedback,
  certificate,
  isGeneratingCertificate,
  isDownloadingCertificate,
  onGenerateCertificate,
  onDownloadCertificate,
  onExitExam,
}: {
  attempt: LearnerExamAttempt;
  overallFeedback?: string | null;
  certificate?: Certificate | null;
  isGeneratingCertificate?: boolean;
  isDownloadingCertificate?: boolean;
  onGenerateCertificate?: () => void;
  onDownloadCertificate?: () => void;
  onExitExam?: () => void;
}) {
  const correctAnswersVisible = attempt.questions?.some((question) =>
    question.options.some((option) => option.isCorrect !== undefined),
  );
  const isPassed = attempt.passed && !attempt.needsManualGrading;
  const resultLabel = attempt.needsManualGrading
    ? "Manual review"
    : attempt.passed
      ? "Passed"
      : "Needs retry";

  if (isPassed) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <PassConfetti />
        <div className="grid min-h-[500px] items-center gap-0 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="flex justify-center p-6 sm:p-10">
            <div className="w-full max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
                Passed
              </div>
              <h4 className="mt-5 text-3xl font-semibold tracking-tight text-card-foreground sm:text-4xl">
                Congratulations, your exam is cleared.
              </h4>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Your result is saved and your certificate is ready to download.
                Keep this PDF for your records.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Score"
                  value={`${attempt.score}/${attempt.maxScore}`}
                />
                <MetricCard
                  label="Percentage"
                  value={`${Math.round(attempt.percentage)}%`}
                />
                <MetricCard label="Result" value="Passed" />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {!certificate && onGenerateCertificate ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled={isGeneratingCertificate}
                    onClick={onGenerateCertificate}
                  >
                    <Award className="size-4" />
                    {isGeneratingCertificate
                      ? "Generating..."
                      : "Generate Certificate"}
                  </Button>
                ) : null}
                {certificate && onDownloadCertificate ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled={isDownloadingCertificate}
                    onClick={onDownloadCertificate}
                  >
                    <Download className="size-4" />
                    {isDownloadingCertificate ? "Downloading..." : "Download PDF"}
                  </Button>
                ) : null}
                {onExitExam ? (
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={onExitExam}
                  >
                    Back to course
                  </Button>
                ) : null}
              </div>

              {attempt.submittedAt ? (
                <p className="mt-5 text-sm text-muted-foreground">
                  Submitted on {formatDateTime(attempt.submittedAt)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center border-t border-border bg-muted/20 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="flex w-full max-w-sm flex-col justify-center rounded-2xl border border-border bg-background p-6 lg:min-h-80">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Certificate
              </p>
              <h5 className="mt-2 text-xl font-semibold text-card-foreground">
                Unlocked and ready
              </h5>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {certificate
                  ? certificate.certificateNumber
                  : isGeneratingCertificate
                    ? "Generating certificate..."
                    : "Generate the certificate to create your downloadable PDF."}
              </p>
              <div className="mt-6 rounded-xl border border-dashed border-border p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 font-semibold text-emerald-600">
                  {certificate ? "PDF available" : "Awaiting generation"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Exam submitted
          </p>
          <h4 className="mt-1 text-xl font-semibold text-card-foreground">
            {attempt.needsManualGrading
              ? "Your answers are submitted for review"
              : attempt.passed
                ? "Congratulations, you passed"
                : "Your exam has been submitted"}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {attempt.submittedAt ? formatDateTime(attempt.submittedAt) : "In progress"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold",
              attempt.passed
                ? "bg-emerald-500/10 text-emerald-600"
                : attempt.needsManualGrading
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-destructive/10 text-destructive",
            )}
          >
            {attempt.needsManualGrading
              ? "Manual grading pending"
              : attempt.passed
                ? "Passed"
                : "Not passed"}
          </span>
          {onExitExam ? (
            <Button type="button" onClick={onExitExam}>
              Exit Exam
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Score" value={`${attempt.score}/${attempt.maxScore}`} />
        <MetricCard label="Percentage" value={`${Math.round(attempt.percentage)}%`} />
        <MetricCard label="Result" value={resultLabel} />
      </div>
      {overallFeedback ? (
        <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
          {overallFeedback}
        </div>
      ) : null}
      {correctAnswersVisible ? (
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-card-foreground">
            Correct answers are visible for this result.
          </p>
          <div className="mt-3 space-y-3">
            {attempt.questions?.map((question, index) => {
              const correctOptions = question.options.filter(
                (option) => option.isCorrect,
              );
              return (
                <div key={question.id} className="text-sm">
                  <p className="font-medium text-card-foreground">
                    {index + 1}. {question.prompt}
                  </p>
                  {correctOptions.length ? (
                    <p className="mt-1 text-muted-foreground">
                      Answer: {correctOptions.map((option) => option.text).join(", ")}
                    </p>
                  ) : null}
                  {question.acceptedAnswers?.length ? (
                    <p className="mt-1 text-muted-foreground">
                      Accepted: {question.acceptedAnswers.join(", ")}
                    </p>
                  ) : null}
                  {question.numericalAnswers?.length ? (
                    <p className="mt-1 text-muted-foreground">
                      Accepted:{" "}
                      {question.numericalAnswers
                        .map((item) => item.value)
                        .join(", ")}
                    </p>
                  ) : null}
                  {question.explanation ? (
                    <p className="mt-1 text-muted-foreground">
                      {question.explanation}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PassConfetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="absolute top-[-16px] h-3 w-2 animate-[exam-confetti_1.8s_ease-out_forwards] rounded-sm opacity-90"
          style={{
            left: `${6 + index * 5}%`,
            animationDelay: `${(index % 6) * 0.08}s`,
            backgroundColor: [
              "var(--primary)",
              "#16a34a",
              "#f59e0b",
              "#0ea5e9",
              "#ec4899",
            ][index % 5],
            transform: `rotate(${index * 21}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes exam-confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(150px) rotate(260deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function ReadinessStep({
  title,
  description,
  state,
}: {
  title: string;
  description: string;
  state: "done" | "blocked";
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
          state === "done"
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-amber-500/10 text-amber-600",
        )}
      >
        {state === "done" ? "Ready" : "Pending"}
      </span>
      <h3 className="mt-3 font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-card-foreground">{value}</p>
    </div>
  );
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatAttemptCount(value: number | null | undefined) {
  return value === null || value === undefined ? "Unlimited" : value;
}
