import { QuestionCategoriesList } from "@/components/admin/exams/question-categories-list";
import { getErrorMessage } from "@/lib/error-handler";
import { examServerService } from "@/services/exams/exam.server";
import type { QuestionBankCategory } from "@/types/exam";

const FacultyQuestionCategoriesPage = async () => {
  let categories: QuestionBankCategory[] = [];

  try {
    const response = await examServerService.getQuestionBankCategories({
      limit: 10000,
    });
    categories = response.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return <QuestionCategoriesList categories={categories} />;
};

export default FacultyQuestionCategoriesPage;
