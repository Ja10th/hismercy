import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function createBrand(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  await prisma.brand.create({
    data: { name, slug },
  });

  revalidatePath("/admin/brands");
}

async function deleteBrand(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.brand.delete({
    where: { id },
  });

  revalidatePath("/admin/brands");
}

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">
              Catalog management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              Brands
            </h1>
            <p className="mt-3 text-sm text-neutral-500">
              {brands.length} brand{brands.length === 1 ? "" : "s"} in your store.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-11 items-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-950 hover:text-white"
          >
            Back to admin
          </Link>
        </div>

        <details className="group rounded-[28px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-neutral-950">
            Add brand
          </summary>

          <div className="border-t border-neutral-200 p-5">
            <form action={createBrand} className="flex flex-col gap-3 sm:flex-row">
              <input
                name="name"
                placeholder="Brand name"
                className="h-12 flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
              />
              <button className="h-12 rounded-2xl bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
                Add Brand
              </button>
            </form>
          </div>
        </details>

        <div className="mt-6 space-y-3">
          {brands.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              No brands yet.
            </div>
          ) : (
            brands.map((brand) => (
              <div
                key={brand.id}
                className="flex flex-col gap-4 rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-neutral-950">{brand.name}</p>
                  <p className="mt-1 text-sm text-neutral-500">{brand.slug}</p>
                </div>

                <form action={deleteBrand}>
                  <input type="hidden" name="id" value={brand.id} />
                  <button className="inline-flex h-11 items-center rounded-full border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100">
                    Delete
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}