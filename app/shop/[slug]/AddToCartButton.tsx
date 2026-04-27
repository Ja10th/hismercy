"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/app/components/cart/CartProvider";

export default function AddToCartButton({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    inStock: boolean;
  };
}) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    addToCart(product, qty);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-3">
        <div className="flex items-center rounded-full border border-neutral-200 bg-[#F7F7F7]">
          <button
            type="button"
            onClick={() => setQty((current) => Math.max(1, current - 1))}
            className="flex h-12 w-12 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="min-w-12 px-2 text-center text-sm font-medium text-neutral-950">
            {qty}
          </span>

          <button
            type="button"
            onClick={() => setQty((current) => current + 1)}
            className="flex h-12 w-12 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          disabled={!product.inStock}
          onClick={handleAdd}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}