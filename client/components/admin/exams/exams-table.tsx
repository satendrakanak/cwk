import { Clock, LockKeyhole, Shuffle } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Exam } from "@/types/exam";
import { ExamActions } from "./exam-actions";
import { ExamStatusBadge } from "./exam-status-badge";

export function ExamsTable({ exams }: { exams: Exam[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Exam Library</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rules</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length ? (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <Link
                      href={`/admin/exams/${exam.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {exam.title}
                    </Link>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {exam.description || "Reusable exam configured outside course content."}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ExamStatusBadge status={exam.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {exam.durationMinutes ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {exam.durationMinutes}m
                        </span>
                      ) : null}
                      {exam.randomizeQuestions ? (
                        <span className="inline-flex items-center gap-1">
                          <Shuffle className="size-3" />
                          Random
                        </span>
                      ) : null}
                      {exam.fullscreenRequired ? (
                        <span className="inline-flex items-center gap-1">
                          <LockKeyhole className="size-3" />
                          Safe mode
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">
                      {exam.courses?.length ?? 0} courses
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {exam.faculties?.length ?? 0} faculties
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {exam.attemptsCount ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <ExamActions exam={exam} compact />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                  No exams created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
