import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import {
  sendAdminOrderEmail,
  sendCustomerOrderEmail,
} from "@/lib/email";
import { redirect } from "next/navigation";

type CallbackProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

function callbackDedupeKey(reference: string) {
  return `callback:verify:${reference}`;
}

type VerifiedTransaction = {
  id?: number;
  amount?: number | string;
  currency?: string;
  status?: string;
  data?: {
    id?: number;
    amount?: number | string;
    currency?: string;
    status?: string;
  };
};

async function writeAuditLog(params: {
  dedupeKey: string;
  provider?: string;
  event?: string;
  reference: string;
  transactionId: number | null;
  rawBody: unknown;
  signatureVerified: boolean;
  status: "received" | "processed" | "failed" | "ignored";
  orderId?: string;
  errorMessage?: string | null;
}) {
  return prisma.paymentAuditLog.upsert({
    where: { dedupeKey: params.dedupeKey },
    update: {
      status: params.status,
      orderId: params.orderId,
      transactionId: params.transactionId,
      processedAt: params.status === "received" ? undefined : new Date(),
      errorMessage: params.errorMessage ?? null,
    },
    create: {
      provider: params.provider ?? "paystack",
      event: params.event ?? "callback.verify",
      dedupeKey: params.dedupeKey,
      reference: params.reference,
      transactionId: params.transactionId,
      rawBody: JSON.stringify(params.rawBody),
      signatureVerified: params.signatureVerified,
      status: params.status,
      orderId: params.orderId,
      errorMessage: params.errorMessage ?? null,
      processedAt:
        params.status === "received" ? undefined : new Date(),
    },
  });
}

export default async function PaystackCallbackPage({ searchParams }: CallbackProps) {
  const { reference } = await searchParams;

  console.info("[paystack-callback] entered", { reference });

  if (!reference || typeof reference !== "string") {
    console.warn("[paystack-callback] missing reference");
    redirect("/payment-failed");
  }

  const cleanReference = reference.trim();
  const dedupeKey = callbackDedupeKey(cleanReference);

  console.info("[paystack-callback] checking order", { cleanReference, dedupeKey });

  const order = await prisma.order.findUnique({
    where: { orderCode: cleanReference },
    select: {
      id: true,
      orderCode: true,
      total: true,
      paymentStatus: true,
      status: true,
      email: true,
      fullName: true,
      phone: true,
    },
  });

  console.info("[paystack-callback] order lookup result", {
    found: !!order,
    orderId: order?.id,
    paymentStatus: order?.paymentStatus,
    total: order?.total,
  });

  if (!order) {
    console.error("[paystack-callback] order not found", { cleanReference });
    redirect("/payment-failed");
  }

  if (order.paymentStatus === "paid") {
    console.info("[paystack-callback] order already paid", {
      orderId: order.id,
      orderCode: order.orderCode,
    });

    await writeAuditLog({
      dedupeKey,
      reference: cleanReference,
      transactionId: null,
      rawBody: { reference: cleanReference, alreadyPaid: true },
      signatureVerified: false,
      status: "processed",
      orderId: order.id,
      errorMessage: "Callback arrived after payment was already marked paid.",
    });

    redirect(`/order-success/${order.orderCode}`);
  }

  let verified: VerifiedTransaction | null = null;

  try {
    console.info("[paystack-callback] verifying transaction", { cleanReference });

    verified = (await verifyPaystackTransaction(cleanReference)) as VerifiedTransaction | null;

    console.info("[paystack-callback] verification response received", {
      hasVerified: !!verified,
      verifiedKeys: verified ? Object.keys(verified) : [],
    });
  } catch (error) {
    console.error("[paystack-callback] verify threw", {
      cleanReference,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    await writeAuditLog({
      dedupeKey,
      reference: cleanReference,
      transactionId: null,
      rawBody: {
        error: "Paystack verification call threw an exception",
        message: error instanceof Error ? error.message : String(error),
      },
      signatureVerified: false,
      status: "failed",
      orderId: order.id,
      errorMessage: "Paystack verification call threw an exception",
    });

    redirect("/payment-failed");
  }

  if (!verified) {
    console.error("[paystack-callback] verification returned nothing", { cleanReference });

    await writeAuditLog({
      dedupeKey,
      reference: cleanReference,
      transactionId: null,
      rawBody: { error: "No verification data returned from Paystack" },
      signatureVerified: false,
      status: "failed",
      orderId: order.id,
      errorMessage: "No verification data returned from Paystack",
    });

    redirect("/payment-failed");
  }

  const verifiedData = verified.data ?? verified;
  const verifiedAmount = Number(verifiedData?.amount);
  const verifiedCurrency = String(verifiedData?.currency || "").toUpperCase();
  const verifiedStatus = String(verifiedData?.status || "").toLowerCase();
  const verifiedTransactionId = typeof verifiedData?.id === "number" ? verifiedData.id : null;

  console.info("[paystack-callback] normalized verification data", {
    verifiedAmount,
    verifiedCurrency,
    verifiedStatus,
    verifiedTransactionId,
    expectedAmount: order.total,
  });

  const amountMismatch = !Number.isFinite(verifiedAmount) || verifiedAmount !== order.total;
  const currencyMismatch = verifiedCurrency !== "" && verifiedCurrency !== "NGN";
  const statusMismatch = verifiedStatus !== "success";

  if (statusMismatch || amountMismatch || currencyMismatch) {
    console.error("[paystack-callback] mismatch detected", {
      statusMismatch,
      amountMismatch,
      currencyMismatch,
      verifiedStatus,
      verifiedAmount,
      expectedAmount: order.total,
      verifiedCurrency,
    });

    await writeAuditLog({
      dedupeKey,
      reference: cleanReference,
      transactionId: verifiedTransactionId,
      rawBody: verified,
      signatureVerified: false,
      status: "failed",
      orderId: order.id,
      errorMessage: `Mismatch - status: ${verifiedStatus}, amount: ${verifiedAmount} (expected ${order.total}), currency: ${verifiedCurrency}`,
    });

    redirect("/payment-failed");
  }

  const paidOrder = await prisma.$transaction(async (tx) => {
    console.info("[paystack-callback] transaction started", { orderId: order.id, dedupeKey });

    const fresh = await tx.order.findUnique({
      where: { id: order.id },
      select: { paymentStatus: true },
    });

    console.info("[paystack-callback] fresh order status", {
      orderId: order.id,
      paymentStatus: fresh?.paymentStatus,
    });

    if (fresh?.paymentStatus === "paid") {
      console.info("[paystack-callback] already paid inside transaction", { orderId: order.id });

      await tx.paymentAuditLog.upsert({
        where: { dedupeKey },
        update: {
          status: "processed",
          orderId: order.id,
          transactionId: verifiedTransactionId,
          processedAt: new Date(),
          errorMessage: "Order was already paid by a previous process.",
        },
        create: {
          provider: "paystack",
          event: "callback.verify",
          dedupeKey,
          reference: cleanReference,
          transactionId: verifiedTransactionId,
          rawBody: JSON.stringify(verified),
          signatureVerified: false,
          status: "processed",
          orderId: order.id,
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
        paymentReference: cleanReference,
      },
    });

    console.info("[paystack-callback] order marked paid", {
      orderId: order.id,
      orderCode: order.orderCode,
      paymentReference: cleanReference,
    });

    await tx.paymentAuditLog.upsert({
      where: { dedupeKey },
      update: {
        status: "processed",
        orderId: order.id,
        transactionId: verifiedTransactionId,
        processedAt: new Date(),
        errorMessage: null,
      },
      create: {
        provider: "paystack",
        event: "callback.verify",
        dedupeKey,
        reference: cleanReference,
        transactionId: verifiedTransactionId,
        rawBody: JSON.stringify(verified),
        signatureVerified: false,
        status: "processed",
        orderId: order.id,
        processedAt: new Date(),
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

    console.info("[paystack-callback] admin notification created", { orderId: order.id });

    return {
      orderCode: order.orderCode,
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      total: order.total,
    };
  });

  if (paidOrder) {
    console.info("[paystack-callback] sending emails", {
      orderCode: paidOrder.orderCode,
      email: paidOrder.email,
    });

    const results = await Promise.allSettled([
      sendCustomerOrderEmail({
        email: paidOrder.email,
        fullName: paidOrder.fullName,
        orderCode: paidOrder.orderCode,
        total: paidOrder.total,
      }),
      sendAdminOrderEmail({
        orderCode: paidOrder.orderCode,
        customerName: paidOrder.fullName,
        customerEmail: paidOrder.email,
        phone: paidOrder.phone,
        total: paidOrder.total,
      }),
    ]);

    console.info(
      "[paystack-callback] email send results",
      results.map((r, i) => ({
        target: i === 0 ? "customer" : "admin",
        status: r.status,
        reason: r.status === "rejected"
          ? r.reason instanceof Error
            ? r.reason.message
            : String(r.reason)
          : null,
      })),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      await prisma.paymentAuditLog.update({
        where: { dedupeKey },
        data: {
          errorMessage: `Payment processed, but email delivery failed: ${failed
            .map((r) =>
              r.status === "rejected"
                ? r.reason instanceof Error
                  ? r.reason.message
                  : String(r.reason)
                : "",
            )
            .filter(Boolean)
            .join(" | ")}`,
        },
      });

      console.error("[paystack-callback] email delivery failed", { results });
    } else {
      console.info("[paystack-callback] email delivery succeeded", { orderCode: paidOrder.orderCode });
    }
  }

  redirect(`/order-success/${order.orderCode}`);
}