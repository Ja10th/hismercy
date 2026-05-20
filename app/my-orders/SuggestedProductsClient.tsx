"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../components/cart/CartProvider";

type SuggestedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: string;
  image: string;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default function SuggestedProductsClient({
  products,
}: {
  products: SuggestedProduct[];
}) {
  const cart = useCart() as any;

  const addToCart = (product: SuggestedProduct) => {
    if (typeof cart?.addToCart === "function") {
      cart.addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="overflow-hidden rounded-[24px] border border-neutral-200 bg-neutral-50"
        >
          <div className="relative aspect-[4/3] bg-white">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          </div>

          <div className="p-4">
            <p className="text-xs text-neutral-500">{product.brand}</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-neutral-950">
              {product.name}
            </h3>
            <p className="mt-2 text-sm text-neutral-700">
              {formatNaira(product.price)}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/shop/${product.slug}`}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                View
              </Link>

              <button
                type="button"
                onClick={() => addToCart(product)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}