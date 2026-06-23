"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ChevronDown,
  ArrowUpRight,
  Sprout,
  Package,
  HelpCircle,
  Users,
  FlaskConical,
  Wheat,
} from "lucide-react";
import ConsultationAreasCarousel from "../components/ConsultationAreasCarousel";
import CTA from "../components/CTA";
import Blog from "../components/Blog";

const WHATSAPP_NUMBER = "2348000000000";

const steps = [
  {
    title: "Send your request",
    detail: "Reach us via call, WhatsApp, or the form on our contact page.",
  },
  {
    title: "Describe the issue",
    detail:
      "Tell us the farm problem, feed question, or product support you need.",
  },
  {
    title: "We respond directly",
    detail: "Our team gives you clear, practical guidance — not a brochure.",
  },
  {
    title: "Move forward",
    detail: "We help you find the right product or next step with confidence.",
  },
];

const personas = [
  {
    Icon: Sprout,
    title: "Crop farmers",
    desc: "Choosing the right fertiliser type, quantity, and application timing.",
  },
  {
    Icon: Package,
    title: "Feed buyers",
    desc: "Finding the right feed brand or raw materials for your flock or herd.",
  },
  {
    Icon: Users,
    title: "Livestock owners",
    desc: "Feed formulation, supplement choices, and supply planning.",
  },
  {
    Icon: Wheat,
    title: "Bulk purchasers",
    desc: "Working out quantities, delivery logistics, and pricing for large orders.",
  },
  {
    Icon: FlaskConical,
    title: "New farmers",
    desc: "Understanding what to buy, when to buy it, and how much you need.",
  },
  {
    Icon: HelpCircle,
    title: "Anyone stuck",
    desc: "If you have a farm-related question and need a straight answer, ask us.",
  },
];

const faqs = [
  {
    q: "Who is consultation for?",
    a: "Farmers, feed buyers, livestock owners, and anyone who needs help with agricultural products or farm-related problems. You do not need to be an existing customer.",
  },
  {
    q: "What kind of problems can I ask about?",
    a: "Feed choice, supply needs, farm planning, livestock support, and general agricultural guidance. If it relates to the land, livestock, or inputs, we can help.",
  },
  {
    q: "Can I also place an order after consultation?",
    a: "Yes. Consultation helps you choose the right products before you buy. Many customers start with a question and complete an order once they have clarity.",
  },
  {
    q: "Do I need to be a regular customer first?",
    a: "No. Anyone who needs help with farm support, feed guidance, or product choice can reach out — no account required.",
  },
  {
    q: "Can I ask about specific feed brands?",
    a: "Yes. You can ask for help choosing the right feed brand or materials for your farm. We will give you an honest assessment based on your situation.",
  },
  {
    q: "Will I get a direct answer or a general reply?",
    a: "We aim to give practical, direct guidance based on what you share. Not a brochure, not a redirect to another page — a real answer.",
  },
];

export default function ConsultationPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-emerald-950 pb-14 md:pb-28 pt-28 md:pt-36">
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
            <span className="select-none text-[24vw] md:text-[22vw]  font-black uppercase leading-none tracking-tighter text-emerald-900/20 ">
              HELP
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
            <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              Speak with Experts
            </h1>

            
          </div>
        </section>

        <section id="how-it-works" className="bg-neutral-50 pt-10">
          <div className="mx-auto max-w-7xl px-8">
            <div className="mb-14 text-center">
             <p className="mx-auto mt-6 max-w-xl text-[16px] lg:text-[20px] md:text-base  leading-relaxed text-black/55 ">
              Not sure what feed to buy, what material to use, or how to handle
              a farm issue? Speak with us first.
            </p>
            </div>

            <div className="relative mx-auto max-w-4xl">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-emerald-200 md:left-1/2 md:-ml-px" />

              <div className="space-y-2">
                {steps.map((step, i) => {
                  const left = i % 2 === 0;
                  return (
                    <div
                      key={step.title}
                      className={`relative grid items-start gap-6 md:grid-cols-2 ${
                        left ? "" : "md:[&>*:first-child]:order-2"
                      }`}
                    >
                      <div className="relative pl-12 md:pl-0">
                        <div
                          className={`absolute left-2 top-1 h-4 w-4 rounded-full md:hidden  bg-emerald-600 md:left-1/2 md:-ml-4 ${
                            left ? "md:-translate-x-1/2" : "md:-translate-x-1/2"
                          }`}
                        />
                        <div className="rounded-3xl border border-neutral-200 bg-white p-7 ">
                          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            0{i + 1}
                          </div>
                          <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                            {step.title}
                          </h3>
                          <p className="mt-3 text-[16px] md:text-base lg:text-[20px] leading-8 text-neutral-600">
                            {step.detail}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:block" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="py-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              Start a Consultation
              <ArrowUpRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </section>

        {/* ── Consultation areas ────────────────────────────────── */}
        <ConsultationAreasCarousel />

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="border-t border-neutral-100 bg-neutral-50  py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-[280px_1fr] md:gap-20">
              {/* Sticky left */}
              <div className="md:sticky md:top-28 md:self-start">
                <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 leading-[1.25]">
                  Things farmers usually ask.
                </h2>
                <p className="mt-4 text-[16px] lg:text-[20px] md:text-base leading-relaxed text-neutral-500">
                  Still have a specific question? We respond quickly.
                </p>
                <Link
                  href="/contact-us"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Ask us directly <ArrowUpRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Accordion */}
              <div className="overflow-hidden rounded-3xl  divide-y divide-neutral-100">
                {faqs.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={item.q}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-6 px-10 py-5 text-left transition hover:bg-neutral-50"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`text-[16px] lg:text-[20px] md:text-base font-semibold leading-snug transition-colors ${
                            isOpen ? "text-emerald-800" : "text-neutral-950"
                          }`}
                        >
                          {item.q}
                        </span>
                        <ChevronDown
                          size={18}
                          strokeWidth={2}
                          className={`shrink-0 transition-all duration-200 ${
                            isOpen
                              ? "rotate-180 text-emerald-500"
                              : "text-neutral-400"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-neutral-100 bg-emerald-50/40 px-10 pb-5 pt-4">
                          <p className="text-[16px] lg:text-[20px] md:text-base leading-[1.85] text-neutral-600">
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
