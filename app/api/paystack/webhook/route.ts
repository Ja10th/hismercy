import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: {
      reference?: string;
      amount?: number;
      status?: string;
    };
  };

  if (event.event === "charge.success" && event.data?.reference) {
    const order = await prisma.order.findUnique({
      where: { orderCode: event.data.reference },
    });

    if (order && event.data.amount === order.total) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}