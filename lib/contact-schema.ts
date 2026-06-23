// lib/contact-schema.ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Please enter your full name.")
    .max(80, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short.")
    .max(30, "Phone number is too long.")
    .or(z.literal(""))
    .optional(),
  subject: z
    .string()
    .trim()
    .min(3, "Please choose a subject.")
    .max(120, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters.")
    .max(2000, "Message is too long."),
});

export type ContactFormData = z.infer<typeof contactSchema>;