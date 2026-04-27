import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Boxes,
  Leaf,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniqueBrandSlug(baseSlug: string, excludeId?: string) {
  const existing = await prisma.brand.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { slug: true },
  });

  if (existing.length === 0) return baseSlug;

  const taken = new Set(existing.map((item) => item.slug));
  let suffix = 2;

  while (taken.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

async function createBrand(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const slug = await getUniqueBrandSlug(slugify(name));

  await prisma.brand.create({
    data: { name, slug },
  });

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

async function deleteBrand(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.brand.delete({
    where: { id },
  });

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

function AddBrandModal() {
  const modalId = "add-brand-modal";

  return (
    <div className="relative">
      <input id={modalId} type="checkbox" className="peer sr-only" />

      <label
        htmlFor={modalId}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-950 px-3 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
      >
        <Plus className="h-4 w-4" />
       
      </label>

      <div className="fixed inset-0 z-50 hidden items-center justify-center p-4 peer-checked:flex">
        <label
          htmlFor={modalId}
          className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        />

        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">
                Add brand
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Create a brand for your catalog.
              </p>
            </div>

            <label
              htmlFor={modalId}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </label>
          </div>

          <form action={createBrand} className="p-5 sm:p-6">
            <input
              name="name"
              placeholder="Brand name"
              className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <label
                htmlFor={modalId}
                className="inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancel
              </label>

              <button className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
                Save Brand
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const brandVisuals = [
  { Icon: Tag, accent: "bg-sky-50 text-sky-600", dot: "bg-sky-500" },
  {
    Icon: Boxes,
    accent: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    Icon: ShoppingBag,
    accent: "bg-violet-50 text-violet-600",
    dot: "bg-violet-500",
  },
  { Icon: Package, accent: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  { Icon: Sparkles, accent: "bg-pink-50 text-pink-600", dot: "bg-pink-500" },
  { Icon: Leaf, accent: "bg-lime-50 text-lime-600", dot: "bg-lime-500" },
  { Icon: Box, accent: "bg-cyan-50 text-cyan-600", dot: "bg-cyan-500" },
] as const;

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Brands
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Manage your brand groups and see how many products belong to each
              one.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AddBrandModal />
          </div>
        </div>

        {brands.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-white p-10 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <Tag className="mx-auto h-10 w-10 text-neutral-300" />
            <h2 className="mt-4 text-lg font-semibold text-neutral-950">
              No brands yet
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Add your first brand to start organizing products.
            </p>

            <div className="mt-6 flex justify-center">
              <AddBrandModal />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand, index) => {
              const visual = brandVisuals[index % brandVisuals.length];
              const Icon = visual.Icon;

              return (
                <div
                  key={brand.id}
                  className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                >
                  <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${visual.accent}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <h2 className="text-[20px] font-semibold tracking-tight text-neutral-950">
                            {brand.name}
                          </h2>
                          <p className="mt-1 break-all text-xs text-neutral-500">
                            {brand.slug}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-neutral-500">
                          {brand._count.products} product
                          {brand._count.products === 1 ? "" : "s"}
                        </p>
                      </div>

                      <form action={deleteBrand}>
                        <input type="hidden" name="id" value={brand.id} />
                        <button className="inline-flex h-11 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                          
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
