import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST() {
  await requireAdmin();

  await prisma.adminNotification.deleteMany({});

  return NextResponse.json({ ok: true });
}