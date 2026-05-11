"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Archive,
  Eye,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import { Exam, ExamStatus } from "@/types/exam";

type ExamActionsProps = {
  exam: Exam;
  compact?: boolean;
  detailBasePath?: string;
  afterDeleteHref?: string;
};

export function ExamActions({
  exam,
  compact = false,
  detailBasePath = "/admin/exams",
  afterDeleteHref = "/admin/exams",
}: ExamActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const updateStatus = async (status: ExamStatus) => {
    try {
      setIsUpdatingStatus(true);
      await examClientService.updateExam(exam.id, { status });
      toast.success(
        status === "published"
          ? "Exam published"
          : status === "draft"
            ? "Exam unpublished"
            : "Exam archived",
      );
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteExam = async () => {
    try {
      setIsDeleting(true);
      await examClientService.deleteExam(exam.id);
      toast.success("Exam deleted");
      setDeleteOpen(false);
      router.push(afterDeleteHref);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const trigger = compact ? (
    <Button variant="outline" size="icon" disabled={isUpdatingStatus}>
      <MoreHorizontal className="size-4" />
    </Button>
  ) : (
    <Button variant="outline" disabled={isUpdatingStatus}>
      <MoreHorizontal className="size-4" />
      Actions
    </Button>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={`${detailBasePath}/${exam.id}`}>
              <Eye className="size-4" />
              View / edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${detailBasePath}/${exam.id}#settings`}>
              <Pencil className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {exam.status !== "published" ? (
            <DropdownMenuItem onClick={() => updateStatus("published")}>
              <Send className="size-4" />
              Publish
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => updateStatus("draft")}>
              <Undo2 className="size-4" />
              Unpublish
            </DropdownMenuItem>
          )}
          {exam.status !== "archived" ? (
            <DropdownMenuItem onClick={() => updateStatus("archived")}>
              <Archive className="size-4" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => updateStatus("draft")}>
              <Undo2 className="size-4" />
              Move to draft
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        deleteText="exam"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteExam}
        loading={isDeleting}
      />
    </>
  );
}
