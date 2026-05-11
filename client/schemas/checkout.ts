import * as z from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number"),
  country: z.string().trim().min(1, "Country is required"),
  state: z.string().trim().min(1, "State is required"),
  city: z.string().trim().min(1, "City is required"),
  address: z.string().trim().min(5, "Address is required"),
  pincode: z.string().trim().min(4, "Enter a valid pincode"),
});
