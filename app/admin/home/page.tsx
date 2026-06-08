import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Eye, Plus, Package, ChevronLeft, ChevronRight } from "lucide-react";
import HomeProductsClient from "./HomeProductsClient";

type HomeProductsPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

function buildHomeProductsHref(page: number) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/admin/home?${query}` : "/admin/home";
}

export default async function HomeProductsPage({
  searchParams,
}: HomeProductsPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params.page || "1") || 1);
  const perPage = 4;

  const [totalCount, featuredCount, allProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { featured: true } }),
    prisma.product.findMany({
      include: { brand: true, images: true },
      orderBy: [
        { featured: "desc" },
        { featuredOrder: "asc" },
        { createdAt: "desc" },
      ],
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const products = allProducts.slice(start, start + perPage);

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-neutral-950">
      <div className="mx-auto max-w-[1600px] px-4 pt-9 pb-0 sm:px-6 lg:px-2">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-2xl">
                Home Products
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-[15px]">
                Choose which products appear on the homepage and arrange their
                order.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white transition hover:border-neutral-300 hover:bg-emerald-800"
            >
              <Eye className="h-4 w-4" />
              Preview Homepage
            </Link>
          </div>
        </div>

        <HomeProductsClient products={products} />

        {pageCount > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Page {currentPage} of {pageCount}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buildHomeProductsHref(Math.max(1, currentPage - 1))}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  currentPage === 1
                    ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Link>

              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={buildHomeProductsHref(p)}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-xs font-medium transition ${
                      p === currentPage
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}

              <Link
                href={buildHomeProductsHref(
                  Math.min(pageCount, currentPage + 1),
                )}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  currentPage === pageCount
                    ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
