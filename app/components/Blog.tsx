import Link from "next/link";
import Image from "next/image";
import { blogs, assets } from "@/data/content";

export default function Blog() {
  return (
    <section className="py-24 bg-[#f2f0eb]">
      <div className="max-w-[1280px] mx-auto px-8">

        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[13px] font-medium text-primary w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              Blogs
            </div>
            <h2 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-[1.25]">
              Stay Informed. Stay Empowered.
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center border border-black/25 text-neutral-900 px-6 py-3 rounded-full text-[15px] font-medium hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            View All Posts
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post, i) => (
            <Link
              key={i}
              href={post.href}
              className="flex flex-col bg-white rounded-[1.5rem] overflow-hidden border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden flex-shrink-0">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Body */}
              <div className="flex flex-col gap-5 p-6 flex-1">
                <h3 className="text-base md:text-xl font-medium text-neutral-900 leading-[1.4] flex-1">
                  {post.title}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center border border-black/20 text-neutral-900 px-4 py-2 rounded-full text-[13px] font-medium hover:bg-neutral-900 hover:text-white transition-all duration-200">
                    Learn More
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Image src={assets.dateIcon} alt="" width={14} height={14} />
                    <span className="text-[13px] text-neutral-400">{post.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}