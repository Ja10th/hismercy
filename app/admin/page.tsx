import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [brandCount, productCount, featuredCount, inStockCount] = await Promise.all([
    prisma.brand.count(),
    prisma.product.count(),
    prisma.product.count({ where: { featured: true } }),
    prisma.product.count({ where: { inStock: true } }),
  ]);

  const statCards = [
    { label: "Brands", value: brandCount },
    { label: "Products", value: productCount },
    { label: "Featured", value: featuredCount },
    { label: "In stock", value: inStockCount },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,193,107,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_28%)]" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Dashboard overview
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                Control your store from one place.
              </h1>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-500 sm:text-base">
                Add brands, create products, upload images, manage stock, and choose
                exactly what appears on the homepage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:min-w-[340px]">
              {statCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-950">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {[
          {
            href: "/admin/brands",
            title: "Brands",
            desc: "Organize collections",
          },
          {
            href: "/admin/products",
            title: "Products",
            desc: "Create and upload",
          },
          {
            href: "/admin/home",
            title: "Home Products",
            desc: "Featured homepage items",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">{item.title}</h2>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
              <span className="text-neutral-300 transition group-hover:translate-x-1 group-hover:text-neutral-500">
                →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}