"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowRight,
  ChevronDown,
  Check,
  ClipboardList,
  Headphones,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Truck,
  Wheat,
} from "lucide-react";
import ConsultationAreasCarousel from "../components/ConsultationAreasCarousel";
import CTA from "../components/CTA";
import Blog from "../components/Blog";

const steps = [
  "Send your request",
  "Tell us the farm issue or support needed",
  "We review and respond with guidance",
  "We help you move forward with the right product or solution",
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

      <main className="bg-[#fafaf8] pt-24 text-neutral-950">
        <section className="pt-10 pb-2">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="">
              <div className="flex flex-col gap-6">
                <p className="text-xs text-center md:text-sm uppercase tracking-[0.2em] text-emerald-600">
                  Consultation
                </p>

                <h1 className="max-w-4xl mx-auto text-center text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                  Advice and support for farmers who need real help.
                </h1>

                <p className="max-w-2xl mx-auto text-center text-[16px] leading-[1.9] text-neutral-600 md:text-lg">
                  If you are unsure what feed to buy, what material to use, or
                  how to handle a farm issue, you can speak with us first and
                  get practical direction.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className=" pt-2 pb-10">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="">
              <div className=" p-8">
                <div className="space-y-3 grid grid-cols-1 md:grid-cols-4 gap-4 ">
                  {steps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-start gap-4 rounded-[1.5rem] border border-neutral-200 bg-[#fafaf8] p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-[#f1fbf4] text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-neutral-700">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ConsultationAreasCarousel />

        <section className="border-t border-neutral-200 py-20">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="">
              <h2 className=" text-center mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                FAQs
              </h2>
            </div>

            <div className="mt-8 space-y-4 max-w-2xl mx-auto">
              {faqs.map((item, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={item.q}
                    className="rounded-[1.5rem] border border-neutral-200 bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
                    >
                      <span className="text-base font-semibold text-neutral-950 md:text-lg">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen ? (
                      <div className="border-t border-neutral-200 px-5 py-5 md:px-6">
                        <p className="text-sm leading-8 text-neutral-600 md:text-[15px]">
                          {item.a}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
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
