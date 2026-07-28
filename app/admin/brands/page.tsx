export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { BrandsToolbar } from "./BrandsToolbar";

const PAGE_SIZE = 8;
const ADD_BRAND_MODAL_ID = "add-brand-modal";
const BULK_BRAND_MODAL_ID = "bulk-brand-modal";
const ANALYTICS_MODAL_ID = "brand-analytics-modal";

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

  const brand = await prisma.brand.create({
    data: { name, slug },
  });

  const { logAudit } = await import("@/lib/audit");
  await logAudit({
    category: "brand",
    action: "Created brand",
    target: brand.name,
    href: `/admin/brands/${brand.id}`,
  });

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

async function bulkCreateBrands(formData: FormData) {
  "use server";

  const raw = String(formData.get("names") || "").trim();
  if (!raw) return;

  const names = Array.from(
    new Set(
      raw
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

  for (const name of names) {
    const slug = await getUniqueBrandSlug(slugify(name));
    await prisma.brand.create({ data: { name, slug } });
  }

  const { logAudit } = await import("@/lib/audit");
  await logAudit({
    category: "brand",
    action: "Bulk created brands",
    meta: { count: names.length, names },
    href: "/admin/brands",
  });

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

async function deleteBrand(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const brand = await prisma.brand.findUnique({
    where: { id },
    select: { name: true },
  });

  await prisma.brand.delete({ where: { id } });

  const { logAudit } = await import("@/lib/audit");
  await logAudit({
    category: "brand",
    action: "Deleted brand",
    target: brand?.name,
  });

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

function AddBrandModal() {
  return (
    <div className="relative">
      <input id={ADD_BRAND_MODAL_ID} type="checkbox" className="peer sr-only" />

      <div className="fixed inset-0 z-50 hidden items-center justify-center p-4 peer-checked:flex">
        <label
          htmlFor={ADD_BRAND_MODAL_ID}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        />

        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">
                Add brand
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Create a new brand group for your catalog.
              </p>
            </div>

            <label
              htmlFor={ADD_BRAND_MODAL_ID}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </label>
          </div>

          <form action={createBrand} className="p-5 sm:p-6">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Brand name
            </label>
            <input
              name="name"
              placeholder="e.g. Happy Chicken"
              className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <label
                htmlFor={ADD_BRAND_MODAL_ID}
                className="inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancel
              </label>

              <button className="inline-flex h-11 items-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-emerald-800">
                Save Brand
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function BulkAddBrandsModal() {
  return (
    <div className="relative">
      <input
        id={BULK_BRAND_MODAL_ID}
        type="checkbox"
        className="peer sr-only"
      />

      <div className="fixed inset-0 z-50 hidden items-center justify-center p-4 peer-checked:flex">
        <label
          htmlFor={BULK_BRAND_MODAL_ID}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        />

        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">
                Bulk add brands
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Paste one brand name per line.
              </p>
            </div>

            <label
              htmlFor={BULK_BRAND_MODAL_ID}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </label>
          </div>

          <form action={bulkCreateBrands} className="p-5 sm:p-6">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Brand names
            </label>
            <textarea
              name="names"
              rows={8}
              placeholder={"Happy Chicken\nGreen Farm\nFresh Choice"}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <label
                htmlFor={BULK_BRAND_MODAL_ID}
                className="inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancel
              </label>

              <button className="inline-flex h-11 items-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-emerald-800">
                Save Brands
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AnalyticsModal({
  totalBrands,
  totalProducts,
  topBrandName,
  topBrandProducts,
}: {
  totalBrands: number;
  totalProducts: number;
  topBrandName: string | null;
  topBrandProducts: number;
}) {
  return (
    <div className="relative">
      <input id={ANALYTICS_MODAL_ID} type="checkbox" className="peer sr-only" />

      <div className="fixed inset-0 z-50 hidden items-center justify-center p-4 peer-checked:flex">
        <label
          htmlFor={ANALYTICS_MODAL_ID}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        />

        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">
                Brand analytics
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Quick snapshot of your brand catalog.
              </p>
            </div>

            <label
              htmlFor={ANALYTICS_MODAL_ID}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </label>
          </div>

          <div className="border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-center text-xs uppercase tracking-wide text-neutral-400">
              Top brand
            </p>
            <p className="mt-2 text-center text-xl font-semibold text-emerald-700">
              {topBrandName ?? "—"}
            </p>
            <p className="mt-1 text-center text-sm text-neutral-500">
              {topBrandProducts} products
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Total brands
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {totalBrands}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Total products
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">
                {totalProducts}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const brandVisuals = [
  { Icon: Tag, accent: "bg-orange-50 text-orange-600" },
  { Icon: Boxes, accent: "bg-emerald-50 text-emerald-600" },
  { Icon: ShoppingBag, accent: "bg-violet-50 text-violet-600" },
  { Icon: Package, accent: "bg-amber-50 text-amber-600" },
  { Icon: Sparkles, accent: "bg-pink-50 text-pink-600" },
  { Icon: Tag, accent: "bg-sky-50 text-sky-600" },
  { Icon: Boxes, accent: "bg-cyan-50 text-cyan-600" },
  { Icon: Package, accent: "bg-fuchsia-50 text-fuchsia-600" },
] as const;

function BrandStatus({ index }: { index: number }) {
  const statuses = ["Active", "Active", "Draft", "Inactive"] as const;

  const statusClass = (() => {
    switch (index % 4) {
      case 0:
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 1:
        return "bg-neutral-100 text-neutral-500 border-neutral-200";
      case 2:
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-red-50 text-red-600 border-red-100";
    }
  })();

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}
    >
      {statuses[index % statuses.length]}
    </span>
  );
}

type BrandsPageProps = {
  searchParams?:
    | {
        page?: string;
        q?: string;
        sort?: string;
        view?: string;
      }
    | Promise<{
        page?: string;
        q?: string;
        sort?: string;
        view?: string;
      }>;
};

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = await Promise.resolve(searchParams ?? {});

  const requestedPage = Number(params.page ?? "1");
  const pageCandidate =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const q = String(params.q ?? "").trim();
  const sort =
    params.sort === "name_asc" || params.sort === "name_desc"
      ? params.sort
      : "created_desc";
  const view = params.view === "list" ? "list" : "grid";

  const where = q
    ? {
        name: {
          contains: q,
          mode: "insensitive" as const,
        },
      }
    : undefined;

  const orderBy =
    sort === "name_asc"
      ? ({ name: "asc" } as const)
      : sort === "name_desc"
        ? ({ name: "desc" } as const)
        : ({ createdAt: "desc" } as const);

  const totalBrands = await prisma.brand.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalBrands / PAGE_SIZE));
  const currentPage = Math.min(pageCandidate, totalPages);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const brands = await prisma.brand.findMany({
    where,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy,
    skip,
    take: PAGE_SIZE,
  });

  const analyticsBrands = await prisma.brand.findMany({
    where,
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const totalProducts = analyticsBrands.reduce(
    (sum, brand) => sum + brand._count.products,
    0,
  );

  const topBrand = analyticsBrands.reduce<null | (typeof analyticsBrands)[number]>(
    (best, brand) =>
      !best || brand._count.products > best._count.products ? brand : best,
    null,
  );

  const startItem = totalBrands === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + PAGE_SIZE, totalBrands);

  return (
    <div className="min-h-screen bg-neutral-50">
      <AddBrandModal />
      <BulkAddBrandsModal />
      <AnalyticsModal
        totalBrands={totalBrands}
        totalProducts={totalProducts}
        topBrandName={topBrand?.name ?? null}
        topBrandProducts={topBrand?._count.products ?? 0}
      />

      <div className="mx-auto max-w-[1600px] px-4 pb-6 pt-6 sm:px-6 lg:px-2">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Brands
            </h1>
            <p className="mt-1 text-[15px] leading-6 text-neutral-500">
              Create, organize, and manage your brand groups and their products.
            </p>
          </div>
        </div>

        <section className="rounded-[32px]">
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-4">
            <label
              htmlFor={ADD_BRAND_MODAL_ID}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Plus className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-950">
                  Add new brand
                </p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-neutral-400" />
            </label>

            <label
              htmlFor={BULK_BRAND_MODAL_ID}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-950">Bulk add</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-neutral-400" />
            </label>

            <label
              htmlFor={ANALYTICS_MODAL_ID}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-950">
                  View analytics
                </p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-neutral-400" />
            </label>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 transition hover:bg-neutral-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-950">
                  Manage products
                </p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-neutral-400" />
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-[32px]">
          <BrandsToolbar q={q} sort={sort} view={view} />

          {brands.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-neutral-300" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-950">
                No brands yet
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Add your first brand to start organizing products.
              </p>

              <div className="mt-6 flex justify-center">
                <label
                  htmlFor={ADD_BRAND_MODAL_ID}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Brand
                </label>
              </div>
            </div>
          ) : (
            <>
              <div
                className={
                  view === "grid"
                    ? "mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4"
                    : "mt-6 flex flex-col gap-4"
                }
              >
                {brands.map((brand, index) => {
                  const visual = brandVisuals[index % brandVisuals.length];
                  const Icon = visual.Icon;

                  return view === "grid" ? (
                    <div
                      key={brand.id}
                      className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                    >
                      <div className="border-b border-neutral-200 px-5 py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${visual.accent}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="min-w-0 truncate text-[16px] tracking-widest text-neutral-950">
                                {brand.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                              Products
                            </p>
                            <p className="mt-2 text-xl font-semibold text-neutral-950">
                              {brand._count.products}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                              Created
                            </p>
                            <p className="mt-2 text-sm text-neutral-700">
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(brand.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-200 pt-4">
                          <Link
                            href={`/admin/brands/${brand.id}`}
                            className="inline-flex shrink-0 items-center text-sm font-medium text-emerald-600 hover:underline"
                          >
                            View brand
                          </Link>

                          <form action={deleteBrand} className="shrink-0">
                            <input type="hidden" name="id" value={brand.id} />
                            <button
                              type="submit"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-red-600"
                              aria-label={`Delete ${brand.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={brand.id}
                      className="rounded-[28px] border border-neutral-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${visual.accent}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div>
                            <h3 className="text-[16px] tracking-widest text-neutral-950">
                              {brand.name}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                              {brand._count.products} products ·{" "}
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(brand.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* <BrandStatus index={index} /> */}

                          <Link
                            href={`/admin/brands/${brand.id}`}
                            className="inline-flex shrink-0 items-center text-sm font-medium text-emerald-600 hover:underline"
                          >
                            View brand
                          </Link>

                          <form action={deleteBrand} className="shrink-0">
                            <input type="hidden" name="id" value={brand.id} />
                            <button
                              type="submit"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-red-600"
                              aria-label={`Delete ${brand.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-neutral-500">
                    Showing {startItem} to {endItem} of {totalBrands} results
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      href={
                        currentPage > 1
                          ? `${buildBrandsHref({ q: q || undefined, sort, view })}&page=${currentPage - 1}`
                          : "#"
                      }
                      aria-disabled={currentPage === 1}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-neutral-700 transition ${
                        currentPage === 1
                          ? "pointer-events-none border-neutral-200 bg-neutral-50 text-neutral-300"
                          : "border-neutral-200 bg-white hover:bg-neutral-100"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Link
                          key={page}
                          href={`${buildBrandsHref({ q: q || undefined, sort, view })}&page=${page}`}
                          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition ${
                            page === currentPage
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          {page}
                        </Link>
                      ),
                    )}

                    <Link
                      href={
                        currentPage < totalPages
                          ? `${buildBrandsHref({ q: q || undefined, sort, view })}&page=${currentPage + 1}`
                          : "#"
                      }
                      aria-disabled={currentPage === totalPages}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-neutral-700 transition ${
                        currentPage === totalPages
                          ? "pointer-events-none border-neutral-200 bg-neutral-50 text-neutral-300"
                          : "border-neutral-200 bg-white hover:bg-neutral-100"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function buildBrandsHref({
  q,
  sort,
  view,
  page,
}: {
  q?: string;
  sort?: string;
  view?: "grid" | "list";
  page?: number;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  if (view) params.set("view", view);
  if (page) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/brands?${query}` : "/admin/brands";
}