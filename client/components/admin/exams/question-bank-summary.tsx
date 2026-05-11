import { FolderTree, ListChecks } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question, QuestionBankCategory } from "@/types/exam";

export function QuestionBankSummary({
  categories,
  questions,
}: {
  categories: QuestionBankCategory[];
  questions: Question[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="size-4" />
            Question Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.slice(0, 5).map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">{category.slug}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {category.questionsCount ?? 0} questions
              </span>
            </div>
          ))}
          {!categories.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Start by creating categories for reusable question pools.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="size-4" />
            Recent Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.slice(0, 5).map((question) => (
            <div
              key={question.id}
              className="rounded-md border border-border px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="line-clamp-1 text-sm font-medium text-foreground">
                  {question.title}
                </p>
                <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {question.type.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {question.category?.name ?? "Uncategorized"}
              </p>
            </div>
          ))}
          {!questions.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Question bank is empty.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
