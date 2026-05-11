import { ExamDetailDashboard } from "@/components/admin/exams/exam-detail-dashboard";
import { getErrorMessage } from "@/lib/error-handler";
import { courseServerService } from "@/services/courses/course.server";
import { examServerService } from "@/services/exams/exam.server";
import { userServerService } from "@/services/users/user.server";
import { Course } from "@/types/course";
import { Exam, Question, QuestionBankCategory } from "@/types/exam";
import { User } from "@/types/user";

type ExamDetailPageProps = {
  params: Promise<{ examId: string }>;
};

const ExamDetailPage = async ({ params }: ExamDetailPageProps) => {
  const { examId } = await params;
  const parsedExamId = Number(examId);
  let exam: Exam;
  let courses: Course[] = [];
  let faculties: User[] = [];
  let questions: Question[] = [];
  let categories: QuestionBankCategory[] = [];

  try {
    const [
      examResponse,
      coursesResponse,
      facultiesResponse,
      questionsResponse,
      categoriesResponse,
    ] = await Promise.all([
      examServerService.getExamById(parsedExamId),
      courseServerService.getAllCourses({ limit: 10000 }),
      userServerService.getFaculties(),
      examServerService.getQuestions({ limit: 10000 }),
      examServerService.getQuestionBankCategories({ limit: 10000 }),
    ]);

    exam = examResponse.data;
    courses = coursesResponse.data.data;
    faculties = facultiesResponse.data;
    questions = questionsResponse.data.data;
    categories = categoriesResponse.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <ExamDetailDashboard
      exam={exam}
      courses={courses}
      faculties={faculties}
      questions={questions}
      categories={categories}
    />
  );
};

export default ExamDetailPage;
