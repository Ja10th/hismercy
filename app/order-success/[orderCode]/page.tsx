"use client";

import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { useEffect, use } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import { GiCheckMark } from "react-icons/gi";

type OrderSuccessPageProps = {
  params: Promise<{
    orderCode: string;
  }>;
};

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { clearCart } = useCart();
  const resolvedParams = use(params);

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white text-center">
          <GiCheckMark className="mx-auto h-24 w-24 rounded-full bg-emerald-500 p-6 text-white" />

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-700">
            Your payment was successful
          </h1>

          <p className="pt-2 text-gray-500">
            Thank you for your payment, we will be in contact with you shortly.
          </p>

          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Order code:{" "}
            <span className="font-medium text-neutral-950">
              {resolvedParams.orderCode}
            </span>
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}