"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "@/types/user";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";

interface UserHeaderProps {
  user: User;
}

export const UserHeader = ({ user }: UserHeaderProps) => {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      //await userClientService.delete(course.id);

      toast.success("User deleted");
      router.push("/admin/users");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete course");
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
    }
  };
  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-white/10 dark:bg-[rgba(11,18,32,0.88)]">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {user.firstName + " " + user.lastName}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Manage user settings
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setOpenDeleteDialog(true)}
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
        <ConfirmDeleteDialog
          deleteText="user"
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDelete}
          loading={isDeleting}
        />
      </div>
    </div>
  );
};
