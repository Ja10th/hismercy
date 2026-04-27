import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Package, Sparkles, Tag, ArrowLeft } from "lucide-react";

async function updateHomepageProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const featured = formData.get("featured") === "on";
  const featuredOrder = Number(formData.get("featuredOrder") || 999);

  if (!id) return;

  await prisma.product.update({
    where: { id },
    data: {
      featured,
      featuredOrder,
    },
  });

  revalidatePath("/admin/home");
  revalidatePath("/");
  revalidatePath("/shop");
}

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export default async function HomeProductsPage() {
  const [products, featuredCount] = await Promise.all([
    prisma.product.findMany({
      include: { brand: true, images: true },
      orderBy: [
        { featured: "desc" },
        { featuredOrder: "asc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.product.count({ where: { featured: true } }),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Homepage Products
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Choose which products appear on the homepage and arrange their
              order.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700  transition hover:bg-neutral-950 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to admin
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {products.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              No products found.
            </div>
          ) : (
            products.map((product) => {
              const imageUrl = product.images[0]?.url || "/bags.png";
              const isFeatured = product.featured;

              return (
                <form
                  key={product.id}
                  action={updateHomepageProduct}
                  className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                >
                  <input type="hidden" name="id" value={product.id} />

                  <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
                    <div className="relative aspect-[4/3] bg-neutral-100 lg:aspect-auto lg:min-h-[240px]">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {isFeatured ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-medium text-white">
                            <Sparkles className="h-3.5 w-3.5" />
                            Featured
                          </span>
                        ) : (
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-900">
                            Not featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-[22px] font-semibold tracking-tight text-neutral-950">
                            {product.name}
                          </h2>
                          <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                            <Tag className="h-4 w-4" />
                            {product.brand?.name || "No brand"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-semibold text-neutral-950">
                            {formatNaira(product.price)}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400 break-all">
                            {product.slug}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-neutral-600">
                        <Package className="h-4 w-4" />
                        {product.inStock
                          ? `In stock${product.stockCount > 0 ? ` (${product.stockCount})` : ""}`
                          : "Out of stock"}
                      </div>

                      {product.description ? (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-600">
                          {product.description}
                        </p>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-neutral-400">
                          No description added yet.
                        </p>
                      )}
                    </div>

                    <div className="border-t border-neutral-200 bg-neutral-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
                      <div className="flex h-full flex-col justify-between gap-5">
                        <div className="space-y-4">
                          <label className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-neutral-950">
                                Show on homepage
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                Turn this product on or off.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              name="featured"
                              defaultChecked={product.featured}
                              className="h-5 w-5 rounded border-neutral-300 accent-emerald-600"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-neutral-700">
                              Homepage order
                            </span>
                            <input
                              name="featuredOrder"
                              type="number"
                              defaultValue={product.featuredOrder}
                              className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
                            />
                          </label>
                        </div>

                        <button className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
