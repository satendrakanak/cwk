"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { WebsiteNavUser } from "@/components/auth/website-nav-user";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { AdvancedCourseExamSection } from "./advanced-course-exam-section";

export function CourseExamPageClient({ course }: { course: Course }) {
  const router = useRouter();
  const learnUrl = `/course/${course.slug}/learn`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="shrink-0">
              <Logo />
            </div>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Exam Workspace
              </p>
              <h1 className="truncate text-sm font-semibold text-card-foreground sm:max-w-120">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(learnUrl)}
              className="hidden sm:inline-flex"
            >
              <ArrowLeft className="size-4" />
              Back to course
            </Button>
            <WebsiteNavUser />
          </div>
        </div>
      </header>

      <main className="px-4 py-5 sm:px-6">
        <AdvancedCourseExamSection
          courseId={course.id}
          onExitExam={() => router.push(learnUrl)}
        />
      </main>
    </div>
  );
}
