import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { sendWhatsAppNewOrderNotification } from "@/lib/whatsapp";
import { redirect } from "next/navigation";

type CallbackProps = {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
  }>;
};

export default async function PaystackCallbackPage({
  searchParams,
}: CallbackProps) {
  const params = await searchParams;
  const reference = params.reference || params.trxref;

  if (!reference) {
    redirect("/checkout?payment=missing-reference");
  }

  const order = await prisma.order.findUnique({
    where: { orderCode: reference },
    include: {
      items: true,
    },
  });

  if (!order) {
    redirect("/checkout?payment=order-not-found");
  }

  const verified = await verifyPaystackTransaction(reference);

  if (verified.status !== "success" || verified.amount !== order.total) {
    redirect("/payment-failed");
  }

  const alreadyPaid =
    order.paymentStatus === "paid" || order.paymentStatus === "success";

  if (!alreadyPaid) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "paid",
        paidAt: new Date(),
      },
    });

    await sendWhatsAppNewOrderNotification({
      orderCode: order.orderCode,
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      total: order.total,
      deliveryMethod: order.deliveryMethod,
      items: order.items.map((item) => ({
        name: item.name,
        qty: item.qty,
      })),
    });
  }

  redirect(`/order-success/${order.orderCode}`);
}