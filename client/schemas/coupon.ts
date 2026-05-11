import * as z from "zod";

export const couponSchema = z.object({
  code: z.string().min(1, "Code is required"),

  //   type: z.enum(["FIXED", "PERCENTAGE"]).optional(),

  //   value: z.number().min(0).optional(),

  //   maxDiscount: z.number().optional(),
  //   minOrderValue: z.number().optional(),

  //   scope: z.enum(["GLOBAL", "COURSE"]).optional(),

  //   applicableCourseIds: z.array(z.string()).optional(),

  //   isAutoApply: z.boolean().optional(),

  //   usageLimit: z.number().optional(),
  //   perUserLimit: z.number().optional(),

  //   validFrom: z.string().optional(),
  //   validTill: z.string().optional(),
});

export const couponDiscountSchema = z.object({
  value: z.number().min(0, "Value must be >= 0").optional(),
  maxDiscount: z.number().min(0, "Max discount must be >= 0").optional(),
  minOrderValue: z.number().min(0, "Min order must be >= 0").optional(),
});

export const couponUsageSchema = z.object({
  usageLimit: z.number().optional(),
  perUserLimit: z.number().min(1, "Per user limit must be >= 1").optional(),
});
