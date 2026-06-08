"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Stethoscope,
  Truck,
  Wheat,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const consultationAreas = [
  {
    icon: Stethoscope,
    title: "Farm problem review",
    paragraph:
      "Share the issue you are facing and get practical guidance on the next step.",
    image:
      "https://images.unsplash.com/photo-1612170153139-6f881ff067e0?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    icon: Wheat,
    title: "Feed and nutrition advice",
    paragraph:
      "We help farmers choose the right feed and materials for better performance.",
    image:
      "https://images.unsplash.com/photo-1588597989061-b60ad0eefdbf?q=80&w=2369&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    icon: Truck,
    title: "Supply and delivery help",
    paragraph:
      "Need sourcing or delivery support? We help make the process easier.",
    image:
      "https://images.unsplash.com/photo-1573333744619-00d101e99133?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    icon: ShieldCheck,
    title: "General farm support",
    paragraph:
      "Get simple consultation for poultry, livestock, and feed-related questions.",
    image:
      "https://images.unsplash.com/photo-1545251765-6aad90d25972?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function ConsultationAreasCarousel() {
  const [active, setActive] = useState(0);
  const current = consultationAreas[active];

  const prev = () =>
    setActive(
      (p) => (p - 1 + consultationAreas.length) % consultationAreas.length,
    );

  const next = () => setActive((p) => (p + 1) % consultationAreas.length);

  const Icon = current.icon;

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-[#f2f0eb]">
      <div
        key={active}
        className="absolute inset-0 md:hidden animate-pan-mobile"
        style={{
          backgroundImage: `url(${current.image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto 100%",
          backgroundPosition: "0% center",
        }}
      />

      <div className="absolute inset-0 hidden md:block">
        <img
          key={active}
          src={current.image}
          alt={current.title}
          className="object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-black/35" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-full bg-gradient-to-t from-black via-black/65 to-transparent" />

      <div className="relative z-10 flex min-h-[85vh] items-end">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-8 md:pb-20">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
              Consultation areas
            </p>

            <div className="mt-5 flex items-center gap-3">
              <h3 className="text-3xl font-semibold leading-[1.15] text-white md:text-4xl lg:text-6xl">
                {current.title}
              </h3>
            </div>

            <p className="mt-5 max-w-xl text-base leading-[1.85] text-white/80 lg:text-[20px]">
              {current.paragraph}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={prev}
                aria-label="Previous"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-white/75 text-sm">
                <span className="text-xl font-semibold text-white">
                  {String(active + 1).padStart(2, "0")}
                </span>
                <span className="opacity-50">/</span>
                <span>{String(consultationAreas.length).padStart(2, "0")}</span>
              </div>

              <button
                onClick={next}
                aria-label="Next"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/20"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              {consultationAreas.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === active ? "w-12 bg-white" : "w-8 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes panMobile {
          from {
            background-position: 0% center;
          }
          to {
            background-position: 100% center;
          }
        }

        .animate-pan-mobile {
          animation: panMobile 4s linear forwards;
          will-change: background-position;
        }
      `}</style>
    </section>
  );
}
