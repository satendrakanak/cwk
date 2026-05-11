"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BookOpenCheck,
  ClipboardList,
  Plus,
  Search,
  Settings2,
  Shuffle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import {
  Exam,
  Question,
  QuestionBankCategory,
  QuestionType,
  UpsertExamQuestionRulePayload,
} from "@/types/exam";
import { questionTypeLabels } from "./question-columns";

type RuleDraft = UpsertExamQuestionRulePayload & {
  localId: string;
};

type ExamQuestionRulesEditorProps = {
  exam: Exam;
  questions: Question[];
  categories: QuestionBankCategory[];
  questionBankHref?: string;
};

export function ExamQuestionRulesEditor({
  exam,
  questions,
  categories,
  questionBankHref = "/admin/exams/questions",
}: ExamQuestionRulesEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | QuestionType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [poolCategoryId, setPoolCategoryId] = useState(
    categories[0]?.id ? String(categories[0].id) : "",
  );
  const [poolCount, setPoolCount] = useState(5);
  const [rules, setRules] = useState<RuleDraft[]>(
    (exam.questionRules ?? []).map((rule, index) => ({
      localId: `${rule.id}-${index}`,
      id: rule.id,
      ruleType: rule.ruleType,
      questionId: rule.question?.id,
      categoryId: rule.category?.id,
      order: rule.order,
      randomQuestionCount: rule.randomQuestionCount ?? undefined,
      pointsOverride: rule.pointsOverride
        ? Number(rule.pointsOverride)
        : undefined,
      negativeMarksOverride: rule.negativeMarksOverride
        ? Number(rule.negativeMarksOverride)
        : undefined,
      weight: Number(rule.weight),
      isRequired: rule.isRequired,
    })),
  );

  const questionById = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const selectedQuestionIds = useMemo(
    () =>
      new Set(
        rules
          .filter((rule) => rule.ruleType === "fixed_question")
          .map((rule) => rule.questionId)
          .filter(Boolean),
      ),
    [rules],
  );

  const filteredQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        !needle ||
        question.title.toLowerCase().includes(needle) ||
        question.prompt.toLowerCase().includes(needle);
      const matchesType = typeFilter === "all" || question.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" ||
        String(question.category?.id ?? "") === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [categoryFilter, questions, search, typeFilter]);
  const fixedRulesCount = rules.filter(
    (rule) => rule.ruleType === "fixed_question",
  ).length;
  const randomRulesCount = rules.length - fixedRulesCount;
  const estimatedQuestions = rules.reduce((sum, rule) => {
    return (
      sum +
      (rule.ruleType === "random_from_category"
        ? Number(rule.randomQuestionCount ?? 1)
        : 1)
    );
  }, 0);

  const addFixedQuestion = (question: Question) => {
    if (selectedQuestionIds.has(question.id)) {
      toast.info("Question is already added to this exam");
      return;
    }

    setRules((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        ruleType: "fixed_question",
        order: current.length,
        questionId: question.id,
        pointsOverride: Number(question.defaultPoints || 0),
        negativeMarksOverride: Number(question.defaultNegativeMarks || 0),
        weight: 1,
        isRequired: true,
      },
    ]);
  };

  const addRandomPool = () => {
    if (!poolCategoryId) {
      toast.error("Select a category for the random pool");
      return;
    }

    setRules((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        ruleType: "random_from_category",
        order: current.length,
        categoryId: Number(poolCategoryId),
        randomQuestionCount: poolCount,
        weight: 1,
        isRequired: true,
      },
    ]);
  };

  const updateRule = (
    localId: string,
    patch: Partial<UpsertExamQuestionRulePayload>,
  ) => {
    setRules((current) =>
      current.map((rule) =>
        rule.localId === localId ? { ...rule, ...patch } : rule,
      ),
    );
  };

  const removeRule = (localId: string) => {
    setRules((current) =>
      normalizeOrder(current.filter((rule) => rule.localId !== localId)),
    );
  };

  const moveRule = (index: number, direction: -1 | 1) => {
    setRules((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return normalizeOrder(next);
    });
  };

  const handleSave = async () => {
    const payloadRules = rules.map((rule, index) => ({
      id: rule.id,
      ruleType: rule.ruleType,
      questionId:
        rule.ruleType === "fixed_question" ? rule.questionId : undefined,
      categoryId:
        rule.ruleType === "random_from_category" ? rule.categoryId : undefined,
      order: index,
      randomQuestionCount:
        rule.ruleType === "random_from_category"
          ? rule.randomQuestionCount
          : undefined,
      pointsOverride: rule.pointsOverride,
      negativeMarksOverride: rule.negativeMarksOverride,
      weight: rule.weight ?? 1,
      isRequired: rule.isRequired ?? true,
    }));

    if (!payloadRules.length) {
      toast.error("Add at least one question rule");
      return;
    }

    try {
      setIsSaving(true);
      await examClientService.replaceQuestionRules(exam.id, {
        rules: payloadRules,
      });
      toast.success("Question rules updated");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="sticky top-18 z-20 overflow-hidden rounded-lg border border-border bg-card/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/85">
        <div className="grid gap-0 lg:grid-cols-3">
          <BuilderStat
            icon={BookOpenCheck}
            label="Fixed questions"
            value={fixedRulesCount}
            tone="primary"
          />
          <BuilderStat
            icon={Shuffle}
            label="Random pools"
            value={randomRulesCount}
            tone="muted"
          />
          <BuilderStat
            icon={ClipboardList}
            label="Total questions"
            value={estimatedQuestions}
            tone="accent"
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(31rem,37rem)]">
        <div className="space-y-5">
          <Card className="overflow-hidden rounded-lg border-border">
            <CardHeader className="border-b border-border bg-muted/35">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shuffle className="size-4 text-primary" />
                    Random Pool Composer
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Category se dynamic question blocks add karo. Har learner ko
                    resolved questions attempt start par milenge.
                  </p>
                </div>
                <Badge variant="secondary">{randomRulesCount} added</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_9rem_auto] lg:items-end">
              <div className="space-y-2">
                <Label>Category</Label>
                <NativeSelect
                  className="w-full"
                  value={poolCategoryId}
                  onChange={(event) => setPoolCategoryId(event.target.value)}
                >
                  {categories.map((category) => (
                    <NativeSelectOption key={category.id} value={category.id}>
                      {formatCategoryName(category)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <NumberInput
                label="Count"
                value={poolCount}
                min={1}
                onChange={setPoolCount}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addRandomPool}
                className="justify-center"
              >
                <Plus className="size-4" />
                Add Pool
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border-border">
            <CardHeader className="border-b border-border bg-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="size-4 text-primary" />
                    Question Library
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fixed questions search karke right-side blueprint me add
                    karo.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {filteredQuestions.length} visible
                  </Badge>
                  <Button asChild type="button" variant="secondary" size="sm">
                    <Link href={questionBankHref}>
                      <Plus className="size-4" />
                      Manage Questions
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_13rem]">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title or prompt"
                    className="pl-9"
                  />
                </div>
                <NativeSelect
                  className="w-full"
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as "all" | QuestionType)
                  }
                >
                  <NativeSelectOption value="all">All types</NativeSelectOption>
                  {Object.entries(questionTypeLabels).map(([value, label]) => (
                    <NativeSelectOption key={value} value={value}>
                      {label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <NativeSelect
                  className="w-full"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <NativeSelectOption value="all">
                    All categories
                  </NativeSelectOption>
                  {categories.map((category) => (
                    <NativeSelectOption key={category.id} value={category.id}>
                      {formatCategoryName(category)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="max-h-176 space-y-3 overflow-y-auto pr-1">
                {filteredQuestions.length ? (
                  filteredQuestions.map((question) => {
                    const isSelected = selectedQuestionIds.has(question.id);

                    return (
                      <div
                        key={question.id}
                        className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/25 hover:bg-muted/35"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                {questionTypeLabels[question.type]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {question.category?.name ?? "Uncategorized"}
                              </span>
                            </div>
                            <h4 className="mt-2 line-clamp-1 font-medium text-foreground">
                              {question.title}
                            </h4>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                              {question.prompt}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>
                                {Number(question.defaultPoints || 0)} marks
                              </span>
                              <span>
                                -{Number(question.defaultNegativeMarks || 0)}{" "}
                                negative
                              </span>
                              {question.allowPartialMarking ? (
                                <span>Partial marking</span>
                              ) : null}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant={isSelected ? "secondary" : "outline"}
                            onClick={() => addFixedQuestion(question)}
                            disabled={isSelected}
                          >
                            <Plus className="size-4" />
                            {isSelected ? "Added" : "Add"}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No questions match the current filters.
                    </p>
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Link href={questionBankHref}>
                        <Plus className="size-4" />
                        Add Matching Question
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-lg border-border xl:sticky xl:top-28 xl:self-start">
          <CardHeader className="gap-3 border-b border-border bg-muted/35 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="size-4 text-primary" />
                Exam Builder
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Final paper yahin banta hai. Order, marks, negative marking aur
                required rules set karo.
              </p>
            </div>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Rules"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 bg-background p-4">
            {rules.length ? (
              rules.map((rule, index) => (
                <RuleCard
                  key={rule.localId}
                  rule={rule}
                  index={index}
                  total={rules.length}
                  question={
                    rule.questionId
                      ? questionById.get(rule.questionId)
                      : undefined
                  }
                  category={
                    rule.categoryId
                      ? categoryById.get(rule.categoryId)
                      : undefined
                  }
                  onMove={moveRule}
                  onRemove={removeRule}
                  onUpdate={updateRule}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <ClipboardList className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Blueprint empty hai
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Left side se fixed questions add karo ya random pool compose
                  karo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BuilderStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof BookOpenCheck;
  label: string;
  value: number;
  tone: "primary" | "muted" | "accent";
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border p-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <span
        className={
          tone === "primary"
            ? "flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary"
            : tone === "accent"
              ? "flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground"
              : "flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        }
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function RuleCard({
  rule,
  index,
  total,
  question,
  category,
  onMove,
  onRemove,
  onUpdate,
}: {
  rule: RuleDraft;
  index: number;
  total: number;
  question?: Question;
  category?: QuestionBankCategory;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (localId: string) => void;
  onUpdate: (
    localId: string,
    patch: Partial<UpsertExamQuestionRulePayload>,
  ) => void;
}) {
  const isFixed = rule.ruleType === "fixed_question";

  return (
    <div
      className={
        isFixed
          ? "overflow-hidden rounded-lg border border-primary/20 bg-card"
          : "overflow-hidden rounded-lg border border-border bg-card"
      }
    >
      <div
        className={isFixed ? "h-1 bg-primary" : "h-1 bg-muted-foreground/30"}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isFixed ? "default" : "secondary"}>
                {isFixed ? "Fixed" : "Random Pool"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Order {index + 1}
              </span>
            </div>
            <h4 className="mt-2 line-clamp-1 font-medium text-foreground">
              {isFixed
                ? question?.title || "Question not found"
                : category?.name || "Category not found"}
            </h4>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {isFixed
                ? question?.prompt || "This question may have been deleted."
                : `${rule.randomQuestionCount ?? 1} random questions from this category`}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={index === total - 1}
              onClick={() => onMove(index, 1)}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onRemove(rule.localId)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {!isFixed ? (
            <NumberInput
              label="Random Count"
              value={rule.randomQuestionCount ?? 1}
              min={1}
              onChange={(value) =>
                onUpdate(rule.localId, { randomQuestionCount: value })
              }
            />
          ) : null}
          <NumberInput
            label="Points"
            value={rule.pointsOverride ?? 0}
            min={0}
            step={0.5}
            onChange={(value) =>
              onUpdate(rule.localId, { pointsOverride: value || undefined })
            }
          />
          <NumberInput
            label="Negative"
            value={rule.negativeMarksOverride ?? 0}
            min={0}
            step={0.5}
            onChange={(value) =>
              onUpdate(rule.localId, {
                negativeMarksOverride: value || undefined,
              })
            }
          />
          <NumberInput
            label="Weight"
            value={rule.weight ?? 1}
            min={0}
            step={0.5}
            onChange={(value) => onUpdate(rule.localId, { weight: value })}
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <Checkbox
            checked={rule.isRequired ?? true}
            onCheckedChange={(checked) =>
              onUpdate(rule.localId, { isRequired: Boolean(checked) })
            }
          />
          Required
        </label>
      </div>
    </div>
  );
}

function normalizeOrder(rules: RuleDraft[]) {
  return rules.map((rule, index) => ({ ...rule, order: index }));
}

function formatCategoryName(category: QuestionBankCategory) {
  return category.parent
    ? `${category.parent.name} / ${category.name}`
    : category.name;
}

function NumberInput({
  label,
  value,
  min,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
