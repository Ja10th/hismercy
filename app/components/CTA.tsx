import Link from "next/link";
import { assets } from "@/data/content";

export default function CTA() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        poster={assets.heroPoster}
      >
        <source src={assets.heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/62 z-10" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1280px] mx-auto px-8 py-20">
        <div className="max-w-2xl flex flex-col gap-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-[1.18] tracking-tight">
            Quality Feed and Farm Supplies for Better Growth
          </h1>
          <p className="text-white/82 text-[17px] leading-[1.7] max-w-md">
            Trust Mercy Agric Services for branded feeds, feed ingredients, and reliable farm supplies that support healthier birds, stronger livestock, and better farm results.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/shop"
              className="inline-flex items-center bg-primary hover:bg-primary-light text-white px-7 py-3.5 rounded-full text-[15px] font-medium transition-colors duration-200"
            >
              Shop Feed & Supplies
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center border border-white/60 text-white px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-white/10 hover:border-white transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Floating card */}
      <div className="hidden lg:block absolute bottom-10 right-10 z-30 w-[280px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] overflow-hidden">
        <div className="p-5 text-[14px] font-medium text-white leading-[1.4]">
          Trusted Brands. Reliable Supply. Farmer-Focused Support.
        </div>
        <div className="relative h-40 overflow-hidden">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={assets.farmersVideo} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}