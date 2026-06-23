// app/shop/brand/[brandSlug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductGrid from "@/app/components/ProductGrid";
import BrandShopFilters from "@/app/components/BrandShopFilters";
import ShopPagination from "@/app/components/ShopPagination";
import { ChevronRight, Home, Package } from "lucide-react";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-dynamic";

type BrandPageSearchParams = {
  q?: string;
  sort?: string;
  page?: string;
};

type BrandPageProps = {
  params: Promise<{ brandSlug: string }>;
  searchParams?: Promise<BrandPageSearchParams>;
};

type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  featured: boolean;
  inStock: boolean;
  stockCount: number;
  brand: {
    name: string;
  } | null;
  images: {
    url: string;
  }[];
};

function sortLabel(sort: string) {
  switch (sort) {
    case "price_asc":
      return "Price: low to high";
    case "price_desc":
      return "Price: high to low";
    default:
      return "Featured first";
  }
}

function buildQueryString(params: {
  q?: string;
  sort?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.sort && params.sort !== "featured") {
    searchParams.set("sort", params.sort);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  return searchParams.toString();
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { brandSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const q =
    typeof resolvedSearchParams.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : "featured";
  const page = Math.max(
    1,
    Number.isFinite(Number(resolvedSearchParams.page))
      ? Number(resolvedSearchParams.page)
      : 1,
  );

  const pageSize = 6;

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const brand = brands.find((item) => slugify(item.name) === brandSlug);

  if (!brand) return notFound();

  const where = {
    brandId: brand.id,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : [
            { featured: "desc" as const },
            { featuredOrder: "asc" as const },
            { createdAt: "desc" as const },
          ];

  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedProducts = await prisma.product.findMany({
    where,
    include: {
      brand: true,
      images: true,
    },
    orderBy,
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });

  const typedProducts: ShopProduct[] = paginatedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    featured: product.featured,
    inStock: product.inStock,
    stockCount: product.stockCount,
    brand: product.brand ? { name: product.brand.name } : null,
    images: product.images.map((image) => ({ url: image.url })),
  }));

  const queryString = buildQueryString({
    q,
    sort,
  });

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-emerald-950 pb-14 pt-28 md:pb-28 md:pt-36">
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
            aria-hidden
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-px w-full bg-emerald-400" />
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden
          >
            <span className="select-none text-[24vw] font-black uppercase leading-none tracking-tighter text-emerald-900/20 md:text-[22vw]">
              SHOP
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
            <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              {brand.name}
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-500">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1 transition hover:text-neutral-950"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-neutral-300" />
                <Link
                  href="/shop"
                  className="transition hover:text-neutral-950"
                >
                  Shop
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-neutral-300" />
                <span className="text-center text-neutral-400">
                  {brand.name}
                </span>
              </li>
            </ol>
          </nav>

          <BrandShopFilters q={q} sort={sort} brandName={brand.name} />

          <div className="mb-4 mt-8 flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Showing{" "}
              <span className="font-medium text-neutral-900">
                {totalProducts === 0
                  ? 0
                  : Math.min(pageSize, totalProducts - (safePage - 1) * pageSize)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-neutral-900">
                {totalProducts}
              </span>{" "}
              products
            </p>

            <p className="text-xs text-neutral-400">{sortLabel(sort)}</p>
          </div>

          {typedProducts.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
              <Package className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
              <p className="text-sm text-neutral-500">
                No products match your filters.
              </p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={typedProducts.map((product) => ({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  featured: product.featured,
                  inStock: product.inStock,
                  stockCount: product.stockCount,
                  brand: product.brand ? { name: product.brand.name } : null,
                  images: product.images.map((image) => ({ url: image.url })),
                }))}
                columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-20"
              />

              <ShopPagination
                currentPage={safePage}
                totalPages={totalPages}
                basePath={`/shop/brand/${brandSlug}`}
                queryString={queryString}
              />
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}