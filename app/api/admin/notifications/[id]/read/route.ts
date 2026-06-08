import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();

  const { id } = await params;

  await prisma.adminNotification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}