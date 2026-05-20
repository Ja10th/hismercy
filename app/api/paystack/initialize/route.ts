import { prisma } from "@/lib/prisma";
import { getAppUrl, initializePaystackTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

type IncomingItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  imageUrl?: string;
  images?: { url: string }[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customer = body.customer as {
      fullName: string;
      email: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      landmark?: string;
      notes?: string;
    };

    const items = (body.items as IncomingItem[]) || [];
    const deliveryMethod = String(body.deliveryMethod || "standard");
    const subtotal = Number(body.subtotal || 0);
    const deliveryFee = Number(body.deliveryFee || 0);
    const total = Number(body.total || 0);

    if (!customer?.fullName || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { ok: false, error: "Missing customer information" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const orderCode = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;

    const savedCustomer = await prisma.customer.upsert({
      where: { email: customer.email.toLowerCase() },
      update: {
        fullName: customer.fullName,
        phone: customer.phone,
        street: customer.street,
        city: customer.city,
        state: customer.state,
        landmark: customer.landmark || null,
      },
      create: {
        fullName: customer.fullName,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        street: customer.street,
        city: customer.city,
        state: customer.state,
        landmark: customer.landmark || null,
      },
    });

    const order = await prisma.order.create({
      data: {
        orderCode,
        customer: {
          connect: {
            id: savedCustomer.id,
          },
        },
        fullName: customer.fullName,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        street: customer.street,
        city: customer.city,
        state: customer.state,
        landmark: customer.landmark || null,
        notes: customer.notes || null,
        deliveryMethod,
        subtotal,
        deliveryFee,
        total,
        status: "pending",
        paymentStatus: "pending",
        paymentReference: orderCode,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image: item.image || item.imageUrl || item.images?.[0]?.url || "/bags.png",
          })),
        },
      },
      include: { items: true },
    });

    const init = await initializePaystackTransaction({
      email: order.email,
      amount: order.total,
      reference: order.orderCode,
      callbackUrl: `${getAppUrl()}/paystack/callback`,
      metadata: {
        orderCode: order.orderCode,
        fullName: order.fullName,
        phone: order.phone,
      },
    });

    return NextResponse.json({
      ok: true,
      authorizationUrl: init.authorization_url,
      reference: init.reference,
      orderCode: order.orderCode,
    });
  } catch (error) {
    console.error("PAYSTACK INIT ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Could not initialize payment" },
      { status: 500 }
    );
  }
}