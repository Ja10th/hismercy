import { prisma } from "@/lib/prisma";
import { getAppUrl, initializePaystackTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { checkoutRequestSchema } from "@/app/checkout/schema";
import { getDeliveryZone } from "@/app/checkout/delivery";
import { getAppSettings } from "@/lib/settings";

// ─── Rate limiting ────────────────────────────────────────────────────────────
// In-memory store is fine for a single-instance server.
// For serverless / multi-instance deployments swap this out for
// Upstash Redis + @upstash/ratelimit (one-line change).
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX_REQUESTS = 5;   // per IP per window

// Cleans up expired entries to prevent unbounded memory growth.
// Runs opportunistically on every request — cheap because the map is small.
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
  // x-forwarded-for can be a comma-separated list; take the first (original client).
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "unknown";
}

// ─── Types ────────────────────────────────────────────────────────────────────
type IncomingItem = {
  id: string;
  qty: number;
};

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // ── Rate limit check ────────────────────────────────────────────────────
    const headersList = await headers();
    const ip = getClientIp(headersList);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    // ── Schema validation ───────────────────────────────────────────────────
    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid checkout data",
        },
        { status: 400 },
      );
    }

    const { customer, deliveryMethod, items } = parsed.data;

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: "Cart is empty" },
        { status: 400 },
      );
    }

    const normalizedCustomer = {
      fullName: customer.fullName.trim(),
      email: customer.email.toLowerCase().trim(),
      phone: customer.phone.trim(),
      street: customer.street.trim(),
      city: customer.city.trim(),
      state: customer.state.trim(),
      landmark: customer.landmark?.trim() || null,
      notes: customer.notes?.trim() || null,
    };

    // ── Load delivery config from DB (source of truth) ──────────────────────
    // The admin settings panel lets the owner update fees, minimums, and
    // origin city/state at runtime. We must use those values here — not the
    // hardcoded constants in delivery.ts — so a rate change takes effect
    // immediately without a redeployment.
    const appSettings = await getAppSettings();
    const deliveryConfig = appSettings.delivery;
    const { originState, originCity, zones } = deliveryConfig;

    // ── Product lookup ──────────────────────────────────────────────────────
    const requestedItems = items.map((item: IncomingItem) => ({
      id: item.id,
      qty: Number(item.qty),
    }));

    const productIds = requestedItems.map((item) => item.id);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        inStock: true,
        stockCount: true,
        images: {
          select: { url: true },
          take: 1,
        },
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        {
          ok: false,
          error: `Some products are no longer available: ${missing.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const bagCount = requestedItems.reduce((sum, item) => sum + item.qty, 0);

    // ── Delivery zone using DB origin (not hardcoded ORIGIN_STATE/CITY) ─────
    const zone = getDeliveryZone(
      normalizedCustomer.state,
      normalizedCustomer.city,
      originState,   // dynamic — from DB settings
      originCity,    // dynamic — from DB settings
    );

    const zoneRates = zones[zone];

    // ── Minimum bag enforcement (DB value, not hardcoded) ───────────────────
    if (deliveryMethod === "delivery" && bagCount < zoneRates.minBags) {
      return NextResponse.json(
        {
          ok: false,
          error: `Minimum order for this delivery zone is ${zoneRates.minBags} bags. You have ${bagCount}.`,
        },
        { status: 400 },
      );
    }

    // ── Price calculation ───────────────────────────────────────────────────
    // Prices always come from the database — never from the client payload.
    const subtotal = requestedItems.reduce((sum, item) => {
      const product = productMap.get(item.id);
      if (!product) return sum;
      return sum + product.price * item.qty;
    }, 0);

    // Fee per bag also comes from DB settings, not delivery.ts constants.
    const deliveryFee =
      deliveryMethod === "pickup" ? 0 : zoneRates.feePerBag * bagCount;

    const total = subtotal + deliveryFee;
    const orderCode = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;

    // ── Persist customer + order ────────────────────────────────────────────
    const savedCustomer = await prisma.customer.upsert({
      where: { email: normalizedCustomer.email },
      update: {
        fullName: normalizedCustomer.fullName,
        phone: normalizedCustomer.phone,
        street: normalizedCustomer.street,
        city: normalizedCustomer.city,
        state: normalizedCustomer.state,
        landmark: normalizedCustomer.landmark,
      },
      create: {
        fullName: normalizedCustomer.fullName,
        email: normalizedCustomer.email,
        phone: normalizedCustomer.phone,
        street: normalizedCustomer.street,
        city: normalizedCustomer.city,
        state: normalizedCustomer.state,
        landmark: normalizedCustomer.landmark,
      },
    });

    const order = await prisma.order.create({
      data: {
        orderCode,
        customerId: savedCustomer.id,
        fullName: normalizedCustomer.fullName,
        email: normalizedCustomer.email,
        phone: normalizedCustomer.phone,
        street: normalizedCustomer.street,
        city: normalizedCustomer.city,
        state: normalizedCustomer.state,
        landmark: normalizedCustomer.landmark,
        notes: normalizedCustomer.notes,
        deliveryMethod,
        subtotal,
        deliveryFee,
        total,
        status: "pending",
        paymentStatus: "pending",
        paymentReference: orderCode,
        items: {
          create: requestedItems.map((item) => {
            const product = productMap.get(item.id)!;
            return {
              productId: product.id,
              name: product.name,
              price: product.price,
              qty: item.qty,
              // Image always from DB — client-sent imageUrl is ignored entirely
              image: product.images[0]?.url ?? "/bags.png",
            };
          }),
        },
      },
      include: { items: true },
    });

    console.log("[checkout] app url", getAppUrl());
console.log("[checkout] callback url", `${getAppUrl()}/paystack/callback`);
console.log("[checkout] order code", order.orderCode);
    // ── Initialize Paystack transaction ─────────────────────────────────────
    const init = await initializePaystackTransaction({
      email: order.email,
      amount: order.total,
      reference: order.orderCode,
      callbackUrl: `${getAppUrl()}/paystack/callback`,
      metadata: {
        orderCode: order.orderCode,
        fullName: order.fullName,
        phone: order.phone,
        deliveryMethod,
      },
    });

    console.log("[checkout] paystack init response", {
  authorizationUrl: init.authorization_url,
  reference: init.reference,
});

    return NextResponse.json({
      ok: true,
      authorizationUrl: init.authorization_url,
      reference: init.reference,
      orderCode: order.orderCode,
    });
  } catch (error) {
    console.error("PAYSTACK INIT ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Could not initialize payment" },
      { status: 500 },
    );
  }
  
}

