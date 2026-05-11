import * as z from "zod";
export const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .min(3, "Min 3 characters")
      .max(96, "First name too long"),
    lastName: z
      .string()
      .min(3, "Min 3 characters")
      .max(96, "Last name too long"),
    username: z.string().max(255, "Username too long").optional(),
    email: z.string().email("Invalid email"),
    phoneNumber: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone too long"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(8, "Minimum 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const fogotPasswordFormSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(8, "Minimum 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
