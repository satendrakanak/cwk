import { notFound } from "next/navigation";

import { ExamDetailDashboard } from "@/components/admin/exams/exam-detail-dashboard";
import { canAssignExamFaculty } from "@/lib/access-control";
import { getErrorMessage } from "@/lib/error-handler";
import { examServerService } from "@/services/exams/exam.server";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import { userServerService } from "@/services/users/user.server";
import type { Exam, Question, QuestionBankCategory } from "@/types/exam";
import type { FacultyWorkspaceCourse } from "@/types/faculty-workspace";
import type { User } from "@/types/user";

type FacultyExamDetailPageProps = {
  params: Promise<{ examId: string }>;
};

const FacultyExamDetailPage = async ({ params }: FacultyExamDetailPageProps) => {
  const { examId } = await params;
  const parsedExamId = Number(examId);

  if (!Number.isFinite(parsedExamId)) {
    notFound();
  }

  let workspaceResponse: Awaited<
    ReturnType<typeof facultyWorkspaceServer.getWorkspace>
  >;
  let examResponse: Awaited<ReturnType<typeof examServerService.getExamById>>;
  let questionsResponse: Awaited<ReturnType<typeof examServerService.getQuestions>>;
  let categoriesResponse: Awaited<
    ReturnType<typeof examServerService.getQuestionBankCategories>
  >;
  let meResponse: Awaited<ReturnType<typeof userServerService.getMe>>;

  try {
    [
      workspaceResponse,
      examResponse,
      questionsResponse,
      categoriesResponse,
      meResponse,
    ] = await Promise.all([
      facultyWorkspaceServer.getWorkspace(),
      examServerService.getExamById(parsedExamId),
      examServerService.getQuestions({ limit: 10000 }),
      examServerService.getQuestionBankCategories({ limit: 10000 }),
      userServerService.getMe(),
    ]);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  const canManageExam = workspaceResponse.exams.some(
    (workspaceExam) => workspaceExam.id === parsedExamId,
  );

  if (!canManageExam) {
    notFound();
  }

  const exam: Exam = examResponse.data;
  const courses: FacultyWorkspaceCourse[] = workspaceResponse.courses;
  const faculties: User[] = [meResponse.data];
  const questions: Question[] = questionsResponse.data.data;
  const categories: QuestionBankCategory[] = categoriesResponse.data.data;

  return (
    <ExamDetailDashboard
      exam={exam}
      courses={courses}
      faculties={faculties}
      questions={questions}
      categories={categories}
      backHref="/faculty/exams"
      backLabel="Faculty exams"
      detailBasePath="/faculty/exams"
      questionBankHref="/faculty/exams/questions"
      hideFacultySelector={!canAssignExamFaculty(meResponse.data)}
    />
  );
};

export default FacultyExamDetailPage;
