import * as z from "zod";

export const testimonialSchema = z
  .object({
    type: z.enum(["TEXT", "VIDEO"]),
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name is too long")
      .trim(),
    designation: z.string().max(120, "Designation is too long").optional(),
    company: z.string().max(120, "Company is too long").optional(),
    message: z.string().max(2000, "Testimonial is too long").optional(),
    rating: z.coerce
      .number()
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5"),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    status: z.enum(["pending", "approved", "rejected"]),
    priority: z.coerce.number().min(0, "Priority cannot be negative"),
    courseIds: z.array(z.number()).default([]),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === "TEXT" &&
      (!data.message || data.message.trim().length < 10)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message: "Text testimonial must be at least 10 characters",
      });
    }
  });
