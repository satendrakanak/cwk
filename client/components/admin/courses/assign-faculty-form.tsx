"use client";

import { useEffect, useState } from "react";
import { Course } from "@/types/course";
import { courseClientService } from "@/services/courses/course.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";
import { userClientService } from "@/services/users/user.client";
import { User } from "@/types/user";

interface AssignFacultyFormProps {
  course: Course;
}

export const AssignFacultyForm = ({ course }: AssignFacultyFormProps) => {
  const [faculties, setFaculties] = useState<User[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const router = useRouter();
  // 🔥 Load faculties + preselect
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const response = await userClientService.getAllFaculties();
        setFaculties(response.data as User[]);

        // prefill from course
        const existing = course.faculties?.map((f) => f.id) || [];
        setSelected(existing);
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        toast.error(message);
      }
    };

    loadFaculties();
  }, [course]);

  // 🔥 Auto Save
  const saveFaculties = async (updated: number[]) => {
    try {
      await courseClientService.update(course.id, {
        facultyIds: updated,
      });
      router.refresh();
      toast.success("Faculties assigned successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };
  const toggleFaculty = (id: number) => {
    let updated: number[];

    if (selected.includes(id)) {
      updated = selected.filter((item) => item !== id);
    } else {
      updated = [...selected, id];
    }

    setSelected(updated);
    saveFaculties(updated);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
          Assign Faculties
        </h3>
      </div>

      <div className="space-y-3 p-4">
        {/* Gray Panel (no shadow, clean) */}
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/4">
          <div className="space-y-2">
            {faculties.map((faculty) => {
              const isChecked = selected.includes(faculty.id);

              return (
                <label
                  key={faculty.id}
                  className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFaculty(faculty.id)}
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                  {faculty.firstName} {faculty.lastName}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
