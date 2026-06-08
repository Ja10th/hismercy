import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  sendAdminOrderEmail,
  sendCustomerOrderEmail,
} from "@/lib/email";

type PaidOrderEmailPayload = {
  orderCode: string;
  fullName: string;
  email: string;
  phone: string;
  total: number;
};

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "Paystack secret key is missing" },
        { status: 500 },
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    if (!rawBody || !signature) {
      return NextResponse.json(
        { ok: false, error: "Missing webhook payload" },
        { status: 400 },
      );
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    if (!safeEqual(hash, signature)) {
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    let event: {
      event?: string;
      data?: {
        id?: number;
        reference?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const eventName = String(event.event || "unknown");
    const reference =
      typeof event.data?.reference === "string"
        ? event.data.reference.trim()
        : "";
    const transactionId =
      typeof event.data?.id === "number" ? event.data.id : null;
    const amount = Number(event.data?.amount || 0);
    const currency = String(event.data?.currency || "").toUpperCase();

    const dedupeKey = `${eventName}:${reference || "no-ref"}:${transactionId ?? "no-id"}`;

    const paidOrderForEmail = await prisma.$transaction<
      PaidOrderEmailPayload | null
    >(async (tx) => {
      const existing = await tx.paymentAuditLog.findUnique({
        where: { dedupeKey },
        select: { id: true, status: true },
      });

      if (existing?.status === "processed") {
        return null;
      }

      if (!existing) {
        await tx.paymentAuditLog.create({
          data: {
            provider: "paystack",
            event: eventName,
            dedupeKey,
            reference: reference || null,
            transactionId,
            rawBody,
            signatureVerified: true,
            status: "received",
          },
        });
      }

      if (eventName !== "charge.success" || !reference) {
        await tx.paymentAuditLog.update({
          where: { dedupeKey },
          data: {
            status: "ignored",
            errorMessage:
              eventName !== "charge.success"
                ? `Ignored event: ${eventName}`
                : "Missing reference",
            processedAt: new Date(),
          },
        });
        return null;
      }

      const order = await tx.order.findUnique({
        where: { orderCode: reference },
        select: {
          id: true,
          orderCode: true,
          total: true,
          paymentStatus: true,
          fullName: true,
          email: true,
          phone: true,
        },
      });

      if (!order) {
        await tx.paymentAuditLog.update({
          where: { dedupeKey },
          data: {
            status: "failed",
            errorMessage: "Order not found",
            processedAt: new Date(),
          },
        });
        return null;
      }

      if (order.paymentStatus === "paid") {
        await tx.paymentAuditLog.update({
          where: { dedupeKey },
          data: {
            status: "processed",
            orderId: order.id,
            processedAt: new Date(),
            errorMessage: "Order was already marked as paid.",
          },
        });
        return null;
      }

      if (
        !Number.isFinite(amount) ||
        amount !== order.total ||
        (currency && currency !== "NGN")
      ) {
        await tx.paymentAuditLog.update({
          where: { dedupeKey },
          data: {
            status: "failed",
            errorMessage: "Amount or currency mismatch",
            processedAt: new Date(),
          },
        });
        return null;
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

      await tx.paymentAuditLog.update({
        where: { dedupeKey },
        data: {
          status: "processed",
          orderId: order.id,
          processedAt: new Date(),
          errorMessage: null,
        },
      });

      await tx.adminNotification.create({
        data: {
          title: "New paid order",
          description: `Order ${order.orderCode} has been paid successfully.`,
          href: "/admin/orders",
          type: "order",
          read: false,
        },
      });

      return {
        orderCode: order.orderCode,
        fullName: order.fullName,
        email: order.email,
        phone: order.phone,
        total: order.total,
      };
    });

    if (paidOrderForEmail) {
      await Promise.allSettled([
        sendCustomerOrderEmail({
          email: paidOrderForEmail.email,
          fullName: paidOrderForEmail.fullName,
          orderCode: paidOrderForEmail.orderCode,
          total: paidOrderForEmail.total,
        }),
        sendAdminOrderEmail({
          orderCode: paidOrderForEmail.orderCode,
          customerName: paidOrderForEmail.fullName,
          customerEmail: paidOrderForEmail.email,
          phone: paidOrderForEmail.phone,
          total: paidOrderForEmail.total,
        }),
      ]);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("PAYSTACK WEBHOOK ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Webhook failed" },
      { status: 500 },
    );
  }
}