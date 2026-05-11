import { CategoriesDashboardLoader } from "@/components/admin/categories/categories-dashboard-loader";
import { categoryServerService } from "@/services/categories/category.server";
import { Category } from "@/types/category";
import { getErrorMessage } from "@/lib/error-handler";

async function getAllCategories() {
  const allCategories: Category[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await categoryServerService.list({ page, limit: 100 });
    allCategories.push(...response.data.data);
    totalPages = response.data.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return allCategories;
}

const CategoriesPage = async () => {
  let categories: Category[];

  try {
    categories = await getAllCategories();
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return <CategoriesDashboardLoader categories={categories} />;
};

export default CategoriesPage;
