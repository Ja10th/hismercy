import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Leaf, ShieldCheck, Truck, Users } from "lucide-react";

const values = [
  {
    Icon: Leaf,
    title: "Quality first",
    desc: "Every product we stock is sourced with care. We only supply inputs we would use on our own farms.",
  },
  {
    Icon: Users,
    title: "Farmers at the centre",
    desc: "Our business exists to serve the people growing food. Every decision we make asks: does this make a farmer's life easier?",
  },
  {
    Icon: Truck,
    title: "Reliable delivery",
    desc: "We deliver across Ekiti and beyond. When we commit to a delivery, we follow through.",
  },
  {
    Icon: ShieldCheck,
    title: "Honest pricing",
    desc: "No hidden charges. The price you see at checkout is the price you pay. Delivery fees are shown before you confirm.",
  },
];

const stats = [
  { value: "2,000+", label: "Orders fulfilled" },
  { value: "36", label: "States served" },
  { value: "5+", label: "Years in business" },
  { value: "100%", label: "Paystack secured" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-neutral-100 bg-neutral-950 px-6 py-24 text-white">
          <div className="absolute inset-0">
            <Image
              src="/footerbg.jpeg"
              alt=""
              fill
              className="object-cover opacity-10"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 to-neutral-950/80" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Our story
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Feeding Ekiti, supplying Nigeria.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
              Mercy Agricultural Services was built on one conviction — that Nigerian farmers deserve access to quality agricultural inputs, delivered reliably, at honest prices.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center rounded-full bg-emerald-600 px-6 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Shop now
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex h-11 items-center rounded-full border border-white/20 px-6 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-neutral-100">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-neutral-100 sm:grid-cols-4 sm:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="px-8 py-10 text-center">
                <p className="text-3xl font-bold tracking-tight text-neutral-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-6 text-base leading-8 text-neutral-600">
              <p>
                Mercy Agric started in Ado-Ekiti with a simple observation: farmers in the region were spending too much time and money sourcing the inputs they needed — fertilisers, feeds, and other essentials — from scattered, unreliable suppliers. Getting the right product in the right quantity at the right time was harder than it should have been.
              </p>
              <p>
                We set out to change that. Starting as a small local operation, we built relationships with trusted suppliers, standardised our packaging, and began delivering directly to farms and businesses across Ekiti State. Word spread because reliability is rare and valuable. Farmers who ordered once kept coming back, and they told others.
              </p>
              <p>
                Today we serve customers across all 36 states. The quantities we move are larger, but the business remains the same at its core: source well, price fairly, deliver on what we promise.
              </p>
              <p>
                This platform — the website you are on now — was built to make ordering even easier. You can browse our products, place an order, pay securely, and arrange delivery without leaving your seat. We take care of the rest.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-neutral-100 bg-neutral-50 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                How we work
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
                What we stand for
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                    <Icon className="h-5 w-5 text-emerald-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-neutral-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:flex">
              <div className="flex-1 p-8 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Where to find us
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
                  Based in the heart of Ekiti
                </h2>
                <p className="mt-4 text-sm leading-7 text-neutral-600">
                  Our operations are headquartered in Ado-Ekiti, Ekiti State. We dispatch orders from here and coordinate deliveries across the state and to all other regions of Nigeria.
                </p>
                <div className="mt-6 space-y-3 text-sm text-neutral-600">
                  <p>
                    <span className="font-medium text-neutral-900">Address:</span>{" "}
                    Ado-Ekiti, Ekiti State, Nigeria
                  </p>
                  <p>
                    <span className="font-medium text-neutral-900">Dispatch hours:</span>{" "}
                    Monday – Saturday, 8 am – 5 pm
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href="/contact-us"
                    className="inline-flex h-10 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Contact us
                  </Link>
                </div>
              </div>

              {/* Map placeholder — replace with actual map embed if available */}
              <div className="relative h-60 bg-emerald-950 lg:h-auto lg:w-80">
                <div className="absolute inset-0">
                  <Image
                    src="/footerbg.jpeg"
                    alt="Ekiti landscape"
                    fill
                    className="object-cover opacity-30"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Ado-Ekiti
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Ekiti State, Nigeria
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-100 bg-emerald-700 px-6 py-16 text-center text-white">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to place an order?
          </h2>
          <p className="mt-3 text-sm text-emerald-100">
            Browse our products and have your agricultural inputs delivered to your door.
          </p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              Browse the shop
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}