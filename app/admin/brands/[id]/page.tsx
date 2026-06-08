import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag, Box } from "lucide-react";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function AdminBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { images: true },
      },
    },
  });

  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/brands"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to brands
      </Link>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <h1 className="text-3xl font-semibold text-neutral-950">{brand.name}</h1>
        <p className="mt-2 text-sm text-neutral-500">{brand.slug}</p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-neutral-500" />
          <h2 className="text-lg font-semibold">Products</h2>
        </div>

        <div className="mt-4 space-y-3">
          {brand.products.length === 0 ? (
            <p className="text-sm text-neutral-500">No products under this brand.</p>
          ) : (
            brand.products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="block rounded-2xl border border-neutral-200 px-4 py-3 transition hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-neutral-950">{product.name}</p>
                    <p className="text-sm text-neutral-500">{product.slug}</p>
                  </div>
                  <p className="font-semibold text-neutral-950">
                    {formatNaira(product.price)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}