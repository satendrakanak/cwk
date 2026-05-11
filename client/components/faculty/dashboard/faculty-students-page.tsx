"use client";

import { useMemo, useState } from "react";
import { Mail, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FacultyCourseBatch } from "@/types/faculty-workspace";
import { formatDate } from "@/utils/formate-date";

type FacultyStudentsPageProps = {
  batches: FacultyCourseBatch[];
};

export function FacultyStudentsPage({ batches }: FacultyStudentsPageProps) {
  const [search, setSearch] = useState("");
  const [batchId, setBatchId] = useState("all");
  const students = useMemo(
    () =>
      batches.flatMap((batch) =>
        batch.students.map((student) => ({ ...student, batch })),
      ),
    [batches],
  );
  const activeStudents = students.filter((student) => student.status === "active");
  const filteredStudents = students.filter((student) => {
    const needle = search.trim().toLowerCase();
    const fullName =
      `${student.student.firstName} ${student.student.lastName ?? ""}`.toLowerCase();
    const matchesSearch =
      !needle ||
      fullName.includes(needle) ||
      student.student.email.toLowerCase().includes(needle) ||
      student.batch.name.toLowerCase().includes(needle) ||
      student.batch.course.title.toLowerCase().includes(needle);
    const matchesBatch = batchId === "all" || String(student.batch.id) === batchId;

    return matchesSearch && matchesBatch;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Students
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Batch learners
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track learners connected to your faculty-led batches and courses.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total students" value={students.length} icon={Users} />
        <StatCard label="Active students" value={activeStudents.length} icon={Users} />
        <StatCard label="Batches" value={batches.length} icon={Users} />
      </section>

      <section className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Student directory</h2>
            <p className="text-sm text-muted-foreground">
              {filteredStudents.length} learners in the current view.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,18rem)_14rem]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search learner, email, course"
                className="h-9 pl-9"
              />
            </div>
            <NativeSelect
              className="h-9 w-full"
              value={batchId}
              onChange={(event) => setBatchId(event.target.value)}
            >
              <NativeSelectOption value="all">All batches</NativeSelectOption>
              {batches.map((batch) => (
                <NativeSelectOption key={batch.id} value={batch.id}>
                  {batch.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <TableRow key={`${student.batch.id}-${student.student.id}`}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {student.student.firstName} {student.student.lastName ?? ""}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="size-3" />
                        {student.student.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.batch.course.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.batch.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "outline"}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(student.joinedAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                    No learners found for the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <Icon className="mb-4 size-6 text-primary" />
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
