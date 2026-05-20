"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  on_the_way: "On the way",
  delivered: "Delivered",
  completed: "Completed",
};

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");

  if (!orderId || !status) {
    redirect("/admin/orders?error=1");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note: `Status changed to ${statusLabels[status] || status}`,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/history");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    revalidatePath("/shop");

    redirect(`/admin/orders/${orderId}?updated=1`);
  } catch (error) {
    console.error("Failed to update order status:", error);
    redirect(`/admin/orders/${orderId}?error=1`);
  }
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get("orderId") || "");

  if (!orderId) {
    redirect("/admin/orders?error=1");
  }

  try {
    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/history");
    revalidatePath("/admin");
    revalidatePath("/shop");

    redirect("/admin/orders?deleted=1");
  } catch (error) {
    console.error("Failed to delete order:", error);
    redirect("/admin/orders?error=1");
  }
}