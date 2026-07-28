// app/api/admin/orders/[orderCode]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  await requireAdmin();

  const { orderCode } = await params;

  if (!orderCode) {
    return NextResponse.json(
      { ok: false, message: "Missing orderCode" },
      { status: 400 },
    );
  }

  try {
    const body: unknown = await req.json().catch(() => null);
    const status =
      body &&
      typeof body === "object" &&
      "status" in body &&
      typeof (body as { status?: unknown }).status === "string"
        ? (body as { status: string }).status
        : "";

    if (!status) {
      return NextResponse.json(
        { ok: false, message: "Missing status" },
        { status: 400 },
      );
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { ok: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, message: "Order not found" },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status,
          note: `Status changed to ${statusLabels[status]}`,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/history");
    revalidatePath(`/admin/orders/${orderCode}`);
    revalidatePath("/admin");
    revalidatePath("/shop");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update order status" },
      { status: 500 },
    );
  }
}