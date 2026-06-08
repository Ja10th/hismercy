import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .transform((value) => value || "")
  .optional();

export const checkoutCustomerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number"),
  street: z.string().trim().min(5, "Street address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  landmark: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const cartItemSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  qty: z.coerce.number().int().positive(),
  price: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().trim().optional(),
});

export const checkoutRequestSchema = z.object({
  customer: checkoutCustomerSchema,
  deliveryMethod: z.enum(["pickup", "delivery"]),
  items: z.array(cartItemSchema).min(1, "Cart is empty"),
});