import Link from "next/link";
import Image from "next/image";
import { assets } from "@/data/content";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-end overflow-hidden pt-28 md:pt-18">
      {/* Background video */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        poster={assets.heroPoster}
      >
        <source
          src="https://www.pexels.com/download/video/8114889/"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-8xl px-5 pb-20 md:px-40">
        <div className="grid grid-cols-1 items-end gap-8 md:gap-12 lg:grid-cols-3">
          <h1 className="text-center font-sans text-[40px] font-bold leading-[1.15] tracking-tight text-white md:text-left md:text-5xl lg:col-span-2 lg:text-[70px]">
            Quality feed and farm supplies for livestocks
          </h1>

          <div className="flex flex-col gap-8 lg:col-span-1">
            <div className="flex flex-col items-center justify-center gap-6 md:items-start">
              <p className="max-w-sm text-center text-[16px] leading-[1.75] text-white/80 lg:max-w-md md:text-left">
                Supplying maize, soya, wheat offal and branded feeds. Browse
                trusted feed brands, place orders, and get reliable delivery
                across Ekiti.
              </p>

              <Link
                href="/shop"
                className="flex w-full items-center justify-center rounded-full bg-white px-7 py-4 text-[15px] font-normal text-neutral-900 transition-colors hover:bg-white/90 md:mx-0 md:inline-flex md:w-auto"
              >
                Browse Products
              </Link>
            </div>

            <div className="hidden items-center gap-5 rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-md">
              <div className="shrink-0">
                <div className="font-serif text-[2.4rem] font-medium leading-none text-white">
                  4.9
                </div>
                <StarRow />
                <div className="mt-1 text-[11px] text-white/60">
                  Trusted by Ekiti farmers
                </div>
              </div>

              <div className="flex-1">
                <div className="-space-x-2 flex">
                  {assets.avatars.map((src, i) => (
                    <div
                      key={i}
                      className="h-9 w-9 overflow-hidden rounded-full border-2 border-white"
                    >
                      <Image
                        src={src}
                        alt=""
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-[12px] text-white/70">
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
  <div className="flex items-center gap-1 text-[16px] leading-none text-amber-400">
    {"★★★★★"}
  </div>
);