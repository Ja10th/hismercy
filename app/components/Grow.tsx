import Image from "next/image";
import { growCards } from "@/data/content";
import { TextGenerateEffect } from "./ui/text-generate-effect";

export default function Grow() {
  const words = `Mercy Agric Services supplies feedmill materials, branded poultry feeds, pig feeds,
              drugs, and poultry equipment to farmers and retailers in Ekiti. We make it easy
              to choose the right feed brand, keep stock available, and get dependable service.
`;

  return (
    <section className="py-24 bg-[#fafaf8]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="gap-20 items-start">
          <div className=" flex flex-col items-center justify-center md:max-w-6xl px-5 md:px-20 mx-auto gap-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[11px] md:text-[13px] font-medium text-primary w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              Reliable feed supply for livestock farmers
            </div>
            <div className=" text-center ">
              <TextGenerateEffect words={words} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-14">
            {growCards.map((card, i) => (
              <div
                key={i}
                className={`bg-[#f2f0eb] rounded-[2rem] p-8 flex flex-col gap-4 ${
                  i === 0 ? " " : ""
                }`}
              >
                <h3 className="font-serif text-2xl font-medium text-neutral-900">
                  {card.title}
                </h3>
                <p className="text-[15px] text-neutral-600 leading-[1.75]">
                  {card.paragraph}
                </p>
                <div className="relative h-64 rounded-2xl overflow-hidden mt-2">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
