import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShopProducts from "../components/ShopProducts";
import ShopFilters from "../components/ShopFilters";
import ShopPagination from "../components/ShopPagination";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

type ShopSearchParams = {
  q?: string;
  brand?: string;
  sort?: string;
  page?: string;
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
  brand?: string;
  sort?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.brand) searchParams.set("brand", params.brand);
  if (params.sort && params.sort !== "featured") {
    searchParams.set("sort", params.sort);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  return searchParams.toString();
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

  const pageSize = 6;
  const page = Math.max(
    1,
    Number.isFinite(Number(resolvedSearchParams.page))
      ? Number(resolvedSearchParams.page)
      : 1,
  );

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const where = {
    ...(brand ? { brandId: brand } : {}),
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
    brand,
    sort,
  });

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden bg-emerald-950 pb-14 md:pb-28 pt-28 md:pt-36">
        {/* Horizontal field lines */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
          aria-hidden
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-emerald-400" />
          ))}
        </div>

        {/* Large faint background word */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span className="select-none text-[24vw] md:text-[22vw]  font-black uppercase leading-none tracking-tighter text-emerald-900/20 ">
            SHOP
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
          <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            Browse Shop
          </h1>
        </div>
      </section>

      <main className="bg-white pt-4">
        <section>
          <div className="mx-auto max-w-7xl px-5 md:px-10">
          <ShopFilters brands={brands} q={q} brand={brand} sort={sort} />
            <div className="mt-8 mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-900">
                  {Math.min(
                    pageSize,
                    totalProducts - (safePage - 1) * pageSize,
                  )}
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
                <ShopProducts products={typedProducts} />
                <ShopPagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  basePath="/shop"
                  queryString={queryString}
                />
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
