import * as z from "zod";

export const userBasicSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  canRequestRefund: z.boolean().optional(),
});
