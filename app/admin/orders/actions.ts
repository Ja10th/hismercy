"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";

const VALID_STATUSES = ["pending", "on_the_way", "delivered", "completed"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  on_the_way: "On the way",
  delivered: "Delivered",
  completed: "Completed",
};

function isValidStatus(value: string): value is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");

  if (!orderId || !status) redirect("/admin/orders?error=1");
  if (!isValidStatus(status)) redirect("/admin/orders?error=1");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderCode: true, status: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status } });
    await tx.orderStatusHistory.create({
      data: { orderId, status, note: `Status changed to ${statusLabels[status]}` },
    });
  });

  await logAudit({
    category: "order",
    action: "Updated order status",
    target: order?.orderCode,
    href: `/admin/orders/${order?.orderCode}`,
    meta: { from: order?.status, to: status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/history");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/shop");

  redirect(`/admin/orders/${orderId}?updated=1`);
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") || "");
  if (!orderId) redirect("/admin/orders?error=1");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderCode: true, fullName: true, total: true },
  });

  await prisma.order.delete({ where: { id: orderId } });

  await logAudit({
    category: "order",
    action: "Deleted order",
    target: order?.orderCode,
    meta: { customer: order?.fullName, total: order?.total },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/history");
  revalidatePath("/admin");
  revalidatePath("/shop");

  redirect("/admin/orders?deleted=1");
}