import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AddToCartButton from "./AddToCartButton";
import { ArrowLeft, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import ProductGrid from "@/app/components/ProductGrid";

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

  return (
    <>
      <Navbar />

      <main className="bg-white pt-[72px]">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-[#F3F3F1] px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
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
              <h1 className="mt-2 text-3xl font-normal tracking-tight text-neutral-950 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-neutral-500">
                    {product.brand?.name || "No brand"}
                  </p>

                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                      product.inStock
                        ? "border-green-200 bg-green-100 text-green-700"
                        : "border-red-200 bg-red-100 text-red-700"
                    }`}
                  >
                    {product.inStock
                      ? `In stock${product.stockCount > 0 ? ` (${product.stockCount})` : ""}`
                      : "Currently unavailable"}
                  </div>
                </div>

                <p className="text-3xl font-medium text-neutral-950">
                  {formatNaira(product.price)}
                </p>
              </div>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600">
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

              <div className="mt-6 space-y-2">
                <div className="">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-950">
                    <Truck className="h-4 w-4" />
                    <span className="font-semibold">Delivery:</span> We deliver
                    on time, within 3 to 7 days.
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-950">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-semibold">Secure Payment:</span> Enjoy
                    safe encrypted payments.
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-950">
                    <RotateCcw className="h-4 w-4" />
                    <span className="font-semibold">
                      Returns and Refunds:
                    </span>{" "}
                    Your money is safe with us.
                  </div>
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
