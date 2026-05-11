"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconPlus } from "@tabler/icons-react";
import { MessageSquareQuote, PlayCircle, Sparkles } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import { testimonialClientService } from "@/services/testimonials/testimonial.client";
import { Testimonial } from "@/types/testimonial";
import { getTestimonialColumns } from "./testimonial-columns";
import { TestimonialDrawer } from "./testimonial-drawer";
import {
  AdminResourceDashboard,
  DeleteSelectedButton,
} from "@/components/admin/shared/admin-resource-dashboard";
import { getErrorMessage } from "@/lib/error-handler";

interface TestimonialsListProps {
  testimonials: Testimonial[];
}

export const TestimonialsList = ({ testimonials }: TestimonialsListProps) => {
  const router = useRouter();
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Testimonial | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setSelected(null);
    setOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setSelected(testimonial);
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const columns = useMemo(
    () =>
      getTestimonialColumns(handleEdit, (testimonial) => {
        setDeleteItem(testimonial);
        setDeleteOpen(true);
      }),
    [],
  );

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);
      await testimonialClientService.delete(deleteItem.id);
      toast.success("Testimonial deleted");
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
        selectedForDelete.map((testimonial) =>
          testimonialClientService.delete(testimonial.id),
        ),
      );
      toast.success(`${selectedForDelete.length} testimonials deleted`);
      setBulkDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Learner Stories"
        title="Testimonials dashboard"
        description="Manage written and video testimonials, featured stories, moderation status, and course links."
        data={testimonials}
        columns={columns}
        searchPlaceholder="Search testimonials by name, company, course, or status"
        searchFields={[
          (testimonial) => testimonial.name,
          (testimonial) => testimonial.company,
          (testimonial) => testimonial.designation,
          (testimonial) => testimonial.status,
          (testimonial) => testimonial.type,
          (testimonial) => testimonial.courses?.map((course) => course.title).join(" "),
        ]}
        stats={[
          { label: "Total Testimonials", value: testimonials.length, icon: MessageSquareQuote },
          {
            label: "Featured",
            value: testimonials.filter((testimonial) => testimonial.isFeatured).length,
            icon: Sparkles,
          },
          {
            label: "Video Stories",
            value: testimonials.filter((testimonial) => testimonial.type === "VIDEO").length,
            icon: PlayCircle,
          },
        ]}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 rounded-2xl"
            onClick={handleCreate}
          >
            <IconPlus className="size-4" />
            <span className="hidden lg:inline">Add Testimonial</span>
          </Button>
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
        exportFileName="testimonials-export.xlsx"
        mapExportRow={(testimonial) => ({
          ID: testimonial.id,
          Name: testimonial.name,
          Type: testimonial.type,
          Company: testimonial.company ?? "",
          Designation: testimonial.designation ?? "",
          Rating: testimonial.rating,
          Status: testimonial.status,
          Active: testimonial.isActive ? "Yes" : "No",
          Featured: testimonial.isFeatured ? "Yes" : "No",
          Courses: testimonial.courses?.map((course) => course.title).join(", ") ?? "",
          CreatedAt: testimonial.createdAt,
        })}
        emptyTitle="No testimonials found"
        emptyDescription="Testimonials will appear here once they are created."
      />

      <TestimonialDrawer
        open={open}
        onClose={handleDrawerClose}
        testimonial={selected}
      />

      <ConfirmDeleteDialog
        deleteText="testimonial"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

      <ConfirmDeleteDialog
        deleteText="selected testimonials"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={loading}
      />
    </>
  );
};
