"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CalendarRange,
  Download,
  Filter,
  Mail,
  MessageCircleMore,
  Phone,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { ContactLead, ContactLeadStatus } from "@/types/contact-lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableContent } from "@/components/admin/data-table/data-table-content";
import { DataTablePagination } from "@/components/admin/data-table/data-table-pagination";
import { contactLeadClientService } from "@/services/contact-leads/contact-lead.client";
import { getErrorMessage } from "@/lib/error-handler";
import { formatDateTime } from "@/utils/formate-date";

const statusOptions: Array<"all" | ContactLeadStatus> = [
  "all",
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CLOSED",
];

export function ContactLeadsDashboard({ leads }: { leads: ContactLead[] }) {
  const [leadRows, setLeadRows] = useState(leads);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ContactLeadStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [, startTransition] = useTransition();

  const filteredLeads = useMemo(() => {
    return leadRows.filter((lead) => {
      const needle = search.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        [
          lead.fullName,
          lead.email,
          lead.phoneNumber,
          lead.subject,
          lead.message,
          lead.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);

      const matchesStatus = status === "all" || lead.status === status;
      const leadDate = new Date(lead.createdAt).toISOString().slice(0, 10);
      const matchesFrom = !dateFrom || leadDate >= dateFrom;
      const matchesTo = !dateTo || leadDate <= dateTo;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [dateFrom, dateTo, leadRows, search, status]);

  const columns = useMemo<ColumnDef<ContactLead>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Lead",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-semibold text-slate-950 dark:text-white">
              {row.original.fullName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        cell: ({ row }) => row.original.phoneNumber || "—",
      },
      {
        accessorKey: "subject",
        header: "Enquiry",
        cell: ({ row }) => (
          <div className="max-w-[360px]">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {row.original.subject || "General enquiry"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {row.original.message}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Received",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onValueChange={(value) => {
              startTransition(async () => {
                try {
                  await contactLeadClientService.update(row.original.id, {
                    status: value as ContactLeadStatus,
                  });
                  setLeadRows((current) =>
                    current.map((lead) =>
                      lead.id === row.original.id
                        ? { ...lead, status: value as ContactLeadStatus }
                        : lead,
                    ),
                  );
                  toast.success("Lead status updated");
                } catch (error) {
                  toast.error(getErrorMessage(error));
                }
              });
            }}
          >
            <SelectTrigger className="h-9 w-[150px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions
                .filter((item) => item !== "all")
                .map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ),
      },
    ],
    [startTransition],
  );

  // TanStack Table exposes stateful helpers; keeping it local avoids stale references.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredLeads,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportLeads = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLeads.map((lead) => ({
        Name: lead.fullName,
        Email: lead.email,
        Phone: lead.phoneNumber || "",
        Subject: lead.subject || "",
        Message: lead.message,
        Status: lead.status,
        Source: lead.source || "",
        PageUrl: lead.pageUrl || "",
        CreatedAt: lead.createdAt,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Leads");
    XLSX.writeFile(workbook, "contact-leads.xlsx");
  };

  const todayLeads = leadRows.filter(
    (lead) =>
      new Date(lead.createdAt).toISOString().slice(0, 10) ===
      new Date().toISOString().slice(0, 10),
  ).length;
  const openLeads = leadRows.filter((lead) =>
    ["NEW", "CONTACTED", "QUALIFIED"].includes(lead.status),
  ).length;
  const closedLeads = leadRows.filter(
    (lead) => lead.status === "CLOSED",
  ).length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[var(--brand-100)] bg-[radial-gradient(circle_at_top_left,rgba(201,79,63,0.14),transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef4ff_100%)] p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex rounded-full border border-[var(--brand-200)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-700)] dark:border-white/10 dark:bg-white/8 dark:text-[var(--brand-200)]">
              Contact Leads
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                Enquiries, intent, and follow-up in one place
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                Review incoming enquiries, filter by date or status, and export
                the full lead list for your follow-up workflow.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="rounded-2xl bg-white/80 dark:border-white/10 dark:bg-white/8"
            onClick={exportLeads}
          >
            <Download className="size-4" />
            Export leads
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard
            icon={MessageCircleMore}
            label="Total Leads"
            value={leadRows.length}
          />
          <StatCard icon={CalendarRange} label="Today" value={todayLeads} />
          <StatCard icon={Mail} label="Open Pipeline" value={openLeads} />
          <StatCard icon={Phone} label="Closed" value={closedLeads} />
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
        <div className="grid gap-4 xl:grid-cols-[1fr_180px_180px_180px_auto]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone, subject, or message"
            className="h-11 rounded-2xl"
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="h-11 rounded-2xl"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="h-11 rounded-2xl"
          />
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as "all" | ContactLeadStatus)
            }
          >
            <SelectTrigger className="h-11! rounded-2xl">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "all" ? "All statuses" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-11 rounded-2xl"
            onClick={() => {
              setSearch("");
              setDateFrom("");
              setDateTo("");
              setStatus("all");
            }}
          >
            <Filter className="size-4" />
            Reset
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-100 dark:border-white/10">
          {filteredLeads.length ? (
            <>
              <DataTableContent
                table={table}
                data={filteredLeads}
                getRowId={(row) => row.id}
              />
              <div className="border-t border-slate-100 py-4 dark:border-white/10">
                <DataTablePagination table={table} />
              </div>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-950 dark:text-white">
                No leads match the current filters
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Try changing the date range, status, or search text.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
          {label}
        </p>
        <Icon className="size-4 text-[var(--brand-700)]" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}
