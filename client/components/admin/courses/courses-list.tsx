"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Eye, Sparkles } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Course } from "@/types/course";
import { courseClientService } from "@/services/courses/course.client";
import { getCourseColumns } from "./course-columns";
import AddButton from "../data-table/add-button";
import { CreateCourseForm } from "./create-course-form";
import {
  AdminResourceDashboard,
  DeleteSelectedButton,
} from "@/components/admin/shared/admin-resource-dashboard";
import { getErrorMessage } from "@/lib/error-handler";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import {
  DateRangeValue,
  updateDateRangeSearchParams,
} from "@/lib/date-range";

interface CoursesListProps {
  courses: Course[];
  dateRange: DateRangeValue;
}

export const CoursesList = ({ courses, dateRange }: CoursesListProps) => {
  const [deleteItem, setDeleteItem] = useState<Course | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const columns = useMemo(
    () =>
      getCourseColumns((course) => {
        setDeleteItem(course);
        setDeleteOpen(true);
      }, async (course) => {
        try {
          setLoading(true);
          const response = await courseClientService.duplicate(course.id);
          toast.success("Course duplicated as a draft");
          router.push(`/admin/courses/${response.data.id}`);
          router.refresh();
        } catch (error: unknown) {
          toast.error(getErrorMessage(error));
        } finally {
          setLoading(false);
        }
      }),
    [router],
  );

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);
      await courseClientService.delete(deleteItem.id);
      toast.success("Course deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedForDelete.length) return;

    try {
      setLoading(true);
      await Promise.all(
        selectedForDelete.map((course) => courseClientService.delete(course.id)),
      );
      toast.success(`${selectedForDelete.length} courses deleted`);
      setBulkDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeApply = (nextRange: DateRangeValue) => {
    const params = updateDateRangeSearchParams(searchParams, nextRange);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Course Library"
        title="Courses dashboard"
        description="Review, search, export, and manage every course without changing the existing course creation flow."
        data={courses}
        columns={columns}
        searchPlaceholder="Search courses by title, category, or slug"
        searchFields={[
          (course) => course.title,
          (course) => course.slug,
          (course) => course.categories?.map((category) => category.name).join(" "),
        ]}
        stats={[
          { label: "Total Courses", value: courses.length, icon: BookOpen },
          {
            label: "Published",
            value: courses.filter((course) => course.isPublished).length,
            icon: Eye,
          },
          {
            label: "Featured",
            value: courses.filter((course) => course.isFeatured).length,
            icon: Sparkles,
          },
        ]}
        actions={
          <>
            <AddButton
              title="Add Course"
              redirectPath="/admin/courses"
              FormComponent={CreateCourseForm}
            />
            <DateRangeFilter value={dateRange} onChange={handleDateRangeApply} />
          </>
        }
        selectedActions={(selectedRows) => (
          <DeleteSelectedButton
            disabled={!selectedRows.length}
            onClick={() => {
              setSelectedForDelete(selectedRows);
              setBulkDeleteOpen(true);
            }}
          />
        )}
        exportFileName="courses-export.xlsx"
        mapExportRow={(course) => ({
          ID: course.id,
          Title: course.title,
          Slug: course.slug,
          PriceINR: course.priceInr ?? "",
          Published: course.isPublished ? "Yes" : "No",
          Featured: course.isFeatured ? "Yes" : "No",
          Categories: course.categories?.map((category) => category.name).join(", ") ?? "",
          CreatedAt: course.createdAt,
        })}
        emptyTitle="No courses found"
        emptyDescription="Courses will appear here once they are created."
      />

      <ConfirmDeleteDialog
        deleteText="course"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

      <ConfirmDeleteDialog
        deleteText="selected courses"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={loading}
      />
    </>
  );
};
