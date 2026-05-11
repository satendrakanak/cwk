"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { Exam } from "@/types/exam";
import { formatDate } from "@/utils/formate-date";
import { ExamActions } from "./exam-actions";
import { ExamStatusBadge } from "./exam-status-badge";

export const getExamColumns = (): ColumnDef<Exam>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "title",
    header: "Exam",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/exams/${row.original.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.title}
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {row.original.description || row.original.slug}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <ExamStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "courses",
    header: "Assigned",
    cell: ({ row }) => (
      <div>
        <p>{row.original.courses?.length ?? 0} courses</p>
        <p className="text-xs text-muted-foreground">
          {row.original.faculties?.length ?? 0} faculties
        </p>
      </div>
    ),
  },
  {
    accessorKey: "questionsCount",
    header: "Rules",
    cell: ({ row }) => row.original.questionsCount ?? row.original.questionRules?.length ?? 0,
  },
  {
    accessorKey: "attemptsCount",
    header: "Attempts",
    cell: ({ row }) => row.original.attemptsCount ?? 0,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => <ExamActions exam={row.original} compact />,
  },
];
