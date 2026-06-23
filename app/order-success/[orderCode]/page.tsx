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
    desc: "Your payment has been received, check your mail for your receipt",
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

    try {
      for (const key of Object.keys(window.localStorage)) {
        if (key.toLowerCase().includes("cart")) {
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [clearCart]);

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden bg-emerald-950 pb-14 pt-28 md:pb-28 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
          aria-hidden
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-emerald-400" />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span className="select-none text-[24vw] font-black uppercase leading-none tracking-tighter text-emerald-900/20 md:text-[22vw]">
            CHEERS
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
          <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            Payment Confirmed
          </h1>
        </div>
      </section>

      <main className="min-h-screen bg-neutral-50 px-4 pb-16 pt-4 md:pt-10">
        <div className="mx-auto max-w-2xl">
          <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-relaxed text-neutral-500 md:text-base lg:text-[20px]">
            Thank you for choosing Mercy Agricultural Services. We will be in
            contact with you shortly to arrange the next steps.
          </p>

          <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
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

            <div className="relative border-t border-dashed border-neutral-200">
              <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-neutral-50" />
              <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-neutral-50" />
            </div>

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
                      <p className="text-sm font-medium text-neutral-900">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-medium text-white transition hover:bg-emerald-800 sm:w-auto"
            >
              Continue shopping
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-neutral-700 transition hover:underline sm:w-auto"
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