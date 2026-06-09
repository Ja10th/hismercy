"use client";

import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { use, useEffect } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import { CheckCircle2, Package, Phone, Truck } from "lucide-react";

type OrderSuccessPageProps = {
  params: Promise<{ orderCode: string }>;
};

const steps = [
  {
    Icon: CheckCircle2,
    title: "Order confirmed",
    desc: "Your payment has been received and your order is in our system.",
  },
  {
    Icon: Package,
    title: "We prepare your bags",
    desc: "Our team will package your order and have it ready for dispatch.",
  },
  {
    Icon: Phone,
    title: "We reach out to you",
    desc: "A team member will contact you to confirm delivery details.",
  },
  {
    Icon: Truck,
    title: "Delivery or pickup",
    desc: "Your order arrives at your door or is ready for you to collect.",
  },
];

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { clearCart } = useCart();
  const resolvedParams = use(params);

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 px-4 pt-32 md:pt-40 pb-16">
        <div className="mx-auto max-w-2xl">

          {/* Status mark */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 shadow-[0_0_0_8px_#d1fae5]">
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={1.5} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Payment confirmed
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Your order is placed.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
              Thank you for choosing Mercy Agric. We will be in contact with you shortly to arrange the next steps.
            </p>
          </div>

          {/* Receipt card */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                Order reference
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <p className="font-mono text-2xl font-semibold tracking-wider text-neutral-950">
                {resolvedParams.orderCode}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Paid
              </span>
            </div>

            {/* Dashed divider (receipt tear) */}
            <div className="relative border-t border-dashed border-neutral-200">
              <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-neutral-50" />
              <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-neutral-50" />
            </div>

            {/* What happens next */}
            <div className="px-6 pb-6 pt-5">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                What happens next
              </p>
              <ol className="mt-4 space-y-4">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-500">
                      {i + 1}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-neutral-900">{step.title}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-medium text-white transition hover:bg-emerald-800 sm:w-auto"
            >
              Continue shopping
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex h-11 w-full items-center justify-center rounded-full  bg-white px-6 text-sm font-medium text-neutral-700 transition hover:underline sm:w-auto"
            >
              Contact support
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-neutral-400">
            Keep your order code safe. You may need it when contacting support.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}