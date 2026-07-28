import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { sendCustomOrderEmail } from "@/lib/email";

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX_REQUESTS = 3; // per IP per window

function pruneExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}

function isRateLimited(ip: string): boolean {
  pruneExpiredEntries();
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_MAX_REQUESTS) return true;
  entry.count += 1;
  return false;
}

function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "unknown";
}

// ─── Validation schema ────────────────────────────────────────────────────────
const customOrderSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(200)
    .trim(),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .trim(),
  productType: z
    .string()
    .min(2, "Please describe the product or feed type")
    .max(200, "Product description is too long")
    .trim(),
  quantity: z
    .string()
    .min(1, "Please specify quantity or volume")
    .max(100, "Quantity description is too long")
    .trim(),
  deliveryLocation: z
    .string()
    .min(3, "Please provide a delivery location")
    .max(300, "Delivery location is too long")
    .trim(),
  message: z
    .string()
    .max(1000, "Message must be under 1000 characters")
    .trim()
    .optional()
    .default(""),
});

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // Rate limit
    const headersList = await headers();
    const ip = getClientIp(headersList);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    // Validate body
    const body: unknown = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const parsed = customOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid form data.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Send email to admin
    await sendCustomOrderEmail({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      productType: data.productType,
      quantity: data.quantity,
      deliveryLocation: data.deliveryLocation,
      message: data.message,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[custom-order] failed to send email:", error);
    return NextResponse.json(
      { ok: false, error: "Could not submit your request. Please try again." },
      { status: 500 },
    );
  }
}
