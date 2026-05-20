  // app/api/my-orders/[orderCode]/receipt/route.ts
  import { prisma } from "@/lib/prisma";
  import { NextRequest, NextResponse } from "next/server";
  import {
    PDFDocument,
    StandardFonts,
    rgb,
    type PDFFont,
  } from "pdf-lib";

  export const runtime = "nodejs";

function formatNaira(amount: number) {
  return `NGN ${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(amount / 100)}`;
}

  function formatDateTime(date: Date) {
    return new Intl.DateTimeFormat("en-NG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function wrapText(text: string, maxChars: number) {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";

    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length <= maxChars) {
        line = next;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }

    if (line) lines.push(line);
    return lines;
  }

  function drawTextBlock(
    page: any,
    text: string,
    x: number,
    y: number,
    font: PDFFont,
    size: number,
    maxChars: number,
    lineHeight = 12,
  ) {
    const lines = wrapText(text, maxChars);
    let currentY = y;

    for (const line of lines) {
      page.drawText(line, {
        x,
        y: currentY,
        size,
        font,
        color: rgb(0.07, 0.09, 0.13),
      });
      currentY -= lineHeight;
    }

    return currentY;
  }

  export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orderCode: string }> },
  ) {
    const { orderCode } = await params;
    const email = req.nextUrl.searchParams.get("email")?.trim() || "";

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        orderCode: { equals: orderCode, mode: "insensitive" },
        email: { equals: email, mode: "insensitive" },
      },
      include: {
        items: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([288, 720]);

    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const width = 288;
    const left = 18;
    const right = width - 18;
    const black = rgb(0.07, 0.09, 0.13);
    const gray = rgb(0.45, 0.48, 0.53);
    const lightGray = rgb(0.79, 0.81, 0.84);

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 720,
      color: rgb(0.96, 0.96, 0.96),
    });

    const dashLine = (y: number) => {
      for (let x = left; x < right; x += 6) {
        page.drawLine({
          start: { x, y },
          end: { x: Math.min(x + 3, right), y },
          thickness: 1,
          color: lightGray,
        });
      }
    };

    let y = 690;

    page.drawText("CASH RECEIPT", {
      x: 0,
      y,
      size: 18,
      font: bold,
      color: black,
    });
    y -= 18;

    page.drawText("Order receipt", {
      x: 0,
      y,
      size: 9,
      font: regular,
      color: gray,
    });

    y -= 18;
    dashLine(y);

    y -= 18;
    y = drawTextBlock(
      page,
      `Address: ${order.street}, ${order.city}, ${order.state}${
        order.landmark ? `, ${order.landmark}` : ""
      }`,
      left,
      y,
      regular,
      9,
      38,
      12,
    );
    y -= 2;
    page.drawText(`Tel: ${order.phone}`, {
      x: left,
      y,
      size: 9,
      font: regular,
      color: black,
    });
    y -= 12;
    page.drawText(`Email: ${order.email}`, {
      x: left,
      y,
      size: 9,
      font: regular,
      color: black,
    });

    y -= 16;
    dashLine(y);

    y -= 16;
    page.drawText(`Date: ${formatDateTime(order.createdAt)}`, {
      x: left,
      y,
      size: 9,
      font: regular,
      color: black,
    });
    page.drawText(order.orderCode, {
      x: 190,
      y,
      size: 9,
      font: regular,
      color: black,
    });

    y -= 16;
    dashLine(y);

    y -= 14;

    for (const item of order.items) {
      const itemText = `${item.name}`;
      const priceText = formatNaira(item.price * item.qty);

      const nameLines = wrapText(itemText, 28);
      let itemY = y;

      for (const line of nameLines) {
        page.drawText(line, {
          x: left,
          y: itemY,
          size: 9,
          font: regular,
          color: black,
        });
        itemY -= 11;
      }

      page.drawText(priceText, {
        x: 200,
        y,
        size: 9,
        font: regular,
        color: black,
      });

      page.drawText(`Qty ${item.qty}`, {
        x: left,
        y: itemY,
        size: 8,
        font: regular,
        color: gray,
      });

      y = itemY - 10;
    }

    dashLine(y);

    y -= 18;
    page.drawText("Total", {
      x: left,
      y,
      size: 12,
      font: bold,
      color: black,
    });
    page.drawText(formatNaira(order.total), {
      x: 186,
      y,
      size: 12,
      font: bold,
      color: black,
    });

    y -= 18;
    page.drawText("Sub-total", {
      x: left,
      y,
      size: 9,
      font: regular,
      color: black,
    });
    page.drawText(formatNaira(order.subtotal), {
      x: 186,
      y,
      size: 9,
      font: regular,
      color: black,
    });

    y -= 14;
    page.drawText("Delivery", {
      x: left,
      y,
      size: 9,
      font: regular,
      color: black,
    });
    page.drawText(formatNaira(order.deliveryFee), {
      x: 186,
      y,
      size: 9,
      font: regular,
      color: black,
    });

    y -= 14;
    page.drawText("Payment", {
      x: left,
      y,
      size: 9,
      font: regular,
      color: black,
    });
    page.drawText(
      ["paid", "success"].includes(order.paymentStatus) ? "PAID" : "PENDING",
      {
        x: 186,
        y,
        size: 9,
        font: bold,
        color: black,
      },
    );

    y -= 18;
    dashLine(y);

    y -= 34;
    {
      const text = "THANK YOU";
      const textWidth = bold.widthOfTextAtSize(text, 18);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y,
        size: 18,
        font: bold,
        color: black,
      });
    }

    y -= 16;
    {
      const text = `Order #${order.orderCode}`;
      const textWidth = regular.widthOfTextAtSize(text, 8);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y,
        size: 8,
        font: regular,
        color: gray,
      });
    }

    y -= 12;
    {
      const text = order.fullName;
      const textWidth = regular.widthOfTextAtSize(text, 8);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y,
        size: 8,
        font: regular,
        color: gray,
      });
    }

    const bytes = await pdf.save();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${order.orderCode}.pdf"`,
        "Content-Length": String(bytes.byteLength),
      },
    });
  }