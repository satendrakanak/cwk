import { ExamsList } from "@/components/admin/exams/exams-list";
import { getErrorMessage } from "@/lib/error-handler";
import { courseServerService } from "@/services/courses/course.server";
import { examServerService } from "@/services/exams/exam.server";
import { userServerService } from "@/services/users/user.server";
import { Course } from "@/types/course";
import { Exam, Question, QuestionBankCategory } from "@/types/exam";
import { User } from "@/types/user";

const ExamsPage = async () => {
  let exams: Exam[] = [];
  let categories: QuestionBankCategory[] = [];
  let questions: Question[] = [];
  let courses: Course[] = [];
  let faculties: User[] = [];

  try {
    const [
      examsResponse,
      categoriesResponse,
      questionsResponse,
      coursesResponse,
      facultiesResponse,
    ] =
      await Promise.all([
        examServerService.getExams({ limit: 100 }),
        examServerService.getQuestionBankCategories({ limit: 100 }),
        examServerService.getQuestions({ limit: 100 }),
        courseServerService.getAllCourses({ limit: 10000 }),
        userServerService.getFaculties(),
      ]);

    exams = examsResponse.data.data;
    categories = categoriesResponse.data.data;
    questions = questionsResponse.data.data;
    courses = coursesResponse.data.data;
    faculties = facultiesResponse.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <ExamsList
      exams={exams}
      categories={categories}
      questions={questions}
      courses={courses}
      faculties={faculties}
    />
  );
};

export default ExamsPage;
