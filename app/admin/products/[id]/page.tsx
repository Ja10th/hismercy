import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Tag, PencilLine } from "lucide-react";

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, images: true },
  });

  if (!product) notFound();

  const imageUrl = product.images[0]?.url || "/bags.png";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="relative aspect-square bg-neutral-50">
            <Image src={imageUrl} alt={product.name} fill className="object-contain p-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-950">{product.name}</h1>
              <p className="mt-2 text-sm text-neutral-500">{product.slug}</p>
            </div>

            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </Link>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center gap-2 text-neutral-500">
                <Tag className="h-4 w-4" />
                Brand
              </div>
              <p className="mt-2 font-medium text-neutral-950">
                {product.brand?.name || "No brand"}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center gap-2 text-neutral-500">
                <Package className="h-4 w-4" />
                Stock
              </div>
              <p className="mt-2 font-medium text-neutral-950">{product.stockCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}