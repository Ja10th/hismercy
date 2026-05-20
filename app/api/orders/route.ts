import { prisma } from "@/lib/prisma";
import { sendWhatsAppNewOrderNotification } from "@/lib/whatsapp";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

type IncomingItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  imageUrl?: string;
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

    const result = await prisma.$transaction(async (tx) => {
      const savedCustomer = await tx.customer.upsert({
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

      const order = await tx.order.create({
        data: {
          orderCode,
          customerId: savedCustomer.id,

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
          items: {
            create: items.map((item) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              image: item.image || item.imageUrl || "/bags.png",
            })),
          },
          history: {
            create: {
              status: "pending",
              note: "Order created",
            },
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });

    sendWhatsAppNewOrderNotification({
      orderCode: result.orderCode,
      fullName: result.fullName,
      phone: result.phone,
      email: result.email,
      total: result.total,
      deliveryMethod: result.deliveryMethod,
      items: result.items.map((item) => ({
        name: item.name,
        qty: item.qty,
      })),
    }).catch(console.error);

    return NextResponse.json({
      ok: true,
      orderCode: result.orderCode,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Could not create order" },
      { status: 500 }
    );
  }
}