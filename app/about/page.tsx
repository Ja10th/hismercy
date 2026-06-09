import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowRight,
  Check,
  Leaf,
  MapPin,
  ShieldCheck,
  Sprout,
  Truck,
  Wheat,
} from "lucide-react";

const supplyBlocks = [
  {
    icon: Wheat,
    title: "Feedmill materials",
    text: "Maize, soya, wheat offal, and other raw materials used in feed production.",
  },
  {
    icon: Sprout,
    title: "Poultry and livestock feed",
    text: "Trusted feed products that support healthy growth and consistent farm performance.",
  },
  {
    icon: Truck,
    title: "Supply and delivery",
    text: "We help farmers, retailers, and buyers get the products they need with less stress.",
  },
];

const values = [
  "Dependable products",
  "Simple communication",
  "Practical farm support",
  "Trusted by customers in Ekiti",
];

const locations = [
  "Head Office: Kilometer 8 Ado-Ikere Road, opposite Fabotas School of Health, Ado-Ekiti",
  "Branch Office: Beside T-Five Petroleum Station, Ajilosun Street off Ikere Road, Ado-Ekiti",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#fafaf8] pt-24 text-neutral-950">
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="flex flex-col items-center justify-center gap-6 text-center md:px-16">
              <p className="text-xs text-center md:text-sm uppercase tracking-[0.2em] text-emerald-600">
                About
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Supplying the best feed, farm materials, and support for you
              </h1>

              <p className="max-w-3xl text-[16px] leading-[1.9] text-neutral-600 md:text-lg">
                We focus on the products and support that matter most to
                livestock and poultry businesses. From feedmill materials to
                branded feed and practical service, we help customers choose
                better and work smarter.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full border border-emerald-700 bg-emerald-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 hover:border-emerald-800"
                >
                  Browse Products
                </Link>

                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-full border border-primary/20 bg-white px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary/5"
                >
                  Book Consultation
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white">
                <div className="relative h-[480px]">
                  <Image
                    src="/bags.png"
                    alt="Mercy Agricultural Services Services"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="border-t border-neutral-200 p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200 bg-[#f1fbf4] p-4">
                      <p className="text-sm font-medium text-primary">Feed</p>
                      <p className="mt-2 text-sm leading-7 text-neutral-600">
                        Materials and branded feed supply.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                      <p className="text-sm font-medium text-neutral-950">
                        Support
                      </p>
                      <p className="mt-2 text-sm leading-7 text-neutral-600">
                        Clear service for farmers and buyers.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-[#fff8e8] p-4">
                      <p className="text-sm font-medium text-neutral-950">
                        Ekiti
                      </p>
                      <p className="mt-2 text-sm leading-7 text-neutral-600">
                        Local access and trusted presence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="rounded-[2rem] border border-neutral-200 bg-white p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[11px] font-medium text-primary">
                    <Leaf className="h-4 w-4" />
                    What we do
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
                    Practical agricultural supply for real farm needs.
                  </h2>

                  <p className="mt-4 text-[16px] leading-[1.9] text-neutral-600">
                    Mercy Agricultural Services Services provides feedmill materials, poultry
                    and livestock feed, farm products, and useful support for
                    customers who want dependable supply without confusion.
                  </p>

                  <p className="mt-4 text-[16px] leading-[1.9] text-neutral-600">
                    Our goal is simple. Help farmers and retailers get the right
                    products, at the right time, with a service process that is
                    easy to trust.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "Clear service",
                      text: "Simple ordering and communication.",
                    },
                    {
                      title: "Trusted brands",
                      text: "Reliable feed and supply products.",
                    },
                    {
                      title: "Fast support",
                      text: "Helpful guidance when you need it.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.75rem] border border-neutral-200 bg-white p-5"
                    >
                      <p className="text-sm font-semibold text-neutral-950">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-neutral-600">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 py-20">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  What we supply
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Feedmill materials, livestock feed, and practical farm
                  support.
                </h2>
                <p className="mt-4 text-[16px] leading-[1.9] text-neutral-600">
                  We keep the focus on products and services that support
                  livestock farmers, poultry operators, and agricultural
                  retailers.
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex w-fit items-center rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Shop products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {supplyBlocks.map((block, index) => {
                const Icon = block.icon;
                const tone =
                  index === 0
                    ? "bg-[#f1fbf4]"
                    : index === 1
                      ? "bg-[#eef5ff]"
                      : "bg-[#fff8e8]";

                return (
                  <div
                    key={block.title}
                    className="rounded-[2rem] border border-neutral-200 bg-white p-6"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
                    >
                      <Icon className="h-5 w-5 text-neutral-950" />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold">
                      {block.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-8 text-neutral-600">
                      {block.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 py-20">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div className="rounded-[2rem] border border-neutral-200 bg-white p-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Our locations
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Easy to reach, easy to work with.
                </h2>
                <p className="mt-4 text-[16px] leading-[1.9] text-neutral-600">
                  We serve customers from our offices in Ado-Ekiti and keep the
                  business close to the farmers and buyers who rely on us.
                </p>

                <div className="mt-6 space-y-3">
                  {locations.map((item, index) => (
                    <div
                      key={item}
                      className={`flex items-start gap-3 rounded-[1.5rem] border p-4 ${
                        index === 0
                          ? "border-[#d8e9df] bg-[#f1fbf4]"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-sm leading-7 text-neutral-700">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {values.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-[1.75rem] border p-5 ${
                      index === 0
                        ? "border-[#d8e9df] bg-[#f1fbf4]"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700">
                        {item}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="sm:col-span-2 rounded-[2rem] border border-neutral-200 bg-primary px-6 py-6 text-white">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
                    Why customers choose us
                  </p>
                  <p className="mt-3 text-2xl font-semibold leading-tight">
                    Trusted supply, practical support, and a simple process from
                    enquiry to delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 py-20">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 md:p-10">
              <div className="max-w-2xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Need help?
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Talk to us about your agricultural needs.
                </h2>
                <p className="mt-4 text-[16px] leading-[1.9] text-neutral-600">
                  Whether you need products, consultation, or help choosing the
                  right feed or farm supply, our team is ready to assist.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Book consultation
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center rounded-full border border-primary/20 bg-white px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary/5"
                >
                  Contact us
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
