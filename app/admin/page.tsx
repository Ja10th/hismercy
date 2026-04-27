import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  Boxes,
  LayoutDashboard,
  Package,
  Sparkles,
  Tag,
  Truck,
  TrendingUp,
} from "lucide-react";

export default async function AdminPage() {
  const [
    brandCount,
    productCount,
    featuredCount,
    inStockCount,
    recentBrands,
    recentProducts,
  ] = await Promise.all([
    prisma.brand.count(),
    prisma.product.count(),
    prisma.product.count({ where: { featured: true } }),
    prisma.product.count({ where: { inStock: true } }),
    prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        brand: true,
        images: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "Brands",
      value: brandCount,
      icon: Tag,
      accent: "text-sky-600",
      accentBg: "bg-sky-50",
    },
    {
      label: "Products",
      value: productCount,
      icon: Boxes,
      accent: "text-emerald-600",
      accentBg: "bg-emerald-50",
    },
    {
      label: "Featured",
      value: featuredCount,
      icon: Sparkles,
      accent: "text-violet-600",
      accentBg: "bg-violet-50",
    },
    {
      label: "In stock",
      value: inStockCount,
      icon: Truck,
      accent: "text-amber-600",
      accentBg: "bg-amber-50",
    },
  ] as const;

  const actions = [
    {
      href: "/admin/brands",
      title: "Brands",
      desc: "Create and organize collections",
      icon: Tag,
      accent: "text-sky-600",
      accentBg: "bg-sky-50",
    },
    {
      href: "/admin/products",
      title: "Products",
      desc: "Create, edit, and upload images",
      icon: Package,
      accent: "text-emerald-600",
      accentBg: "bg-emerald-50",
    },
    {
      href: "/admin/home",
      title: "Home Products",
      desc: "Choose what shows on the homepage",
      icon: LayoutDashboard,
      accent: "text-violet-600",
      accentBg: "bg-violet-50",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden   ">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 " />
            <div className="relative p-2">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
                  {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-3xl border border-neutral-200 bg-white/90 p-4 "
                      >
                       
                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-neutral-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-neutral-950">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

       

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Recent products
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  The newest items added to the catalog.
                </p>
              </div>
              <Link
                href="/admin/products"
                className="text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {recentProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
                  No products yet.
                </div>
              ) : (
                recentProducts.map((product) => {
                  const imageUrl = product.images[0]?.url || "/bags.png";
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {product.name}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {product.brand?.name || "No brand"} ·{" "}
                            {product.inStock ? "In stock" : "Out of stock"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-sm font-medium text-neutral-700">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          maximumFractionDigits: 0,
                        }).format(product.price / 100)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Recent brands
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Quick view of the newest brand groups.
                </p>
              </div>
              <Link
                href="/admin/brands"
                className="text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {recentBrands.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
                  No brands yet.
                </div>
              ) : (
                recentBrands.map((brand, index) => {
                  const brandIcons = [Tag, Boxes, Sparkles, Truck] as const;
                  const brandAccent = [
                    "bg-sky-50 text-sky-600",
                    "bg-emerald-50 text-emerald-600",
                    "bg-violet-50 text-violet-600",
                    "bg-amber-50 text-amber-600",
                  ] as const;

                  const Icon = brandIcons[index % brandIcons.length];
                  const accent = brandAccent[index % brandAccent.length];

                  return (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {brand.name}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {brand._count.products} product
                            {brand._count.products === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/admin/brands"
                        className="shrink-0 text-sm font-medium text-neutral-700 hover:text-neutral-950"
                      >
                        Open
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
