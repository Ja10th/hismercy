"use client";

import { useRef } from "react";
import Image from "next/image";
import { consultations } from "@/data/content";

export default function Consultation() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 600;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 overflow-hidden">

      {/* HEADER (still centered) */}
      <div className="max-w-8xl mx-auto px-5 md:px-40 mb-12 flex items-center justify-between flex-wrap gap-6">
        <div className="flex flex-col gap-4 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[13px] font-medium text-primary w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            Consultation
          </div>

          <h2 className="text-3xl md:text-4xl font-normal text-neutral-900 leading-[1.25]">
            Real Results. Real Growth.
          </h2>
        </div>

        {/* Arrows */}
        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="w-11 h-11 rounded-full border border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-900 hover:text-white transition"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-11 h-11 rounded-full border border-neutral-300 bg-white flex items-center justify-center hover:bg-neutral-900 hover:text-white transition"
          >
            →
          </button>
        </div>
      </div>

      {/* FULL WIDTH SLIDER */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-8 md:px-12 lg:px-20 scroll-smooth"
      >
        {consultations.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[90%] md:w-[75%] h-[550px] md:h-[500px] lg:w-[65%] bg-[#f3f3f1] rounded-[2rem] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Image */}
            <div className="relative w-full md:w-[45%] min-h-[280px]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-xl md:text-2xl font-normal text-neutral-900 leading-[1.3]">
                  {item.title}
                </h3>

                <p className="text-[14px] md:text-base text-neutral-600 leading-[1.7] max-w-md">
                  {item.description}
                </p>
              </div>

              <button className="w-fit border border-neutral-800 text-neutral-900 px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-neutral-900 hover:text-white transition">
                Book Consultation
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}