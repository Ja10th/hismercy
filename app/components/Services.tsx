"use client";

import { useState } from "react";
import Image from "next/image";
import { services } from "@/data/content";

export default function Services() {
  const [active, setActive] = useState(0);
  const current = services[active];

  const prev = () =>
    setActive((p) => (p - 1 + services.length) % services.length);

  const next = () =>
    setActive((p) => (p + 1) % services.length);

  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden bg-[#f2f0eb]">

      {/* Background Image */}
      <Image
        key={active}
        src={current.image}
        alt={current.heading}
        fill
        className="object-cover z-0"
        priority
      />

      {/* <div className="pointer-events-none absolute top-0 left-0 w-full h-40 z-10 bg-linear-to-b from-white to-transparent" /> */}

      {/* 🔥 BOTTOM FADE (image fades into dark area) */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-96 z-10 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Dark overlay (for readability) */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-8 pb-20">
        <div className="max-w-xl flex flex-col gap-5">
          <h3 className=" text-3xl md:text-4xl lg:text-6xl font-semibold text-white leading-[1.2]">
            {current.heading}
          </h3>

          <p className="text-white/80 text-base lg:text-[20px]  leading-[1.75]">
            {current.paragraph}
          </p>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={prev}
              aria-label="Previous"
              className="w-11 h-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm text-white text-lg flex items-center justify-center hover:bg-white/20 hover:border-white/70 transition-all"
            >
              ←
            </button>

            <div className="flex items-center gap-1 text-white/70 text-[16px]">
              <span className="text-white font-semibold text-xl">
                {String(active + 1).padStart(2, "0")}
              </span>
              <span className="opacity-50 mx-0.5">/</span>
              <span>
                {String(services.length).padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={next}
              aria-label="Next"
              className="w-11 h-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm text-white text-lg flex items-center justify-center hover:bg-white/20 hover:border-white/70 transition-all"
            >
              →
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === active ? "bg-white w-12" : "bg-white/30 w-8"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}