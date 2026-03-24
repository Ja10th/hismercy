"use client";

import { useState } from "react";
import Image from "next/image";
import { testimonials, assets } from "@/data/content";

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const prev = () =>
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((p) => (p + 1) % testimonials.length);

  const visible = [
    testimonials[active % testimonials.length],
    testimonials[(active + 1) % testimonials.length],
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[13px] font-medium text-primary w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            Testimonial
          </div>

          <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-[1.25] text-center">
            What Our Customers Say
          </h2>
        </div>

        {/* Slider */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
          {/* Desktop left button */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full bg-[#F3F3F1] text-neutral-800 text-lg items-center justify-center hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            ←
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {visible.map((t, i) => (
              <div
                key={`${active}-${i}`}
                className={`w-full max-w-[360px] md:max-w-none mx-auto bg-[#F3F3F1] rounded-[1.5rem] p-5 sm:p-8 flex flex-col gap-5 animate-fade-up ${
                  i === 1 ? "hidden md:flex" : "flex"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={52}
                      height={52}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold text-neutral-900 leading-tight">
                        {t.name}
                      </div>
                      <div className="text-[13px] text-neutral-400 leading-tight">
                        {t.designation}
                      </div>
                    </div>
                  </div>

                  <Image
                    src={assets.quoteImage}
                    alt=""
                    width={32}
                    height={24}
                    className="opacity-60 flex-shrink-0"
                  />
                </div>

                <p className="text-[14px] sm:text-[15px] md:text-2xl text-neutral-600 leading-[1.7] md:leading-[1.75] flex-1">
                  {t.text}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="text-[13px] font-semibold text-neutral-900">
                    {t.rating} Ratings
                  </span>
                  <Image src={assets.ratingStars} alt="" width={88} height={16} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop right button */}
          <button
            onClick={next}
            aria-label="Next"
            className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full bg-[#F3F3F1] text-neutral-800 text-lg items-center justify-center hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            →
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            aria-label="Previous"
            className="w-12 h-12 rounded-full bg-[#F3F3F1] text-neutral-800 text-lg flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            ←
          </button>

          <button
            onClick={next}
            aria-label="Next"
            className="w-12 h-12 rounded-full bg-[#F3F3F1] text-neutral-800 text-lg flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            →
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? "bg-primary w-6" : "bg-neutral-300 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}