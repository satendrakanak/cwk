import { QuestionsList } from "@/components/admin/exams/questions-list";
import { getErrorMessage } from "@/lib/error-handler";
import { examServerService } from "@/services/exams/exam.server";
import type { Question, QuestionBankCategory } from "@/types/exam";

const FacultyQuestionBankPage = async () => {
  let questions: Question[] = [];
  let categories: QuestionBankCategory[] = [];

  try {
    const [questionsResponse, categoriesResponse] = await Promise.all([
      examServerService.getQuestions({ limit: 10000 }),
      examServerService.getQuestionBankCategories({ limit: 10000 }),
    ]);

    questions = questionsResponse.data.data;
    categories = categoriesResponse.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return <QuestionsList questions={questions} categories={categories} />;
};

export default FacultyQuestionBankPage;
