import Image from "next/image";
import { chooseCards } from "@/data/content";

export default function WhyChoose() {
  return (
    <section className="py-24 bg-[#f2f0eb]">
      <div className="max-w-[1280px] mx-auto px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 max-w-lg mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[13px] font-medium text-primary w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            Why Choose Us?
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-neutral-900 leading-[1.25]">
            Rooted in Trust. Growing with Innovation.
          </h2>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4">
          {chooseCards.map((card, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] overflow-hidden min-h-[320px]"
            >
              {/* Text */}
              {!card.imageFirst && (
                <div className="flex flex-col justify-center gap-4 p-12">
                  <h3 className="font-serif text-[1.375rem] font-medium text-neutral-900 leading-[1.3]">
                    {card.title}
                  </h3>
                  <p className="text-[15px] text-neutral-600 leading-[1.75]">{card.paragraph}</p>
                </div>
              )}

              {/* Image */}
              <div className="relative min-h-[280px]">
                <Image src={card.image} alt={card.title} fill className="object-cover" />
              </div>

              {/* Text (when imageFirst) */}
              {card.imageFirst && (
                <div className="flex flex-col justify-center gap-4 p-12">
                  <h3 className="font-serif text-[1.375rem] font-medium text-neutral-900 leading-[1.3]">
                    {card.title}
                  </h3>
                  <p className="text-[15px] text-neutral-600 leading-[1.75]">{card.paragraph}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}