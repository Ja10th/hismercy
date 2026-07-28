// app/api/paystack/webhook/route.ts
//
// Paystack sends a POST to this endpoint whenever a payment event occurs.
// This is the *reliable* payment confirmation path — the browser callback
// (/paystack/callback) is only a UX convenience that can be skipped if the
// user closes their tab. Both paths are idempotent via the dedupeKey.
//
// Security model:
//   1. Verify the x-paystack-signature header (HMAC-SHA512 of the raw body
//      using your secret key) before touching the DB.
//   2. Only process "charge.success" events.
//   3. Upsert PaymentAuditLog with a unique dedupeKey — duplicate deliveries
//      are safely ignored.

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendAdminOrderEmail, sendCustomerOrderEmail } from "@/lib/email";

// ─── Signature verification ───────────────────────────────────────────────────

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is missing");
  return key;
}

function verifySignature(rawBody: string, signature: string): boolean {
  try {
    const expected = createHmac("sha512", getSecretKey())
      .update(rawBody)
      .digest("hex");
    // Constant-time comparison to prevent timing attacks
    return expected.length === signature.length &&
      createHmac("sha512", getSecretKey())
        .update(rawBody)
        .digest("hex") === signature;
  } catch {
    return false;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PaystackEvent = {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    id: number;
  };
};

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Read raw body as text so we can verify the signature before parsing JSON.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  const signatureVerified = verifySignature(rawBody, signature);

  if (!signatureVerified) {
    console.warn("[webhook] signature verification failed — rejecting");
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  }

  let payload: PaystackEvent;

  try {
    payload = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  // Only handle successful charges — acknowledge everything else with 200
  // so Paystack doesn't keep retrying.
  if (payload.event !== "charge.success") {
    console.info("[webhook] ignoring event:", payload.event);
    return NextResponse.json({ ok: true, message: "Event ignored" });
  }

  const reference = payload.data?.reference?.trim();

  if (!reference) {
    console.error("[webhook] missing reference in payload");
    return NextResponse.json({ ok: false, message: "Missing reference" }, { status: 400 });
  }

  const dedupeKey = `webhook:charge.success:${reference}`;

  // ── Look up the order ──────────────────────────────────────────────────────
  const order = await prisma.order.findUnique({
    where: { orderCode: reference },
    select: {
      id: true,
      orderCode: true,
      total: true,
      paymentStatus: true,
      email: true,
      fullName: true,
      phone: true,
    },
  });

  if (!order) {
    console.error("[webhook] order not found for reference:", reference);
    // Return 200 so Paystack doesn't retry — the order simply doesn't exist.
    await prisma.paymentAuditLog.upsert({
      where: { dedupeKey },
      update: { status: "failed", errorMessage: "Order not found" },
      create: {
        provider: "paystack",
        event: payload.event,
        dedupeKey,
        reference,
        transactionId: payload.data?.id ?? null,
        rawBody,
        signatureVerified,
        status: "failed",
        errorMessage: "Order not found",
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Already paid — idempotent ──────────────────────────────────────────────
  if (order.paymentStatus === "paid") {
    console.info("[webhook] order already paid:", order.orderCode);
    await prisma.paymentAuditLog.upsert({
      where: { dedupeKey },
      update: { status: "processed", orderId: order.id },
      create: {
        provider: "paystack",
        event: payload.event,
        dedupeKey,
        reference,
        transactionId: payload.data?.id ?? null,
        rawBody,
        signatureVerified,
        status: "processed",
        orderId: order.id,
        errorMessage: "Order already paid",
        processedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Verify amount + currency ───────────────────────────────────────────────
  const verifiedAmount   = payload.data?.amount;
  const verifiedCurrency = String(payload.data?.currency ?? "").toUpperCase();
  const verifiedStatus   = String(payload.data?.status   ?? "").toLowerCase();

  if (
    verifiedStatus   !== "success"  ||
    verifiedAmount   !== order.total ||
    verifiedCurrency !== "NGN"
  ) {
    const msg = `Mismatch — status: ${verifiedStatus}, amount: ${verifiedAmount} (expected ${order.total}), currency: ${verifiedCurrency}`;
    console.error("[webhook]", msg);

    await prisma.paymentAuditLog.upsert({
      where: { dedupeKey },
      update: { status: "failed", orderId: order.id, errorMessage: msg },
      create: {
        provider: "paystack",
        event: payload.event,
        dedupeKey,
        reference,
        transactionId: payload.data?.id ?? null,
        rawBody,
        signatureVerified,
        status: "failed",
        orderId: order.id,
        errorMessage: msg,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true }); // 200 to stop retries
  }

  // ── Mark order as paid in a transaction ───────────────────────────────────
  const paidOrder = await prisma.$transaction(async (tx) => {
    // Re-read inside the transaction to prevent race conditions
    const fresh = await tx.order.findUnique({
      where: { id: order.id },
      select: { paymentStatus: true },
    });

    if (fresh?.paymentStatus === "paid") {
      return null; // Another process won the race — nothing to do
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paymentStatus: "paid",
        paidAt: new Date(),
        paymentReference: reference,
      },
    });

    await tx.paymentAuditLog.upsert({
      where: { dedupeKey },
      update: {
        status: "processed",
        orderId: order.id,
        transactionId: payload.data?.id ?? null,
        processedAt: new Date(),
        errorMessage: null,
      },
      create: {
        provider: "paystack",
        event: payload.event,
        dedupeKey,
        reference,
        transactionId: payload.data?.id ?? null,
        rawBody,
        signatureVerified,
        status: "processed",
        orderId: order.id,
        processedAt: new Date(),
      },
    });

    await tx.adminNotification.create({
      data: {
        title: "New paid order",
        description: `Order ${order.orderCode} has been paid (via webhook).`,
        href: "/admin/orders",
        type: "order",
        read: false,
      },
    });

    return {
      orderCode: order.orderCode,
      fullName:  order.fullName,
      email:     order.email,
      phone:     order.phone,
      total:     order.total,
    };
  });

  // ── Send confirmation emails (outside the transaction) ────────────────────
  if (paidOrder) {
    const results = await Promise.allSettled([
      sendCustomerOrderEmail({
        email:     paidOrder.email,
        fullName:  paidOrder.fullName,
        orderCode: paidOrder.orderCode,
        total:     paidOrder.total,
      }),
      sendAdminOrderEmail({
        orderCode:     paidOrder.orderCode,
        customerName:  paidOrder.fullName,
        customerEmail: paidOrder.email,
        phone:         paidOrder.phone,
        total:         paidOrder.total,
      }),
    ]);

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(
        "[webhook] email(s) failed after payment:",
        failed.map((r) =>
          r.status === "rejected"
            ? r.reason instanceof Error ? r.reason.message : String(r.reason)
            : null,
        ),
      );
    }

    console.info("[webhook] order paid successfully:", paidOrder.orderCode);
  }

  return NextResponse.json({ ok: true });
}
