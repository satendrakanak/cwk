"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardData } from "@/types/admin-dashboard";
import { formatDateTime } from "@/utils/formate-date";

export function ExamInsightsCard({ data }: { data: AdminDashboardData }) {
  return (
    <Card className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardHeader className="border-b border-slate-100 bg-[linear-gradient(135deg,var(--brand-50),#ffffff)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(201,79,63,0.12),rgba(17,27,46,0.98))]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)] dark:text-[var(--brand-200)]">
          Exams & Certificates
        </p>
        <CardTitle className="mt-2 text-2xl text-slate-950 dark:text-white">
          Learner assessment performance
        </CardTitle>
        <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
          Keep an eye on recent final exam activity, certificate generation, and
          the courses attracting the most assessment traffic.
        </p>
      </CardHeader>

      <CardContent className="grid gap-6 p-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric
              label="Unique learners"
              value={String(data.examOverview.uniqueLearners)}
            />
            <Metric
              label="Pass rate"
              value={`${data.examOverview.passRate}%`}
            />
            <Metric
              label="Passed attempts"
              value={String(data.summary.passedExamAttempts)}
            />
            <Metric
              label="Certificates"
              value={String(data.summary.certificatesIssued)}
            />
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Top assessed courses
            </p>
            <div className="mt-4 space-y-3">
              {data.examOverview.topCourses.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Exam attempts will appear here once learners start submitting
                  assessments.
                </p>
              ) : (
                data.examOverview.topCourses.map((course, index) => (
                  <div
                    key={course.courseId}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          #{index + 1} by attempts
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                          {course.courseTitle}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--brand-700)]">
                        {course.attempts} attempts
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {course.passCount} passed • {course.averageScore}% average
                      score
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/6">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Recent attempts
            </p>
            <h4 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
              Latest final exam submissions
            </h4>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {data.examOverview.recentAttempts.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-500 dark:text-slate-400">
                No exam submissions yet.
              </div>
            ) : (
              data.examOverview.recentAttempts.map((attempt) => (
                <div
                  key={`${attempt.source ?? "exam"}-${attempt.id}`}
                  className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {attempt.learnerName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {attempt.courseTitle}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {attempt.submittedAt
                        ? formatDateTime(attempt.submittedAt)
                        : "Submission pending"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">
                        {attempt.score}/{attempt.maxScore}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {attempt.percentage}%
                      </p>
                    </div>
                    <span
                      className={`inline-flex min-w-21.5 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                        attempt.passed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {attempt.passed ? "Passed" : "Needs retry"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}
