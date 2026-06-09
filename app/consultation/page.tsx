"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import ConsultationAreasCarousel from "../components/ConsultationAreasCarousel";
import CTA from "../components/CTA";
import Blog from "../components/Blog";

const steps = [
  {
    number: "01",
    title: "Send your request",
    detail: "Reach us via call, WhatsApp, or the form below.",
  },
  {
    number: "02",
    title: "Describe the issue",
    detail: "Tell us the farm problem, feed question, or support needed.",
  },
  {
    number: "03",
    title: "We review and respond",
    detail: "Our team gives you clear, practical guidance.",
  },
  {
    number: "04",
    title: "Move forward",
    detail: "We help you find the right product or next step.",
  },
];

const faqs = [
  {
    q: "Who is consultation for?",
    a: "Farmers, feed buyers, livestock owners, and anyone who needs help with agricultural products or farm-related problems.",
  },
  {
    q: "What kind of problems can I ask about?",
    a: "Feed choice, supply needs, farm planning, livestock support, and general agricultural guidance.",
  },
  {
    q: "Can I also place an order after consultation?",
    a: "Yes. Consultation can help you choose the right products before you buy.",
  },
  {
    q: "Do I need to be a regular customer first?",
    a: "No. Anyone who needs help with farm support, feed guidance, or product choice can reach out.",
  },
  {
    q: "Can I ask about poultry and livestock feed brands?",
    a: "Yes. You can ask for help choosing the right feed brand or materials for your farm needs.",
  },
  {
    q: "Will I get a direct answer or a general reply?",
    a: "We aim to give practical, direct guidance based on the issue you share, so you can take the next step with clarity.",
  },
];

export default function ConsultationPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Navbar />

      <main className="bg-[#F2F0EB] text-[#1a1a14]">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative bg-[#15160f] overflow-hidden pt-36 pb-28">
          {/* Decorative field lines */}
          <div
            className="absolute inset-0 flex flex-col justify-end gap-6 opacity-[0.06] pointer-events-none"
            aria-hidden
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-px bg-[#c9a84c] w-full" />
            ))}
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10">
            <h1 className="text-[38px] md:text-5xl lg:text-[70px] text-center font-extrabold leading-[1.05] tracking-tight text-white mb-7">
              Advice grounded in <br />
              <em className="text-emerald-500 ">real</em> farming.
            </h1>

            <p className="text-base md:text-lg text-center leading-relaxed mx-auto text-white/60 max-w-xl mb-10">
              Not sure what feed to buy, what material to use, or how to handle
              a farm issue? Speak with us first, we give you a direct answer,
              not a brochure.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-7">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold px-6 py-3.5 rounded-full transition-colors"
              >
                Start a consultation{" "}
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-semibold text-white/55 hover:text-white border-b border-white/20 hover:border-white/60 pb-0.5 transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section
          id="how-it-works"
          className="border-y border-black/[0.08] py-24"
        >
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex items-center gap-3 mb-3"></div>
            <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-[1.25] text-left md:text-center  ">
              Four steps to clarity
            </h2>

            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.08] ">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="py-8 lg:py-0 lg:px-8 first:pl-0 last:pr-0"
                >
                  <span className="block text-[11px] font-bold tracking-[0.12em] text-[#c9a84c] mb-5">
                    {step.number}
                  </span>
                  <h3 className="text-[15px] font-bold text-[#1a1a14] mb-2.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[13.5px] leading-[1.75] text-[#7a7a66]">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Consultation areas ────────────────────────────── */}
        <ConsultationAreasCarousel />

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="border-t border-black/[0.08] py-24 md:py-28">
          <div className="max-w-6xl md:max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-16 md:gap-20 items-start">
              {/* Left sticky panel */}
              <div className="md:sticky md:top-28">
                <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-[1.25]  max-w-[260px]">
                  Things farmers usually ask us
                </h2>
                <p className="mt-4 text-sm leading-[1.8] text-[#7a7a66] max-w-[240px]">
                  Still have a specific question? Reach out directly — we
                  respond quickly.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 mt-6 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold px-6 py-3.5 rounded-full transition-colors"
                >
                  Ask us directly <ArrowUpRight size={15} strokeWidth={2.5} />
                </Link>
              </div>

              {/* FAQ list */}
              <div className="border-t border-black/[0.08]">
                {faqs.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={item.q} className="border-b border-black/[0.08]">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left bg-transparent border-none cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`text-[15px] font-semibold leading-snug transition-colors ${
                            isOpen ? "text-[#1e4030]" : "text-[#1a1a14]"
                          }`}
                        >
                          {item.q}
                        </span>
                        <ChevronDown
                          size={18}
                          strokeWidth={2}
                          className={`shrink-0 transition-transform duration-200 ${
                            isOpen
                              ? "rotate-180 text-[#c9a84c]"
                              : "text-[#7a7a66]"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="pb-5">
                          <p className="text-sm leading-[1.85] text-[#7a7a66]">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <Blog />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
