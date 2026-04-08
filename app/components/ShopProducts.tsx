"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Tag, ShoppingBag } from "lucide-react";

type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
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

type ShopProductsProps = {
  products: ShopProduct[];
};

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export default function ShopProducts({ products }: ShopProductsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {products.map((product, i) => {
        const isActive = activeIndex === i;
        const imageUrl = product.images[0]?.url || "/bags.png";
        const priceLabel = formatNaira(product.price);

        return (
          <article
            key={product.id}
            onClick={() =>
              setActiveIndex((current) => (current === i ? null : i))
            }
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#F7F7F7] transition-all duration-300 cursor-pointer"
          >
            <Link
              href={`/shop/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="relative block aspect-[4/5] overflow-hidden bg-[#F3F3F1]"
            >
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-1000 ease-out group-hover:scale-[1.03] group-hover:rotate-2"
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
            </Link>

            <div className="relative overflow-hidden bg-[#f3f3f1]">
              <div
                className={[
                  "absolute inset-0 bg-[#1FC16B] transition-transform duration-1000 ease-in-out",
                  isActive ? "translate-y-0" : "translate-y-full",
                  "md:group-hover:translate-y-0",
                ].join(" ")}
              />

              <div className="relative z-10 p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/shop/${product.slug}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3
                        className={[
                          "text-[22px] md:text-[34px] font-normal leading-tight transition-colors duration-1000",
                          isActive ? "text-white" : "text-neutral-900",
                          "md:group-hover:text-white",
                        ].join(" ")}
                      >
                        {product.name}
                      </h3>
                    </Link>

                    {product.description ? (
                      <p
                        className={[
                          "mt-2 line-clamp-2 text-sm leading-6 transition-colors duration-1000",
                          isActive ? "text-white/80" : "text-neutral-600",
                          "md:group-hover:text-white/80",
                        ].join(" ")}
                      >
                        {product.description}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={[
                      "shrink-0 text-[20px] md:text-2xl font-normal transition-colors duration-1000",
                      isActive ? "text-white" : "text-neutral-900",
                      "md:group-hover:text-white",
                    ].join(" ")}
                  >
                    {priceLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex justify-between items-center gap-2">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 text-sm transition-colors duration-1000",
                        isActive ? "text-white/85" : "text-neutral-600",
                        "md:group-hover:text-white/85",
                      ].join(" ")}
                    >
                      <Package className="h-4 w-4" />
                      {product.inStock
                        ? `In stock${product.stockCount > 0 ? ` (${product.stockCount})` : ""}`
                        : "Out of stock"}
                    </span>
                    <div
                      className={[
                        " flex items-center gap-2 text-sm transition-colors duration-1000",
                        isActive ? "text-white/85" : "text-neutral-500",
                        "md:group-hover:text-white/85",
                      ].join(" ")}
                    >
                      <Tag className="h-3.5 w-3.5 shrink-0" />
                      <span>{product.brand?.name || "No brand"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!product.inStock}
                    className={[
                      "inline-flex items-center gap-2 w-fit border rounded-full px-4 py-2.5 text-[13px] md:text-[14px] font-medium transition-all duration-1000",
                      isActive
                        ? "border-white bg-white text-black"
                        : "border-neutral-900 text-neutral-900",
                      "md:group-hover:border-white md:group-hover:bg-white md:group-hover:text-black",
                      "disabled:cursor-not-allowed disabled:opacity-30",
                    ].join(" ")}
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
