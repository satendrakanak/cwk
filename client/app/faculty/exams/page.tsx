import { FacultyExamsPage } from "@/components/faculty/dashboard/faculty-exams-page";
import { canAssignExamFaculty } from "@/lib/access-control";
import { examServerService } from "@/services/exams/exam.server";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import { userServerService } from "@/services/users/user.server";

export default async function FacultyExamsRoutePage() {
  const [workspace, attempts, questions, categories, me] = await Promise.all([
    facultyWorkspaceServer.getWorkspace(),
    facultyWorkspaceServer.getExamAttempts(),
    examServerService.getQuestions({ limit: 10000 }),
    examServerService.getQuestionBankCategories({ limit: 10000 }),
    userServerService.getMe(),
  ]);

  return (
    <FacultyExamsPage
      exams={workspace.exams}
      courses={workspace.courses}
      faculties={[me.data]}
      questions={questions.data.data}
      categories={categories.data.data}
      attempts={attempts}
      canAssignFaculty={canAssignExamFaculty(me.data)}
    />
  );
}
