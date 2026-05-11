import * as z from "zod";

export const articleSchema = z.object({
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
  excerpt: z.string().optional(),
});

export const articleContentSchema = z.object({
  content: z.string().optional(),
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
    mode: z.string().optional(),
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
