import { userServerService } from "@/services/users/user.server";
import { User } from "@/types/user";
import { getErrorMessage } from "@/lib/error-handler";
import { UserHeader } from "@/components/admin/users/user-header";
import { UserBasicInfoForm } from "@/components/admin/users/user-basic-info-form";
import { UserProfileForm } from "@/components/admin/users/user-profile-form";
import { UserProfileSettingsForm } from "@/components/admin/users/user-profile-settings-form";
import { UserRightSidebar } from "@/components/admin/users/user-right-sidebar";
import { FacultyProfileForm } from "@/components/admin/users/faculty-profile-form";
import { UserExamAccessForm } from "@/components/admin/users/user-exam-access-form";
import { courseExamsServerService } from "@/services/course-exams/course-exams.server";
import { UserExamAccessOverview } from "@/types/exam";

export default async function UserIdPage({
  params,
}: {
  params: Promise<{ userId: number }>;
}) {
  const { userId } = await params;

  let user: User;
  let examAccessItems: UserExamAccessOverview[] = [];

  try {
    const [response, examAccessResponse] = await Promise.all([
      userServerService.getById(userId),
      courseExamsServerService.getUserAccessOverview(userId),
    ]);
    user = response.data;
    examAccessItems = examAccessResponse.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  const isFaculty = user.roles?.some((r) => r.name === "faculty");
  return (
    <div>
      <UserHeader user={user} />

      <div className="grid grid-cols-5 gap-6 py-6">
        <div className="col-span-4 space-y-6">
          <UserBasicInfoForm user={user} />
          <UserProfileForm user={user} />

          <UserProfileSettingsForm user={user} />
          {isFaculty && <FacultyProfileForm user={user} />}
          <UserExamAccessForm userId={user.id} items={examAccessItems} />
        </div>

        <div className="col-span-1">
          <UserRightSidebar user={user} />
        </div>
      </div>
    </div>
  );
}
