"use client";
import { DataTable } from "@/components/admin/data-table/data-table";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserColumns } from "./user-columns";
import AddButton from "../data-table/add-button";
import { User } from "@/types/user";
import { CreateUserForm } from "./create-user-form";
import { userClientService } from "@/services/users/user.client";
import { getErrorMessage } from "@/lib/error-handler";

interface UsersListProps {
  users: User[];
}

export const UsersList = ({ users }: UsersListProps) => {
  const [deleteItem, setDeleteItem] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (user: User) => {
    setDeleteItem(user);
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);

      await userClientService.delete(deleteItem.id);

      toast.success("User deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const columns = getUserColumns(handleDeleteClick);
  return (
    <div>
      <DataTable
        data={users}
        columns={columns}
        searchColumn="firstName"
        action={
          <AddButton
            title="Add User"
            redirectPath="/admin/users"
            FormComponent={CreateUserForm}
          />
        }
      />
      <ConfirmDeleteDialog
        deleteText="user"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
};
