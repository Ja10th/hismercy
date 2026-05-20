import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { redirect } from "next/navigation";

type CallbackProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export default async function PaystackCallbackPage({ searchParams }: CallbackProps) {
  const { reference } = await searchParams;

  if (!reference) {
    redirect("/checkout?payment=missing-reference");
  }

  const order = await prisma.order.findUnique({
    where: { orderCode: reference },
  });

  if (!order) {
    redirect("/checkout?payment=order-not-found");
  }

  const verified = await verifyPaystackTransaction(reference);

  if (
    verified.status !== "success" ||
    verified.amount !== order.total
  ) {
    redirect("/checkout?payment=failed");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      paidAt: new Date(),
    },
  });

  redirect(`/order-success/${order.orderCode}`);
}