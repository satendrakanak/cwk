"use client";

import { Card, CardContent } from "@/components/ui/card";

import { CreateCourseForm } from "@/components/admin/courses/create-course-form";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-4">
          <CreateCourseForm
            onSuccess={(id) => {
              router.push(`/admin/courses/${id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
