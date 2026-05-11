import { TagsDashboardLoader } from "@/components/admin/tags/tags-dashboard-loader";
import { tagServerService } from "@/services/tags/tag.server";
import { Tag } from "@/types/tag";
import { getErrorMessage } from "@/lib/error-handler";

const TagsPage = async () => {
  let tags: Tag[];

  try {
    const response = await tagServerService.getAll();
    tags = Array.isArray(response.data)
      ? response.data
      : response.data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return <TagsDashboardLoader tags={tags} />;
};

export default TagsPage;
