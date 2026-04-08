import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShopProducts from "../components/ShopProducts";
import { Search, SlidersHorizontal, X, Package, ArrowUpDown } from "lucide-react";

type ShopSearchParams = {
  q?: string;
  brand?: string;
  sort?: string;
};

type ShopPageProps = {
  searchParams: Promise<ShopSearchParams>;
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

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

function buildShopHref(params: { q?: string; brand?: string; sort?: string }) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.brand) query.set("brand", params.brand);
  if (params.sort && params.sort !== "featured") query.set("sort", params.sort);

  const stringified = query.toString();
  return stringified ? `/shop?${stringified}` : "/shop";
}

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

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;

  const q =
    typeof resolvedSearchParams.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";
  const brand =
    typeof resolvedSearchParams.brand === "string"
      ? resolvedSearchParams.brand.trim()
      : "";
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : "featured";

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const selectedBrand = brands.find((b) => b.id === brand);

  const products = await prisma.product.findMany({
    where: {
      ...(brand ? { brandId: brand } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      brand: true,
      images: true,
    },
    orderBy:
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : [{ featured: "desc" }, { featuredOrder: "asc" }, { createdAt: "desc" }],
  });

  const hasFilters = Boolean(q || brand || sort !== "featured");

  const typedProducts: ShopProduct[] = products.map((product) => ({
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

  return (
    <>
      <Navbar />

      <main className="bg-white pt-[72px]">
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mb-4 flex flex-col items-center gap-1 sm:gap-4 sm:flex-row sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[13px] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Shop
              </div>

              <h1 className="mt-4 text-3xl text-center font-normal tracking-tight text-neutral-950 sm:text-4xl ">
                Browse the full collection.
              </h1>

              <p className="mt-4 text-[15px] text-center leading-7 text-neutral-500 sm:text-base">
                Search products, filter by brand, and shop in naira.
              </p>
            </div>

             {/* ── Filter bar ──────────────────────────────────────────── */}
          <div className=" z-20 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
 
              {/* Search */}
              <form action="/shop" method="get" className="flex flex-1 items-center gap-2 min-w-0">
                <input type="hidden" name="brand" value={brand} />
                <input type="hidden" name="sort" value={sort} />
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="Search products…"
                    className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                  />
                  {q && (
                    <Link href={buildShopHref({ brand, sort })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                      <X className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <button type="submit"
                  className="h-10 shrink-0 rounded-xl bg-[#171717] px-4 text-sm font-medium text-white transition hover:bg-neutral-800">
                  Search
                </button>
              </form>
 
              {/* Sort */}
              <form action="/shop" method="get" className="flex items-center gap-2 shrink-0">
                <input type="hidden" name="q" value={q} />
                <input type="hidden" name="brand" value={brand} />
                <div className="relative">
                  <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                  <select name="sort" defaultValue={sort}
                    className="h-10 appearance-none rounded-xl border border-neutral-200 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-neutral-950 cursor-pointer">
                    <option value="featured">Featured</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>
                </div>
                <button type="submit"
                  className="h-10 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100">
                  Apply
                </button>
              </form>
 
              {/* Clear */}
              {hasFilters && (
                <Link href="/shop"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 transition hover:bg-red-100">
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Link>
              )}
            </div>
 
            {/* Brand pills */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link href={buildShopHref({ q, sort })}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  !brand
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                }`}>
                All brands
              </Link>
              {brands.map((b) => (
                <Link key={b.id} href={buildShopHref({ q, brand: b.id, sort })}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    brand === b.id
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                  }`}>
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

            <div className="mt-8 mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-900">
                  {products.length}
                </span>{" "}
                products
              </p>

              <p className="text-xs text-neutral-400">{sortLabel(sort)}</p>
            </div>

            {products.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
                <Package className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
                <p className="text-sm text-neutral-500">
                  No products match your filters.
                </p>
              </div>
            ) : (
              <ShopProducts products={typedProducts} />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}