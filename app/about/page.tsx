import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Check, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Fresh by design",
    text: "We focus on products that feel useful, clean, and easy to live with.",
  },
  {
    icon: ShieldCheck,
    title: "Built on trust",
    text: "Clear pricing, clear updates, and support that does not keep you guessing.",
  },
  {
    icon: Truck,
    title: "Fast delivery flow",
    text: "Orders move from checkout to fulfillment with less stress for everyone.",
  },
];

const highlights = [
  "Carefully selected products",
  "Simple ordering experience",
  "Helpful customer support",
  "Reliable delivery process",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-24 text-neutral-950">
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600">
                <Sparkles className="h-4 w-4" />
                About us
              </p>

              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Simple shopping, done with care.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-neutral-600 sm:text-lg">
                We built this store to make buying easier, cleaner, and more
                reliable. From browsing to checkout to delivery, everything is
                designed to feel calm and straightforward.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Shop now
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  Contact us
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[32px] border border-neutral-200">
                <Image
                  src="/bags.png"
                  alt="About our store"
                  width={900}
                  height={1000}
                  className="h-[520px] w-full object-cover"
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-neutral-200 p-4 text-center">
                  <p className="text-2xl font-semibold">100%</p>
                  <p className="mt-1 text-sm text-neutral-600">Focus on quality</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4 text-center">
                  <p className="text-2xl font-semibold">Fast</p>
                  <p className="mt-1 text-sm text-neutral-600">Order processing</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4 text-center">
                  <p className="text-2xl font-semibold">Easy</p>
                  <p className="mt-1 text-sm text-neutral-600">Shop and pay</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                What we stand for
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                A clear brand with a simple promise.
              </h2>
              <p className="mt-4 text-base leading-8 text-neutral-600">
                We believe a store should feel easy to understand. No clutter,
                no noise, and no confusion. Just products, pricing, and service
                you can trust.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="rounded-3xl border border-neutral-200 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">{value.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{value.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Our approach
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Designed for people who value simplicity.
                </h2>
                <p className="mt-4 text-base leading-8 text-neutral-600">
                  We keep the experience light and practical. That means clear
                  product presentation, smooth checkout, and helpful updates
                  after the order is placed.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Easy browsing",
                  "Fast checkout",
                  "Reliable updates",
                  "Support when needed",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-[32px] border border-neutral-200 p-8 sm:p-10">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Get in touch
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Have a question or need help?
                </h2>
                <p className="mt-4 text-base leading-8 text-neutral-600">
                  Reach out any time. We will be glad to help with product
                  details, delivery, or anything else you need.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Contact support
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
