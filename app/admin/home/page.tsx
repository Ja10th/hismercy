import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function updateHomepageProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const featured = formData.get("featured") === "on";
  const featuredOrder = Number(formData.get("featuredOrder") || 999);

  if (!id) return;

  await prisma.product.update({
    where: { id },
    data: { featured, featuredOrder },
  });

  revalidatePath("/admin/home");
  revalidatePath("/");
}

export default async function HomeProductsPage() {
  const products = await prisma.product.findMany({
    include: { brand: true, images: true },
    orderBy: [{ featured: "desc" }, { featuredOrder: "asc" }],
  });

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              Homepage Products
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Choose which products appear on the homepage and set their order.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-950 hover:text-white"
          >
            Back to admin
          </Link>
        </div>

        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              No products found.
            </div>
          ) : (
            products.map((product) => (
              <form
                key={product.id}
                action={updateHomepageProduct}
                className="flex flex-col gap-4 rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-medium text-neutral-950">{product.name}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {product.brand?.name || "No brand"}
                  </p>
                </div>

                <input type="hidden" name="id" value={product.id} />

                <label className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={product.featured}
                    className="h-4 w-4 rounded border-neutral-300 accent-emerald-600"
                  />
                  <span>Show on homepage</span>
                </label>

                <input
                  name="featuredOrder"
                  type="number"
                  defaultValue={product.featuredOrder}
                  className="h-11 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white md:w-32"
                />

                <button className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
                  Save
                </button>
              </form>
            ))
          )}
        </div>
      </div>
    </div>
  );
}