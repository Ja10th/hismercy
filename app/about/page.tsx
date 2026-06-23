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

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-emerald-950 pb-14 md:pb-28 pt-28 md:pt-36">
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
            <span className="select-none text-[24vw] md:text-[22vw] font-black uppercase leading-none tracking-tighter text-emerald-900/20">
              ABOUT
            </span>
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
            <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              Who We Are
            </h1>
          </div>
        </section>

        {/* ── Story — editorial two-column ─────────────────────── */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_2px_1fr] md:gap-0">

              {/* Left — pull quote */}
              <div className="flex flex-col justify-center pb-10 pr-0 md:pb-0 md:pr-14">
                <span
                  className="mb-4 block font-serif text-[7rem] leading-none text-emerald-200 select-none"
                  aria-hidden
                >
                  "
                </span>
                <blockquote className="text-[clamp(1.35rem,2.4vw,1.9rem)] font-bold leading-[1.25] tracking-tight text-emerald-950">
                  Reliability is rare in this business. That's exactly why we built ours around it.
                </blockquote>
                <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-emerald-500">
                  Mercy Agric — Ado-Ekiti
                </p>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-emerald-100 self-stretch" />

              {/* Right — body */}
              <div className="flex flex-col justify-center gap-5 pl-0 md:pl-14 text-[16px] lg:text-[17px] leading-8 text-neutral-500">
                <p>
                  Mercy Agric started with a simple observation: farmers in Ekiti were burning time and money chasing the right inputs — feeds, fertilizers, consultations — from suppliers who couldn't be counted on.
                </p>
                <p>
                  We built relationships with the right suppliers, standardised our packaging, and started delivering directly to farms. Word spread. Farmers who ordered once kept coming back, and they told others.
                </p>
                <p>
                  Today we reach all 36 states. The scale has grown but the work hasn't changed: source well, price fairly, deliver on the promise.
                </p>
                <p>
                  This platform is the latest version of that same promise — order, pay, and arrange delivery without leaving your seat.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-14 flex flex-wrap items-center gap-4 md:pl-[calc(33.333%+1px+3.5rem)]">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                Shop now
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </Link>
              <a
                href="/contact-us"
                className="text-sm font-semibold text-black/45 underline underline-offset-4 decoration-black/20 transition hover:text-black/80 hover:decoration-black/50"
              >
                Get in touch
              </a>
            </div>
          </div>
        </section>

        {/* ── Stats — full-bleed image with overlaid stat row ─── */}
        <section className="relative overflow-hidden">

          {/* Background image — full section */}
          <div className="relative h-[560px] md:h-[680px] w-full">
            <Image
              src="/footerbg.jpeg"
              alt="Agricultural fields"
              fill
              className="object-cover"
            />
            {/* Strong dark gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-emerald-950/30" />
          </div>

          {/* Stat row — pinned to bottom of section */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto max-w-6xl px-6 pb-10 md:pb-14">

              {/* Eyebrow */}
              <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                By the numbers
              </p>

              {/* Three stats in a row, divided by vertical rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-emerald-700/40">

                <div className="pb-8 sm:pb-0 sm:pr-10">
                  <p className="text-[clamp(4rem,9vw,6.5rem)] font-black leading-none tracking-tighter text-white">
                    2,000+
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-emerald-300/80">
                    Orders fulfilled across Nigeria
                  </p>
                </div>

                <div className="py-8 sm:py-0 sm:px-10">
                  <p className="text-[clamp(4rem,9vw,6.5rem)] font-black leading-none tracking-tighter text-white">
                    36
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-emerald-300/80">
                    States we deliver to
                  </p>
                </div>

                <div className="pt-8 sm:pt-0 sm:pl-10">
                  <p className="text-[clamp(4rem,9vw,6.5rem)] font-black leading-none tracking-tighter text-white">
                    20+
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-emerald-300/80">
                    Years in business
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Map + contact ─────────────────────────────────────── */}
        <section>
          {/* Map — full bleed, no overlays */}
          <div className="h-[480px] w-full md:h-[560px]">
            <iframe
              title="Mercy Agric location — Ado-Ekiti, Ekiti State"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.6!2d5.2524!3d7.6264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103728c7b4b3d5%3A0x94736a20c3a2a37b!2sAdo-Ekiti%2C%20Ekiti%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
              className="h-full w-full border-0 grayscale"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Contact info — clean row below map on white */}
          <div className="border-t border-neutral-100 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                    Head office
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    Km 8 Ado-Ikere Road, Opposite Fabotas School of Health, Ado-Ekiti
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                    Branch office
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    Beside T-Five Petroleum Station, Ajilosun Street off Ikere Road, Ado-Ekiti
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                    Call us
                  </p>
                  <div className="flex flex-col gap-2">
                    {["08062304427", "07066468811", "09067587850"].map((num) => (
                      <a
                        key={num}
                        href={`tel:${num}`}
                        className="flex items-center gap-2 text-sm text-neutral-500 transition hover:text-emerald-700"
                      >
                        <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {num}
                      </a>
                    ))}
                  </div>
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