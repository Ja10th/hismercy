import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AddToCartButton from "./AddToCartButton";
import ProductGrid from "@/app/components/ProductGrid";
import { ChevronRight, Home } from "lucide-react";
import { slugify } from "@/lib/slugify";

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

type ProductCard = {
  stockCount: number;
  featured: boolean;
  id: string;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  brand: { name: string } | null;
  images: { url: string }[];
};

function shuffleArray<T>(array: T[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      images: true,
    },
  });

  if (!product) return notFound();

  const otherProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
    },
    include: {
      brand: true,
      images: true,
    },
  });

  const recommendedProducts = shuffleArray(otherProducts).slice(
    0,
    4,
  ) as ProductCard[];
  const mainImage = product.images[0]?.url || "/bags.png";
  const brandSlug = product.brand ? slugify(product.brand.name) : "";

  return (
    <>
      <Navbar />

      <main className="bg-white pt-[72px]">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mt-2 grid gap-8 lg:grid-cols-2">
            <div className="rounded-[30px] p-4 sm:p-2">
              <div className="relative aspect-square overflow-hidden rounded-[26px] bg-[#F3F3F1]">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-6 sm:p-10"
                />
              </div>
            </div>

            <div className="rounded-[30px] p-5 sm:p-7">
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                  <li className="flex items-end justify-between ">
                    <Link
                      href="/"
                      className="flex items-center gap-2 transition hover:text-neutral-950"
                    >
                      <Home className="h-3 w-3" />
                      Home
                    </Link>
                  </li>
                  <li className="flex items-center justify-between gap-2">
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
                    <span className="text-neutral-400">{product.name}</span>
                  </li>
                </ol>
              </nav>

              <h1 className="mt-2 text-3xl font-normal tracking-tight text-neutral-950 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="">
                    {product.brand ? (
                      <Link
                        href={`/shop/brand/${brandSlug}`}
                        className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 transition hover:bg-orange-100 hover:text-orange-700"
                      >
                        {product.brand.name}
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                        No brand
                      </span>
                    )}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium ${
                      product.inStock ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {product.inStock
                      ? `In stock${product.stockCount > 0 ? ` (${product.stockCount})` : ""}`
                      : "Currently unavailable"}
                  </div>
                </div>

                <p className="text-lg font-medium text-neutral-950 md:text-2xl">
                  {formatNaira(product.price)}
                </p>
              </div>

              <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600">
                {product.description ||
                  "No description available for this product yet."}
              </p>

              <div className="mt-6">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: mainImage,
                    inStock: product.inStock,
                  }}
                />
              </div>

              <div className="mt-6 hidden space-y-2 md:block">
                <div className="flex flex-col items-start gap-2 text-xs font-medium text-neutral-500 md:text-sm">
                  Note: We deliver on time, within 3 to 7 days. Enjoy safe
                  encrypted payments. Your money is safe with us.
                </div>
              </div>
            </div>
          </div>

          {recommendedProducts.length > 0 ? (
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="mt-1 text-2xl font-normal text-neutral-950 sm:text-3xl">
                  You may also like
                </h2>
              </div>

              <ProductGrid
                products={recommendedProducts.map((item) => ({
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  featured: item.featured,
                  inStock: item.inStock,
                  stockCount: item.stockCount,
                  brand: item.brand ? { name: item.brand.name } : null,
                  images: item.images.map((image) => ({ url: image.url })),
                }))}
                columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              />
            </section>
          ) : null}
        </section>
      </main>

      <Footer />
    </>
  );
}
