"use client";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkCoursePublish } from "@/helpers/publish-rules";
import { cn } from "@/lib/utils";
import { courseClientService } from "@/services/courses/course.client";
import { Course } from "@/types/course";
import {
  CheckCircle,
  LayoutPanelTop,
  RotateCcw,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getErrorMessage } from "@/lib/error-handler";

interface CourseHeaderProps {
  course: Course;
  canManageActions?: boolean;
}

export const CourseHeader = ({
  course,
  canManageActions = true,
}: CourseHeaderProps) => {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { canPublish, reasons } = checkCoursePublish(course);

  const handleToggleHero = async () => {
    try {
      await courseClientService.update(course.id, {
        showInHero: !course.showInHero,
      });

      toast.success(
        course.showInHero ? "Removed from home hero" : "Added to home hero",
      );

      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };
  const handleTogglePopular = async () => {
    try {
      await courseClientService.update(course.id, {
        showInPopular: !course.showInPopular,
      });

      toast.success(
        course.showInPopular
          ? "Removed from popular courses"
          : "Added to popular courses",
      );

      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  const handleToggleMegaMenu = async () => {
    try {
      await courseClientService.update(course.id, {
        showInMegaMenu: !course.showInMegaMenu,
      });

      toast.success(
        course.showInMegaMenu
          ? "Removed from mega menu"
          : "Added to mega menu",
      );

      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };
  // 🔥 Toggle Publish
  const handleTogglePublish = async () => {
    try {
      await courseClientService.update(course.id, {
        isPublished: !course.isPublished,
      });

      toast.success(
        course.isPublished ? "Course unpublished" : "Course published",
      );

      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  // 🔥 Delete Course
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await courseClientService.delete(course.id);

      toast.success("Course deleted");
      router.push("/admin/courses");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete course");
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
    }
  };
  const isPublishAction = !course.isPublished;
  const disabled = isPublishAction && !canPublish;
  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-white/10 dark:bg-[rgba(11,18,32,0.88)]">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* 🔥 LEFT */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {course.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={course.isPublished ? "default" : "secondary"}
              className="text-xs"
            >
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
            {course.showInHero && (
              <Badge className="border border-amber-200 bg-amber-100 text-xs text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/12 dark:text-amber-200">
                Home Hero
              </Badge>
            )}
            {course.showInPopular && (
              <Badge className="border border-emerald-200 bg-emerald-100 text-xs text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/12 dark:text-emerald-200">
                Popular
              </Badge>
            )}
            {course.showInMegaMenu && (
              <Badge className="border border-sky-200 bg-sky-100 text-xs text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/12 dark:text-sky-200">
                Mega Menu
              </Badge>
            )}

            <p className="text-sm text-muted-foreground">
              Manage your course settings
            </p>
          </div>
        </div>

        {/* 🔥 RIGHT */}
        {canManageActions ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            size="sm"
            onClick={handleToggleHero}
            className={cn(
              "flex items-center gap-1 transition",
              course.showInHero
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-700 hover:bg-gray-800",
            )}
          >
            <Star className="size-4" />
            {course.showInHero ? "Remove Hero" : "Home Hero"}
          </Button>
          <Button
            size="sm"
            onClick={handleTogglePopular}
            className={cn(
              "flex items-center gap-1 transition",
              course.showInPopular
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-700 hover:bg-gray-800",
            )}
          >
            <TrendingUp className="size-4" />
            {course.showInPopular ? "Remove Popular" : "Popular"}
          </Button>
          <Button
            size="sm"
            onClick={handleToggleMegaMenu}
            className={cn(
              "flex items-center gap-1 transition",
              course.showInMegaMenu
                ? "bg-sky-600 hover:bg-sky-700"
                : "bg-gray-700 hover:bg-gray-800",
            )}
          >
            <LayoutPanelTop className="size-4" />
            {course.showInMegaMenu ? "Remove Menu" : "Mega Menu"}
          </Button>
          {/* Publish / Unpublish */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  {" "}
                  {/* 🔥 wrapper (IMPORTANT for disabled button) */}
                  <Button
                    size="sm"
                    disabled={disabled}
                    onClick={handleTogglePublish}
                    className={cn(
                      "flex items-center gap-1 whitespace-nowrap transition",
                      course.isPublished
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-green-600 hover:bg-green-700",
                      disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {course.isPublished ? (
                      <>
                        <RotateCcw className="size-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <CheckCircle className="size-4" />
                        Publish
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>

              {/* 🔥 TOOLTIP CONTENT */}
              {disabled && (
                <TooltipContent
                  side="bottom"
                  align="end"
                  sideOffset={10}
                  className="flex flex-col rounded-md border bg-white p-3 text-gray-800 shadow-md dark:border-white/10 dark:bg-[rgba(17,27,46,0.98)] dark:text-slate-100"
                >
                  {/* 🔥 HEADING */}
                  <p className="text-sm font-semibold mb-2">
                    Complete required steps
                  </p>

                  {/* 🔥 LIST */}
                  <ul className="text-xs space-y-1">
                    {reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span className="leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Delete */}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setOpenDeleteDialog(true)} // 🔥 open dialog
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          </div>
        ) : (
          <Badge variant="outline" className="w-fit">
            Assigned faculty edit
          </Badge>
        )}
        {canManageActions ? (
          <ConfirmDeleteDialog
            deleteText="course"
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            onConfirm={handleDelete}
            loading={isDeleting}
          />
        ) : null}
      </div>
    </div>
  );
};
