"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Package, Tag } from "lucide-react";
import { useCart } from "./cart/CartProvider";

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

type ProductGridProps = {
  products: ShopProduct[];
  columnsClassName?: string;
};

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export default function ProductGrid({
  products,
  columnsClassName = "grid-cols-1 sm:grid-cols-3",
}: ProductGridProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <div className={`grid gap-5 ${columnsClassName}`}>
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
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#F7F7F7] transition-all duration-300 hover:-translate-y-1  active:scale-[0.99] "
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f7f7]">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04] group-hover:rotate-12"
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
              <div
                className={[
                  "absolute inset-0 bg-[#1FC16B] transition-transform duration-700 ease-out",
                  "translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 group-active:translate-y-0",
                ].join(" ")}
              />

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
                    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 group-hover:text-white/85 group-focus-within:text-white/85 group-active:text-white/85">
                      <Package className="h-4 w-4" />
                      {product.inStock
                        ? `In stock${product.stockCount > 0 ? ` (${product.stockCount})` : ""}`
                        : "Out of stock"}
                    </span>

                    <span className="inline-flex items-center gap-2 text-sm text-neutral-500 group-hover:text-white/80 group-focus-within:text-white/80 group-active:text-white/80">
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
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-900 px-4 py-2.5 text-[13px] font-medium text-neutral-900 transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black group-hover:border-white group-hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 md:text-[14px]"
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
  );
}