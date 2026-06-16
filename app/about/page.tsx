import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowUpRight, Phone } from "lucide-react";
import CTA from "../components/CTA";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-emerald-950 pb-28 pt-28 md:pt-36">
          {/* Horizontal field lines */}
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
            aria-hidden
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-px w-full bg-emerald-400" />
            ))}
          </div>

          {/* Large faint background word */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden
          >
            <span className="select-none text-[22vw] font-black uppercase leading-none tracking-tighter text-emerald-900/20 ">
              ABOUT
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
            <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              Feeding Ekiti, <br className="hidden sm:block" />
              supplying Nigeria.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base  leading-relaxed text-white/55 md:text-lg">
              Mercy Agricultural Services was built on one conviction that
              Nigerian farmers deserve access to quality agricultural feeds,
              delivered reliably, at honest prices.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-400"
              >
                Shop now
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </Link>
              <a
                href="/contact-us"
                className="text-sm font-semibold text-white/45 underline underline-offset-4 decoration-white/20 transition hover:text-white/80 hover:decoration-white/50"
              >
                Get in touch
              </a>
            </div>
          </div>
        </section>
        {/* Story */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-6 text-[16px] lg:text-[20px] leading-8 text-neutral-600">
              <p>
                Mercy Agric started in Ado-Ekiti with a simple observation:
                farmers in the region were spending too much time and money
                sourcing the inputs they needed: feeds, consultations,
                fertilizers and other essentials from scattered, unreliable
                suppliers. Getting the right product in the right quantity at
                the right time was harder than it should have been.
              </p>
              <p>
                We set out to change that. Starting as a small local operation,
                we built relationships with trusted suppliers, standardised our
                packaging, and began delivering directly to farms and businesses
                across Ekiti State and beyond. Word spread because reliability
                is rare and valuable. Farmers who ordered once kept coming back,
                and they told others.
              </p>
              <p>
                Today we serve customers across all 36 states. The quantities we
                move are larger, but the business remains the same at its core:
                source well, price fairly, deliver on what we promise.
              </p>
              <p>
                This platform was built to make ordering even easier. You can
                browse our products, place an order, pay securely, and arrange
                delivery without leaving your seat. We take care of the rest.
              </p>
            </div>
          </div>
        </section>

        {/* ── Metrics bento grid ───────────────────────────────── */}
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            {/* Section label */}
            <div className="mb-10 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-600 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Metrics
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-950 md:text-4xl lg:text-5xl">
                Trusted by farmers, <br className="hidden sm:block" />
                proven by results.
              </h2>
            </div>

            {/* Bento grid — 3 cols, 2 rows */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:grid-rows-2">
              {/* Row 1 — image | stat | image */}
              <div className="relative overflow-hidden rounded-3xl sm:row-span-1 aspect-[4/3]">
                <Image
                  src="/footerbg.jpeg"
                  alt="Agricultural fields"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-emerald-950/30" />
              </div>

              <div className="flex flex-col justify-between rounded-3xl bg-emerald-100 p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300">
                  <span className="text-emerald-700">↻</span>
                </div>
                <div>
                  <p className="text-5xl font-black tracking-tight text-emerald-950">
                    2,000+
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-800">
                    Orders fulfilled
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl aspect-[4/3]">
                <Image
                  src="/bags.png"
                  alt="Agricultural products"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-emerald-950/20" />
              </div>

              {/* Row 2 — stat | image | stat */}
              <div className="flex flex-col justify-between rounded-3xl bg-emerald-100 p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300">
                  <span className="text-emerald-700">◎</span>
                </div>
                <div>
                  <p className="text-5xl font-black tracking-tight text-emerald-950">
                    36
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-800">
                    States we deliver to
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl aspect-[4/3]">
                <Image
                  src="/footerbg.jpeg"
                  alt="Delivery across Nigeria"
                  fill
                  className="object-cover scale-x-[-1]"
                />
                <div className="absolute inset-0 bg-emerald-950/30" />
              </div>

              <div className="flex flex-col justify-between rounded-3xl bg-emerald-950 p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-700">
                  <span className="text-emerald-400">✦</span>
                </div>
                <div>
                  <p className="text-5xl font-black tracking-tight text-white">
                    5+
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-400">
                    Years in business
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Full-width map ────────────────────────────────────── */}
        <section className="relative">
          {/* Map — full bleed */}
          <div className="relative h-[520px] w-full md:h-[620px]">
            <iframe
              title="Mercy Agric location — Ado-Ekiti, Ekiti State"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.6!2d5.2524!3d7.6264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103728c7b4b3d5%3A0x94736a20c3a2a37b!2sAdo-Ekiti%2C%20Ekiti%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
              className="h-full w-full border-0 grayscale"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Subtle emerald tint */}
            <div className="pointer-events-none absolute inset-0 bg-emerald-950/10 mix-blend-multiply" />
          </div>

          {/* Floating info cards — sit on top of the map */}
          <div className="absolute bottom-6 left-1/2 w-full max-w-5xl -translate-x-1/2 px-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Head office */}
              <div className="rounded-2xl border border-white/20 bg-emerald-950/90 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Head office
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  Kilometer 8 Ado-Ikere Road, Opposite Fabotas School of Health,
                  Ado-Ekiti
                </p>
              </div>

              {/* Branch office */}
              <div className="rounded-2xl border border-white/20 bg-emerald-950/90 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Branch office
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  Beside T-Five Petroleum Station, Ajilosun Street off Ikere
                  Road, Ado-Ekiti
                </p>
              </div>

              {/* Phone */}
              <div className="rounded-2xl border border-white/20 bg-emerald-950/90 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Call us
                </p>
                <div className="mt-2 space-y-1">
                  {["08062304427", "07066468811", "09067587850"].map((num) => (
                    <a
                      key={num}
                      href={`tel:${num}`}
                      className="flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
                    >
                      <Phone className="h-3 w-3 text-emerald-400 shrink-0" />
                      {num}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </>
  );
}
