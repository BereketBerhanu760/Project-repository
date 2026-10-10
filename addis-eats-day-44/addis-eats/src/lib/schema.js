import { z } from "zod";

export const orderSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z
    .string()
    .trim()
    .regex(/^(\+251|251|0)?9\d{8}$/, "Phone number is invalid."),
  address: z.string().trim().min(10, "Address must be at least 10 characters."),
  totalETB: z.coerce.number({ invalid_type_error: "Total must be a number." }).positive("Total must be greater than zero."),
  dishId: z.string().trim().min(1, "Dish is required."),
});

export function flattenZodErrors(error) {
  const fieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (!field) continue;
    fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}
