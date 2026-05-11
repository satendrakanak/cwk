import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Clock, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/types/course";
import { Exam, Question, QuestionBankCategory } from "@/types/exam";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";
import { ExamActions } from "./exam-actions";
import { ExamQuestionRulesEditor } from "./exam-question-rules-editor";
import { ExamSettingsForm } from "./exam-settings-form";
import { ExamStatusBadge } from "./exam-status-badge";

type ExamDetailDashboardProps = {
  exam: Exam;
  courses: Pick<Course, "id" | "title">[];
  faculties: User[];
  questions: Question[];
  categories: QuestionBankCategory[];
  backHref?: string;
  backLabel?: string;
  detailBasePath?: string;
  questionBankHref?: string;
  hideFacultySelector?: boolean;
};

export function ExamDetailDashboard({
  exam,
  courses,
  faculties,
  questions,
  categories,
  backHref = "/admin/exams",
  backLabel = "Exams",
  detailBasePath = "/admin/exams",
  questionBankHref = "/admin/exams/questions",
  hideFacultySelector = false,
}: ExamDetailDashboardProps) {
  const ruleCount = exam.questionRules?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {exam.title}
            </h1>
            <ExamStatusBadge status={exam.status} />
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {exam.description ||
              "Manage exam settings, assigned courses, faculty, and question rules."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExamActions
            exam={exam}
            detailBasePath={detailBasePath}
            afterDeleteHref={backHref}
          />
        </div>
      </div>

      <PublishReadiness exam={exam} />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Assigned Courses"
          value={exam.courses?.length ?? 0}
          icon={BookOpenCheck}
        />
        <SummaryCard
          label="Question Rules"
          value={ruleCount}
          icon={GraduationCap}
        />
        <SummaryCard
          label="Duration"
          value={exam.durationMinutes ? `${exam.durationMinutes}m` : "No limit"}
          icon={Clock}
        />
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="rules">Question Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <ExamSettingsForm
            exam={exam}
            courses={courses}
            faculties={faculties}
            hideFacultySelector={hideFacultySelector}
          />
        </TabsContent>
        <TabsContent value="rules">
          <ExamQuestionRulesEditor
            exam={exam}
            questions={questions}
            categories={categories}
            questionBankHref={questionBankHref}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PublishReadiness({ exam }: { exam: Exam }) {
  const hasCourses = Boolean(exam.courses?.length);
  const hasRules = Boolean(exam.questionRules?.length);
  const ready = hasCourses && hasRules;

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        ready
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
    >
      {ready
        ? "Ready to publish: this exam has assigned courses and question rules."
        : "Before publishing, assign at least one course and add question rules."}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof BookOpenCheck;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
