"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, Tag } from "lucide-react";
import { useCart } from "./cart/CartProvider";

type HomeProduct = {
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

type ProductsProps = {
  products: HomeProduct[];
};

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export default function Products({ products }: ProductsProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-8xl px-5 md:px-10 lg:px-16 xl:px-24">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[13px] font-medium text-primary">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
              Featured Products
            </div>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center rounded-full border border-black/25 px-6 py-3 text-[15px] font-medium text-neutral-900 transition-all duration-200 hover:bg-neutral-900 hover:text-white"
          >
            View All Products
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
            <p className="text-sm text-neutral-500">
              No featured products yet. Turn on “Show on homepage” in admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const imageUrl = product.images[0]?.url || "/bags.png";
              const priceLabel = formatNaira(product.price);

              return (
                <article
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/shop/${product.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/shop/${product.slug}`);
                    }
                  }}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#F7F7F7] transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f7f7]">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04] group-hover:rotate-6"
                    />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {product.featured ? (
                        <span className="rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-medium text-white">
                          Featured
                        </span>
                      ) : null}

                      {!product.inStock ? (
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-900">
                          Out of stock
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-[#f3f3f1]">
                    <div className="absolute inset-0 translate-y-full bg-[#1FC16B] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0 group-active:translate-y-0" />

                    <div className="relative z-10 flex flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[22px] font-normal leading-tight text-neutral-900 transition-colors duration-100 group-hover:text-white group-focus-within:text-white group-active:text-white md:text-[24px]">
                            {product.name}
                          </h3>
                        </div>

                        <span className="shrink-0 text-[20px] font-normal text-neutral-900 transition-colors duration-100 group-hover:text-white group-focus-within:text-white group-active:text-white md:text-2xl">
                          {priceLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-2">
                          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 transition-colors duration-100 group-hover:text-white/85 group-focus-within:text-white/85 group-active:text-white/85">
                            <Package className="h-4 w-4" />
                            {product.inStock
                              ? `In stock${product.stockCount > 0 ? ` (${product.stockCount})` : ""}`
                              : "Out of stock"}
                          </span>

                          <span className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors duration-100 group-hover:text-white/80 group-focus-within:text-white/80 group-active:text-white/80">
                            <Tag className="h-3.5 w-3.5 shrink-0" />
                            <span>{product.brand?.name || "No brand"}</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              image: imageUrl,
                              inStock: product.inStock,
                            });
                          }}
                          className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-900 px-4 py-2.5 text-[13px] font-medium text-neutral-900 transition-all duration-100 hover:scale-105 hover:text-black group-hover:border-white group-hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}