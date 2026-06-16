// app/shop/brand/[brandSlug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductGrid from "@/app/components/ProductGrid";
import { ChevronRight, Home } from "lucide-react";
import { slugify } from "@/lib/slugify";

type BrandPageProps = {
  params: Promise<{ brandSlug: string }>;
};

export default async function BrandPage({ params }: BrandPageProps) {
  const { brandSlug } = await params;

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const brand = brands.find((item) => slugify(item.name) === brandSlug);

  if (!brand) return notFound();

  const products = await prisma.product.findMany({
    where: {
      brandId: brand.id,
    },
    include: {
      brand: true,
      images: true,
    },
    orderBy: [
      { featured: "desc" },
      { featuredOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <>
      <Navbar />

      <main className="bg-white pt-32 md:pt-24">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
              <li className="flex items-center justify-center gap-2">
                <ChevronRight className="h-4 w-4 text-neutral-300" />
                <span className="text-neutral-400 text-center">
                  {brand.name}
                </span>
              </li>
            </ol>
          </nav>

          <div className="mb-10">
            <h1 className="mt-2 text-3xl font-semibold text-center tracking-tight text-emerald-800 sm:text-4xl">
              {brand.name}
            </h1>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
              <p className="text-sm text-neutral-500">
                No products found for this brand yet.
              </p>
            </div>
          ) : (
            <ProductGrid
              products={products.map((product) => ({
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
              columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
