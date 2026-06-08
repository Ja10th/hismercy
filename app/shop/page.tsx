import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShopProducts from "../components/ShopProducts";
import ShopFilters from "../components/ShopFilters";
import ShopPagination from "../components/ShopPagination";
import { Package } from "lucide-react";

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
      : 1
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
        : [{ featured: "desc" as const }, { featuredOrder: "asc" as const }, { createdAt: "desc" as const }];

  const [totalProducts, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        images: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedProducts =
    safePage === page
      ? products
      : await prisma.product.findMany({
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

  const hasFilters = Boolean(q || brand || sort !== "featured");
  const queryString = new URLSearchParams(
    Object.entries({
      ...(q ? { q } : {}),
      ...(brand ? { brand } : {}),
      ...(sort !== "featured" ? { sort } : {}),
    })
  ).toString();

  return (
    <>
      <Navbar />

      <main className="bg-white pt-18">
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="flex flex-col items-center gap-1 sm:gap-4 sm:flex-row sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[13px] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Shop
              </div>

              <h1 className="text-center text-3xl font-normal tracking-tight text-neutral-950 sm:text-4xl">
                Browse the full collection.
              </h1>

              <p className="text-center text-[16px] leading-7 text-neutral-500 sm:text-base">
                Search products, filter by brand, and shop in naira.
              </p>
            </div>

            <ShopFilters brands={brands} q={q} brand={brand} sort={sort} />

            <div className="mt-8 mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-900">
                  {Math.min(pageSize, totalProducts - (safePage - 1) * pageSize)}
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