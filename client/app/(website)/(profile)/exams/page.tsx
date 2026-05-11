import { ExamsView } from "@/components/profile/exams-view";
import { getSession } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-handler";
import { courseExamsServerService } from "@/services/course-exams/course-exams.server";
import { userServerService } from "@/services/users/user.server";
import { Course } from "@/types/course";
import { ExamHistoryRecord } from "@/types/exam";

export default async function ExamsPage() {
  const session = await getSession();
  if (!session?.id) return null;

  let courses: Course[] = [];
  let examHistory: ExamHistoryRecord[] = [];

  try {
    const [coursesRes, examHistoryRes] = await Promise.all([
      userServerService.getEnrolledCourses(session.id),
      courseExamsServerService.getMyHistory(),
    ]);

    courses = coursesRes.data;
    examHistory = examHistoryRes.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <div className="space-y-6">
      <ExamsView courses={courses} examHistory={examHistory} />
    </div>
  );
}
