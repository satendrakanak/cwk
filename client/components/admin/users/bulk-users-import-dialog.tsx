"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, UploadCloud } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userClientService } from "@/services/users/user.client";
import { getErrorMessage } from "@/lib/error-handler";
import {
  downloadUsersImportTemplate,
  parseUsersSpreadsheet,
} from "./users-utils";

export function BulkUsersImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<
    Awaited<ReturnType<typeof parseUsersSpreadsheet>>
  >([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewRows = useMemo(() => parsedRows.slice(0, 8), [parsedRows]);

  const handleFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    setParsedRows([]);

    if (!nextFile) {
      return;
    }

    try {
      setIsParsing(true);
      const users = await parseUsersSpreadsheet(nextFile);
      setParsedRows(users);
      toast.success(`${users.length} users ready for import`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedRows.length) {
      toast.error("Please upload a valid Excel file first");
      return;
    }

    try {
      setIsSubmitting(true);
      await userClientService.createBulk({ users: parsedRows });
      toast.success(`${parsedRows.length} users imported successfully`);
      setFile(null);
      setParsedRows([]);
      onOpenChange(false);
      onImported();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{
          width: "min(1100px, calc(100vw - 2rem))",
          maxWidth: "min(1100px, calc(100vw - 2rem))",
        }}
        className="!grid !w-[min(1100px,calc(100vw-2rem))] !max-w-[min(1100px,calc(100vw-2rem))] max-h-[min(760px,calc(100vh-3rem))] overflow-hidden rounded-[28px] border-[var(--brand-100)] bg-white p-0 shadow-[0_32px_100px_-50px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)]"
      >
        <DialogHeader className="border-b border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] px-8 py-6 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(17,27,46,0.98)_0%,rgba(23,34,55,0.98)_55%,rgba(33,46,72,0.98)_100%)]">
          <DialogTitle className="text-xl font-semibold text-slate-950 dark:text-white">
            Import users from Excel
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Upload `.xlsx`, `.xls`, or `.csv` files. Username, student role, and the default password are assigned automatically.
          </p>
        </DialogHeader>

        <div className="space-y-6 overflow-hidden px-8 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[var(--brand-200)] bg-[var(--brand-50)]/40 px-5 py-4 text-sm text-slate-600 transition hover:border-[var(--brand-300)] dark:border-white/15 dark:bg-white/6 dark:text-slate-200">
              <UploadCloud className="size-5 text-[var(--brand-600)]" />
              <span>{file ? file.name : "Choose spreadsheet"}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
              />
            </label>

            <Button
              variant="outline"
              onClick={downloadUsersImportTemplate}
              className="min-h-14 rounded-2xl px-5"
            >
              <FileSpreadsheet className="size-4" />
              Download Template
            </Button>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Import preview
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Required columns: `firstName`, `email`. Optional: `lastName`, `phoneNumber`.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Username
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  Auto-generated
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Password
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  Temp@1234
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Role
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  student
                </p>
              </div>
            </div>

            <ScrollArea className="mt-4 h-[320px] rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-white/8">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.3fr_1.35fr_1fr_1.1fr_0.9fr] gap-4 border-b border-slate-100 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Username</span>
                  <span>Password</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/10">
                  {previewRows.length ? (
                    previewRows.map((row, index) => (
                      <div
                        key={`${row.email}-${index}`}
                        className="grid grid-cols-[1.3fr_1.35fr_1fr_1.1fr_0.9fr] gap-4 px-5 py-4 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <span>{`${row.firstName} ${row.lastName ?? ""}`}</span>
                        <span>{row.email}</span>
                        <span>{row.phoneNumber ?? "-"}</span>
                        <span>Auto</span>
                        <span>Temp@1234</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-20 text-center text-sm text-slate-400 dark:text-slate-500">
                      {isParsing
                        ? "Parsing your spreadsheet..."
                        : "Upload a file to preview rows before importing."}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-8 py-5 dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-2xl px-5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isSubmitting || isParsing || parsedRows.length === 0}
            className="rounded-2xl px-5"
          >
            {isSubmitting ? "Importing..." : `Import ${parsedRows.length || ""} Users`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
