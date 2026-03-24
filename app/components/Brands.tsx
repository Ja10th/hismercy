import Image from "next/image";
import { brandLogos } from "@/data/content";

export default function Brands() {
  const doubled = [...brandLogos, ...brandLogos];

  return (
    <section className="py-16 bg-[#f2f0eb] overflow-hidden">
      <p className="text-center text-[13px] font-medium text-neutral-400 uppercase tracking-widest mb-8">
        Investor &amp; Partners
      </p>

      {/* Marquee wrapper with fade edges */}
      <div
        className="overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div className="flex items-center gap-12 animate-marquee">
          {doubled.map((src, i) => (
            <div key={i} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity duration-200">
              <Image
                src={src}
                alt=""
                width={120}
                height={48}
                className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-200"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}