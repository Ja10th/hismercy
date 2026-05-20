// app/api/admin/orders/[orderCode]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

export async function DELETE(
  _req: NextRequest,
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

    await prisma.order.delete({
      where: { id: order.id },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/history");
    revalidatePath("/admin");
    revalidatePath("/shop");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete order" },
      { status: 500 },
    );
  }
}