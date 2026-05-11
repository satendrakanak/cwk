"use client";

import { useState } from "react";
import {
  BookOpenCheck,
  ClipboardList,
  FolderTree,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { Exam, Question, QuestionBankCategory } from "@/types/exam";
import { User } from "@/types/user";
import { CreateCategoryDialog } from "./create-category-dialog";
import { CreateExamDialog } from "./create-exam-dialog";
import { CreateQuestionDialog } from "./create-question-dialog";
import { ExamStatCard } from "./exam-stat-card";
import { ExamsTable } from "./exams-table";
import { QuestionCategoryManager } from "./question-category-manager";
import { QuestionBankSummary } from "./question-bank-summary";
import { QuestionManager } from "./question-manager";

type ExamsDashboardProps = {
  exams: Exam[];
  categories: QuestionBankCategory[];
  questions: Question[];
  courses: Course[];
  faculties: User[];
};

export function ExamsDashboard({
  exams,
  categories,
  questions,
  courses,
  faculties,
}: ExamsDashboardProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const publishedCount = exams.filter((exam) => exam.status === "published").length;
  const advancedTypesCount = new Set(questions.map((question) => question.type)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Advanced Assessment Engine
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Exams & Question Bank
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Exams are now managed independently from courses, with reusable
            question pools, faculty assignment, server-timed attempts, and grading
            controls.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setCategoryOpen(true)}>
            Add Category
          </Button>
          <Button variant="outline" onClick={() => setQuestionOpen(true)}>
            Add Question
          </Button>
          <Button onClick={() => setExamOpen(true)}>Create Exam</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ExamStatCard label="Total Exams" value={exams.length} icon={BookOpenCheck} />
        <ExamStatCard label="Published" value={publishedCount} icon={ShieldCheck} />
        <ExamStatCard label="Categories" value={categories.length} icon={FolderTree} />
        <ExamStatCard label="Question Types" value={advancedTypesCount} icon={ClipboardList} />
      </div>

      <QuestionBankSummary categories={categories} questions={questions} />
      <QuestionCategoryManager categories={categories} />
      <QuestionManager questions={questions} categories={categories} />
      <ExamsTable exams={exams} />

      <CreateCategoryDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        categories={categories}
      />
      <CreateQuestionDialog
        open={questionOpen}
        onOpenChange={setQuestionOpen}
        categories={categories}
      />
      <CreateExamDialog
        open={examOpen}
        onOpenChange={setExamOpen}
        courses={courses}
        faculties={faculties}
        questions={questions}
        categories={categories}
      />
    </div>
  );
}
