import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  await requireAdmin();

  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];

  if (!items.length) {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction(
    items.map((item: { id: string; featuredOrder: number }) =>
      prisma.product.update({
        where: { id: item.id },
        data: { featuredOrder: item.featuredOrder },
      })
    )
  );

  revalidatePath("/admin/home");
  revalidatePath("/");
  revalidatePath("/shop");

  return NextResponse.json({ ok: true });
}