"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/content";

export default function Products() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-8xl mx-auto px-5 md:px-40">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 mb-12 flex-wrap">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[13px] font-medium text-primary w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              Products
            </div>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center border border-black/25 text-neutral-900 px-6 py-3 rounded-full text-[15px] font-medium hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            View All Products
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {products.map((product, i) => {
            const isActive = activeIndex === i;

            return (
              <div
                key={i}
                onClick={() => setActiveIndex((current) => (current === i ? null : i))}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#F7F7F7] transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <Link
                  href={product.href}
                  onClick={(e) => e.stopPropagation()}
                  className="relative h-[500px] overflow-hidden block"
                >
                  <Image
                    src="/bags.png"
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-1000 ease-out group-hover:rotate-6"
                  />
                </Link>

                {/* Info */}
                <div className="relative bg-[#f3f3f1] overflow-hidden">
                  {/* Hover / tap overlay */}
                  <div
                    className={[
                      "absolute inset-0 bg-[#1FC16B] transition-transform duration-1000 ease-in-out",
                      isActive ? "translate-y-0" : "translate-y-full",
                      "md:group-hover:translate-y-0",
                    ].join(" ")}
                  />

                  <div className="relative z-10 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={product.href} onClick={(e) => e.stopPropagation()}>
                        <h3
                          className={[
                            "text-[22px] md:text-[40px] font-normal transition-colors duration-1000",
                            isActive ? "text-white" : "text-neutral-900",
                            "md:group-hover:text-white",
                          ].join(" ")}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      <span
                        className={[
                          "text-[20px] md:text-3xl font-normal transition-colors duration-1000",
                          isActive ? "text-white" : "text-neutral-900",
                          "md:group-hover:text-white",
                        ].join(" ")}
                      >
                        {product.price}
                      </span>
                    </div>

                    <button
                      className={[
                        "w-fit border mt-2 rounded-full px-5 py-3 text-[14px] md:text-[20px] font-medium transition-all duration-1000",
                        isActive
                          ? "border-white bg-white text-black"
                          : "border-neutral-900 text-neutral-900",
                        "md:group-hover:border-white md:group-hover:bg-white md:group-hover:text-black",
                      ].join(" ")}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}