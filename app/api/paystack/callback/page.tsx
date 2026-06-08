import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { redirect } from "next/navigation";

type CallbackProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

function callbackDedupeKey(reference: string) {
  return `callback:verify:${reference}`;
}

export default async function PaystackCallbackPage({
  searchParams,
}: CallbackProps) {
  const { reference } = await searchParams;

  if (!reference || typeof reference !== "string") {
    redirect("/checkout?payment=missing-reference");
  }

  const cleanReference = reference.trim();

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
    },
  });

  if (!order) {
    redirect("/checkout?payment=order-not-found");
  }

  if (order.paymentStatus === "paid") {
    await prisma.paymentAuditLog.upsert({
      where: { dedupeKey: callbackDedupeKey(cleanReference) },
      update: {
        status: "processed",
        orderId: order.id,
        processedAt: new Date(),
        errorMessage: "Callback arrived after payment was already marked paid.",
      },
      create: {
        provider: "paystack",
        event: "callback.verify",
        dedupeKey: callbackDedupeKey(cleanReference),
        reference: cleanReference,
        transactionId: null,
        rawBody: JSON.stringify({
          reference: cleanReference,
          alreadyPaid: true,
        }),
        signatureVerified: false,
        status: "processed",
        orderId: order.id,
        processedAt: new Date(),
      },
    });

    redirect(`/order-success/${order.orderCode}`);
  }

  let verified: Awaited<ReturnType<typeof verifyPaystackTransaction>> | null =
    null;

  try {
    verified = await verifyPaystackTransaction(cleanReference);
  } catch (error) {
    await prisma.paymentAuditLog.upsert({
      where: { dedupeKey: callbackDedupeKey(cleanReference) },
      update: {
        status: "failed",
        errorMessage: "Paystack verification call threw an exception",
        processedAt: new Date(),
      },
      create: {
        provider: "paystack",
        event: "callback.verify",
        dedupeKey: callbackDedupeKey(cleanReference),
        reference: cleanReference,
        transactionId: null,
        rawBody: JSON.stringify({
          error: "Paystack verification call threw an exception",
        }),
        signatureVerified: false,
        status: "failed",
        orderId: order.id,
        errorMessage: "Paystack verification call threw an exception",
        processedAt: new Date(),
      },
    });

    redirect("/checkout?payment=verification-failed");
  }

  if (!verified) {
    redirect("/checkout?payment=verification-failed");
  }

  const verifiedAmount = Number(verified.amount);
  const verifiedCurrency = String(verified.currency || "").toUpperCase();
  const verifiedStatus = String(verified.status || "").toLowerCase();
  const verifiedTransactionId =
    typeof (verified as Record<string, unknown>).id === "number"
      ? ((verified as Record<string, unknown>).id as number)
      : null;

  const amountMismatch =
    !Number.isFinite(verifiedAmount) || verifiedAmount !== order.total;
  const currencyMismatch =
    verifiedCurrency !== "" && verifiedCurrency !== "NGN";
  const statusMismatch = verifiedStatus !== "success";

  if (statusMismatch || amountMismatch || currencyMismatch) {
    await prisma.paymentAuditLog.upsert({
      where: { dedupeKey: callbackDedupeKey(cleanReference) },
      update: {
        status: "failed",
        errorMessage: `Mismatch - status: ${verifiedStatus}, amount: ${verifiedAmount} (expected ${order.total}), currency: ${verifiedCurrency}`,
        processedAt: new Date(),
      },
      create: {
        provider: "paystack",
        event: "callback.verify",
        dedupeKey: callbackDedupeKey(cleanReference),
        reference: cleanReference,
        transactionId: verifiedTransactionId,
        rawBody: JSON.stringify(verified),
        signatureVerified: false,
        status: "failed",
        orderId: order.id,
        errorMessage: `Mismatch - status: ${verifiedStatus}, amount: ${verifiedAmount} (expected ${order.total}), currency: ${verifiedCurrency}`,
        processedAt: new Date(),
      },
    });

    redirect("/checkout?payment=failed");
  }

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.order.findUnique({
      where: { id: order.id },
      select: { paymentStatus: true },
    });

    if (fresh?.paymentStatus === "paid") {
      await tx.paymentAuditLog.upsert({
        where: { dedupeKey: callbackDedupeKey(cleanReference) },
        update: {
          status: "processed",
          orderId: order.id,
          transactionId: verifiedTransactionId,
          processedAt: new Date(),
          errorMessage:
            "Order was already paid by webhook before callback finished.",
        },
        create: {
          provider: "paystack",
          event: "callback.verify",
          dedupeKey: callbackDedupeKey(cleanReference),
          reference: cleanReference,
          transactionId: verifiedTransactionId,
          rawBody: JSON.stringify(verified),
          signatureVerified: false,
          status: "processed",
          orderId: order.id,
          processedAt: new Date(),
        },
      });

      return;
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

    await tx.paymentAuditLog.upsert({
      where: { dedupeKey: callbackDedupeKey(cleanReference) },
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
        dedupeKey: callbackDedupeKey(cleanReference),
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
  });


  redirect(`/order-success/${order.orderCode}`);
}
