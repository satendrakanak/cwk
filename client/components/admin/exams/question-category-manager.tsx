"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import { QuestionBankCategory } from "@/types/exam";
import { CreateCategoryDialog } from "./create-category-dialog";

type CategoryDialogState = {
  mode: "edit" | "duplicate";
  category: QuestionBankCategory;
} | null;

export function QuestionCategoryManager({
  categories,
}: {
  categories: QuestionBankCategory[];
}) {
  const router = useRouter();
  const [dialogState, setDialogState] = useState<CategoryDialogState>(null);
  const [deleteCategory, setDeleteCategory] =
    useState<QuestionBankCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteCategory) return;

    try {
      setIsDeleting(true);
      await examClientService.deleteCategory(deleteCategory.id);
      toast.success("Question category deleted");
      setDeleteCategory(null);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Manage Question Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {category.name}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {category.description || category.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.parent?.name ?? "Root"}
                  </TableCell>
                  <TableCell className="text-right">
                    {category.questionsCount ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() =>
                            setDialogState({ mode: "edit", category })
                          }
                        >
                          <Edit className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDialogState({ mode: "duplicate", category })
                          }
                        >
                          <Copy className="size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteCategory(category)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-28 text-center text-muted-foreground"
                >
                  No categories created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <CreateCategoryDialog
          open={Boolean(dialogState)}
          onOpenChange={(open) => {
            if (!open) setDialogState(null);
          }}
          mode={dialogState?.mode}
          category={dialogState?.category}
          categories={categories}
        />

        <ConfirmDeleteDialog
          deleteText="question category"
          open={Boolean(deleteCategory)}
          onClose={() => setDeleteCategory(null)}
          onConfirm={handleDelete}
          loading={isDeleting}
        />
      </CardContent>
    </Card>
  );
}
