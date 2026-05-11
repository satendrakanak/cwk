import * as z from "zod";

const courseDeliveryModeSchema = z.enum([
  "self_learning",
  "faculty_led",
  "hybrid",
]);

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title is too long")
    .trim(),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(255, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),

  shortDescription: z.string().optional(),
});

export const courseDescriptionSchema = z.object({
  description: z.string().optional(),
});

export const pricingSchema = z.object({
  isFree: z.boolean(),

  priceInr: z.string().optional(),
  priceUsd: z.string().optional(),
});

export const requirementsSchema = z
  .object({
    technologyRequirements: z.string().optional(),
    eligibilityRequirements: z.string().optional(),
    disclaimer: z.string().optional(),
  })
  .refine(
    (data) => {
      return (
        data.technologyRequirements?.trim() ||
        data.eligibilityRequirements?.trim() ||
        data.disclaimer?.trim()
      );
    },
    {
      message: "At least one field is required",
      path: ["technologyRequirements"],
    },
  );

export const courseDetailsSchema = z
  .object({
    duration: z.string().optional(),
    mode: z.union([courseDeliveryModeSchema, z.literal("")]).optional(),
    experienceLevel: z.string().optional(),
    language: z.string().optional(),
    certificate: z.string().optional(),
    exams: z.string().optional(),
    studyMaterial: z.string().optional(),
    additionalBook: z.string().optional(),
  })
  .refine(
    (data) =>
      data.duration?.trim() ||
      data.mode?.trim() ||
      data.experienceLevel?.trim() ||
      data.language?.trim() ||
      data.certificate?.trim() ||
      data.exams?.trim() ||
      data.studyMaterial?.trim() ||
      data.additionalBook?.trim(),
    {
      message: "At least one field is required",
      path: ["duration"],
    },
  );

export const courseFaqsSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z
          .string()
          .trim()
          .min(3, "Question must be at least 3 characters"),
        answer: z
          .string()
          .trim()
          .min(3, "Answer must be at least 3 characters"),
      }),
    )
    .default([]),
});

const courseExamOptionSchema = z.object({
  id: z.string().trim().min(1),
  text: z.string().trim().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false),
});

const courseExamQuestionSchema = z
  .object({
    id: z.string().trim().min(1),
    prompt: z.string().trim().min(3, "Question must be at least 3 characters"),
    type: z.enum([
      "single",
      "multiple",
      "true_false",
      "short_text",
      "drag_drop",
    ]),
    points: z.coerce.number().min(1, "Points must be at least 1"),
    explanation: z.string().optional(),
    acceptedAnswers: z.array(z.string().trim().min(1)).optional().default([]),
    options: z.array(courseExamOptionSchema).default([]),
  })
  .superRefine((question, ctx) => {
    const correctOptions = question.options.filter(
      (option) => option.isCorrect,
    );

    if (question.type === "single" || question.type === "true_false") {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least 2 options are required",
          path: ["options"],
        });
      }
      if (correctOptions.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select exactly one correct option",
          path: ["options"],
        });
      }
    }

    if (question.type === "multiple" && correctOptions.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one correct option",
        path: ["options"],
      });
    }

    if (question.type === "multiple" && question.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 2 options are required",
        path: ["options"],
      });
    }

    if (question.type === "drag_drop" && question.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least 2 items for drag and drop",
        path: ["options"],
      });
    }

    if (
      question.type === "short_text" &&
      (!question.acceptedAnswers?.length ||
        !question.acceptedAnswers.some((answer) => answer.trim()))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one accepted answer",
        path: ["acceptedAnswers"],
      });
    }
  });

export const courseExamSchema = z.object({
  exam: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Exam title must be at least 3 characters"),
      description: z.string().optional(),
      instructions: z.string().optional(),
      passingPercentage: z.coerce
        .number()
        .min(1, "Passing percentage must be at least 1")
        .max(100, "Passing percentage cannot exceed 100"),
      maxAttempts: z.coerce.number().min(1, "Minimum 1 attempt is required"),
      timeLimitMinutes: z.preprocess((value) => {
        if (value === "" || value === null || value === undefined) {
          return undefined;
        }

        return value;
      }, z.coerce.number().min(1).optional()),
      showResultImmediately: z.boolean().default(true),
      isPublished: z.boolean().default(false),
      questions: z
        .array(courseExamQuestionSchema)
        .min(1, "Add at least one exam question"),
    })
    .nullable(),
});

export const metaSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaSlug: z.string().max(100).optional(),
});

export const chapterSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export const lectureSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export const categoriesSchema = z.object({
  name: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title is too long")
    .trim(),

  description: z.string().optional(),
});

export const tagsSchema = z.object({
  name: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title is too long")
    .trim(),

  description: z.string().optional(),
});
