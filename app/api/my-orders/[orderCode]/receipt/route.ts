// app/api/my-orders/[orderCode]/receipt/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

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

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

/** Draw left-aligned text, returns the new Y after all lines */
function drawWrapped(
  page: any,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  maxWidth: number,
  color: ReturnType<typeof rgb>,
  lineHeight = 13,
) {
  const lines = wrapText(text, font, size, maxWidth);
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

/** Draw text right-aligned so its right edge sits at `rightEdge` */
function drawRight(
  page: any,
  text: string,
  rightEdge: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: rightEdge - textWidth, y, size, font, color });
}

/** Draw centered text within [x, x+containerWidth] */
function drawCentered(
  page: any,
  text: string,
  containerX: number,
  containerWidth: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: containerX + (containerWidth - textWidth) / 2,
    y,
    size,
    font,
    color,
  });
}

function drawDash(
  page: any,
  y: number,
  left: number,
  right: number,
  color: ReturnType<typeof rgb>,
) {
  for (let x = left; x < right; x += 6) {
    page.drawLine({
      start: { x, y },
      end: { x: Math.min(x + 3, right), y },
      thickness: 0.75,
      color,
    });
  }
}

// ─── Height estimator (must mirror drawing logic) ──────────────────────────
function estimateHeight(
  order: {
    street: string;
    city: string;
    state: string;
    landmark: string | null;
    items: { name: string; qty: number }[];
  },
  regular: PDFFont,
  contentWidth: number,
  lineHeight: number,
) {
  let h = 0;

  // Header
  h += 24 + 14 + 14; // title + subtitle + gap-before-dash
  h += 14; // dash + gap

  // Address block
  const addrText = `Address: ${order.street}, ${order.city}, ${order.state}${order.landmark ? `, ${order.landmark}` : ""}`;
  const addrLines = wrapText(addrText, regular, 9, contentWidth);
  h += addrLines.length * lineHeight + 2 + 12 + 12; // addr + tel + email
  h += 14 + 14; // dash + date row
  h += 14 + 14; // dash + gap-before-items

  // Items
  for (const item of order.items) {
    const nameLines = wrapText(item.name, regular, 9, contentWidth * 0.62);
    h += nameLines.length * lineHeight + 11 + 10; // name lines + qty row + gap
  }

  // Totals section
  h += 14; // dash
  h += 20 + 16 + 16 + 16 + 20; // total + subtotal + delivery + payment + dash

  // Footer
  h += 40 + 14 + 14 + 20; // THANK YOU + order# + name + bottom padding

  return Math.ceil(h);
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
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // ── Layout constants ──────────────────────────────────────────────────────
  const PAGE_W = 288;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const RIGHT_EDGE = PAGE_W - MARGIN;
  const LINE_H = 13;

  const black = rgb(0.07, 0.09, 0.13);
  const gray = rgb(0.45, 0.48, 0.53);
  const lightGray = rgb(0.79, 0.81, 0.84);
  const bg = rgb(0.96, 0.96, 0.96);

  // ── Build fonts on a temp doc just for measurement ────────────────────────
  const tempDoc = await PDFDocument.create();
  const tempRegular = await tempDoc.embedFont(StandardFonts.Helvetica);

  const estimatedH = estimateHeight(order, tempRegular, CONTENT_W, LINE_H);
  const PAGE_H = Math.max(estimatedH, 500);

  // ── Real document ─────────────────────────────────────────────────────────
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: bg });

  const dash = (y: number) => drawDash(page, y, MARGIN, RIGHT_EDGE, lightGray);

  let y = PAGE_H - 22;

  // ── Header ────────────────────────────────────────────────────────────────
  drawCentered(page, "CASH RECEIPT", MARGIN, CONTENT_W, y, bold, 16, black);
  y -= 16;

  drawCentered(page, "Order Receipt", MARGIN, CONTENT_W, y, regular, 8, gray);
  y -= 14;

  dash(y);
  y -= 14;

  // ── Address block ─────────────────────────────────────────────────────────
  const addrText = `Address: ${order.street}, ${order.city}, ${order.state}${order.landmark ? `, ${order.landmark}` : ""}`;
  y = drawWrapped(page, addrText, MARGIN, y, regular, 8.5, CONTENT_W, black, LINE_H);
  y -= 2;

  page.drawText(`Tel: ${order.phone}`, { x: MARGIN, y, size: 8.5, font: regular, color: black });
  y -= LINE_H;

  page.drawText(`Email: ${order.email}`, { x: MARGIN, y, size: 8.5, font: regular, color: black });
  y -= 14;

  dash(y);
  y -= 13;

  // ── Date + Order code ─────────────────────────────────────────────────────
  page.drawText(`Date: ${formatDateTime(order.createdAt)}`, {
    x: MARGIN,
    y,
    size: 8.5,
    font: regular,
    color: black,
  });
  drawRight(page, order.orderCode, RIGHT_EDGE, y, regular, 8.5, gray);
  y -= 14;

  dash(y);
  y -= 13;

  // ── Column headers ────────────────────────────────────────────────────────
  page.drawText("ITEM", { x: MARGIN, y, size: 7.5, font: bold, color: gray });
  drawRight(page, "AMOUNT", RIGHT_EDGE, y, bold, 7.5, gray);
  y -= 10;

  dash(y);
  y -= 13;

  // ── Line items ────────────────────────────────────────────────────────────
  // Name column gets ~62% of width; price column gets the rest (right-aligned)
  const NAME_MAX_W = CONTENT_W * 0.62;

  for (const item of order.items) {
    const priceText = formatNaira(item.price * item.qty);
    const nameLines = wrapText(item.name, regular, 9, NAME_MAX_W);
    const itemTopY = y;

    // Name (left)
    let nameY = itemTopY;
    for (const line of nameLines) {
      page.drawText(line, { x: MARGIN, y: nameY, size: 9, font: regular, color: black });
      nameY -= LINE_H;
    }

    // Qty below name
    page.drawText(`Qty: ${item.qty}`, { x: MARGIN, y: nameY, size: 7.5, font: regular, color: gray });

    // Price (right-aligned, vertically centred on item block)
    const blockH = (nameLines.length + 1) * LINE_H;
    const priceY = itemTopY - (blockH - regular.widthOfTextAtSize("X", 9)) / 2 + 2;
    drawRight(page, priceText, RIGHT_EDGE, priceY, regular, 9, black);

    y = nameY - 10;
  }

  dash(y);
  y -= 16;

  // ── Totals ────────────────────────────────────────────────────────────────
  const drawRow = (
    label: string,
    value: string,
    labelFont: PDFFont,
    valueFont: PDFFont,
    size: number,
    spacing: number,
  ) => {
    page.drawText(label, { x: MARGIN, y, size, font: labelFont, color: black });
    drawRight(page, value, RIGHT_EDGE, y, valueFont, size, black);
    y -= spacing;
  };

  drawRow("Total", formatNaira(order.total), bold, bold, 11, 16);
  drawRow("Sub-total", formatNaira(order.subtotal), regular, regular, 8.5, 13);
  drawRow("Delivery", formatNaira(order.deliveryFee), regular, regular, 8.5, 13);

  const paymentLabel = ["paid", "success"].includes(order.paymentStatus) ? "PAID" : "PENDING";
  page.drawText("Payment", { x: MARGIN, y, size: 8.5, font: regular, color: black });
  drawRight(page, paymentLabel, RIGHT_EDGE, y, bold, 8.5, black);
  y -= 16;

  dash(y);
  y -= 28;

  // ── Footer ────────────────────────────────────────────────────────────────
  drawCentered(page, "THANK YOU", MARGIN, CONTENT_W, y, bold, 16, black);
  y -= 16;

  drawCentered(page, `Order #${order.orderCode}`, MARGIN, CONTENT_W, y, regular, 8, gray);
  y -= 12;

  drawCentered(page, order.fullName, MARGIN, CONTENT_W, y, regular, 8, gray);

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${order.orderCode}.pdf"`,
      "Content-Length": String(bytes.byteLength),
    },
  });
}