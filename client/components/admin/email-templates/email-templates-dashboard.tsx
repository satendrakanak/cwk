"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileCode2, Mail, Plus, Send } from "lucide-react";
import { toast } from "sonner";

import {
  AdminResourceDashboard,
  DeleteSelectedButton,
} from "@/components/admin/shared/admin-resource-dashboard";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { getErrorMessage } from "@/lib/error-handler";
import { emailTemplateClientService } from "@/services/email-templates/email-template.client";
import { EmailTemplate } from "@/types/email-template";
import { EmailTemplateDrawer } from "./email-template-drawer";
import { getEmailTemplateColumns } from "./email-template-columns";

export function EmailTemplatesDashboard({
  templates,
}: {
  templates: EmailTemplate[];
}) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<EmailTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<EmailTemplate[]>(
    [],
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo(
    () =>
      getEmailTemplateColumns(
        (template) => {
          setSelectedTemplate(template);
          setIsDrawerOpen(true);
        },
        (template) => {
          setDeleteItem(template);
          setDeleteOpen(true);
        },
      ),
    [],
  );

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setIsDeleting(true);
      await emailTemplateClientService.delete(deleteItem.id);
      toast.success("Email template deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedForDelete.length) return;

    try {
      setIsDeleting(true);
      await Promise.all(
        selectedForDelete.map((template) =>
          emailTemplateClientService.delete(template.id),
        ),
      );
      toast.success(`${selectedForDelete.length} templates deleted`);
      setBulkDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Communication Center"
        title="Email templates"
        description="Create and maintain all transactional email templates used for purchases, enrollments, certificates, and account events."
        data={templates}
        columns={columns}
        searchPlaceholder="Search by template key or subject"
        searchFields={[
          (template) => template.templateName,
          (template) => template.subject,
          (template) => template.body,
        ]}
        stats={[
          { label: "Total Templates", value: templates.length, icon: Mail },
          {
            label: "Transactional",
            value: templates.filter((item) =>
              /purchase|enroll|certificate|welcome|verification/i.test(
                item.templateName,
              ),
            ).length,
            icon: Send,
          },
          {
            label: "Editable Blocks",
            value: templates.filter((item) => item.body?.includes("{{")).length,
            icon: FileCode2,
          },
        ]}
        actions={
          <Button
            className="rounded-2xl"
            onClick={() => {
              setSelectedTemplate(null);
              setIsDrawerOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Template
          </Button>
        }
        selectedActions={(selectedRows) => (
          <DeleteSelectedButton
            disabled={!selectedRows.length}
            label="Delete Selected"
            onClick={() => {
              setSelectedForDelete(selectedRows);
              setBulkDeleteOpen(true);
            }}
          />
        )}
        exportFileName="email-templates-export.xlsx"
        mapExportRow={(template) => ({
          ID: template.id,
          Template: template.templateName,
          Subject: template.subject,
          Updated: template.updatedAt,
        })}
        emptyTitle="No email templates found"
        emptyDescription="Create your first template and connect it to an automated email flow."
      />

      <EmailTemplateDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        template={selectedTemplate}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        deleteText={deleteItem?.templateName || "email template"}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={isDeleting}
        deleteText="selected email templates"
      />
    </>
  );
}
