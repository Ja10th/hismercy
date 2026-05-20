import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
      return NextResponse.json({
        products: [],
        customers: [],
        brands: [],
      });
    }

    const [products, customers, brands] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      prisma.customer.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      }),
      prisma.brand.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    return NextResponse.json({
      products,
      customers,
      brands,
    });
  } catch {
    return NextResponse.json(
      { products: [], customers: [], brands: [] },
      { status: 200 },
    );
  }
}