import Link from "next/link";
import Image from "next/image";
import { assets } from "@/data/content";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-end overflow-hidden pt-28 md:pt-18">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-center object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        poster={assets.heroPoster}
      >
        <source src={assets.heroVideo} type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative z-20 w-full max-w-8xl mx-auto px-5 md:px-40 pb-20">
        {/* Use 3 columns at lg and let the headline span 2 columns (2/3 width) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-end">
          {/* Headline — spans 2 columns on large screens */}
          <h1 className="lg:col-span-2 font-sans font-bold text-[40px] md:text-5xl lg:text-[70px] text-white leading-[1.15] tracking-tight text-center md:text-left">
            Quality feed and farm supplies for livestocks
          </h1>

          {/* Right column — occupies 1 column on large screens */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Paragraph + CTA */}
            <div className="flex flex-col gap-6 items-center md:items-start justify-center">
              <p className="text-white/80 text-[16px] leading-[1.75] max-w-sm lg:max-w-md text-center md:text-left">
                Supplying maize, soya, wheat offal and branded feeds. Browse
                trusted feed brands, place orders, and get reliable delivery
                across Ekiti.
              </p>

              <Link
                href="/shop"
                className="flex w-full justify-center  items-center bg-white text-neutral-900 px-7 py-4 rounded-full text-[15px] font-normal hover:bg-white/90 transition-colors md:inline-flex md:w-auto md:mx-0"
              >
                Browse Products
              </Link>
            </div>
            {/* Review card */}
            {/* 3. Horizontal compact card */}
<div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-5">
  <div className="shrink-0">
    <div className="font-serif text-[2.4rem] font-medium text-white leading-none">
      4.9
    </div>
    <StarRow />
    <div className="text-white/60 text-[11px] mt-1">Trusted by Ekiti farmers</div>
  </div>

  <div className="flex-1">
    <div className="flex -space-x-2">
      {assets.avatars.map((src, i) => (
        <div key={i} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
          <Image src={src} alt="" width={36} height={36} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>

    <div className="mt-3 flex items-center justify-between gap-3">
      <div className="text-white/70 text-[12px]">
        <div>1.2K Customers</div>
        <div>18 Reviews</div>
      </div>
      <Image src={assets.badgeImage} alt="" width={44} height={44} />
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const StarRow = () => (
  <div className="flex items-center gap-1 text-amber-400 text-[16px] leading-none">
    {"★★★★★"}
  </div>
);