import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import Link from "next/link";
import Image from "next/image";

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const brandId = String(formData.get("brandId") || "");
  const priceInput = String(formData.get("price") || "0").trim();

  const stockCount = Number(formData.get("stockCount") || 0);
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const featuredOrder = Number(formData.get("featuredOrder") || 999);

  if (!name) return;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const price = Math.round(Number(priceInput) * 100);
  if (!Number.isFinite(price)) return;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      price,
      description: description || null,
      brandId: brandId || null,
      stockCount,
      inStock,
      featured,
      featuredOrder,
    },
  });

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filepath, buffer);

      await prisma.productImage.create({
        data: {
          url: `/uploads/${filename}`,
          productId: product.id,
        },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
}

async function deleteProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
}

export default async function ProductsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    include: { brand: true, images: true },
    orderBy: { createdAt: "desc" },
  });

  const totalProducts = products.length;
  const featuredProducts = products.filter((p) => p.featured).length;
  const inStockProducts = products.filter((p) => p.inStock).length;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">
              Catalog management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Products
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
              Create products, upload images, and control stock and homepage placement from one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-950 hover:text-white"
            >
              Back to admin
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Total products</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-950">{totalProducts}</p>
          </div>
          <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Featured</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-950">{featuredProducts}</p>
          </div>
          <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">In stock</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-950">{inStockProducts}</p>
          </div>
        </div>

        <details className="mt-8 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <summary className="cursor-pointer list-none border-b border-neutral-200 px-5 py-4 text-sm font-medium text-neutral-950">
            Add product
          </summary>

          <form action={createProduct} className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="name"
                placeholder="Product name"
                className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
              />

              <select
                name="brandId"
                className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="Price, example 19.99"
                className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
              />

              <input
                name="stockCount"
                type="number"
                placeholder="Stock count"
                defaultValue={0}
                className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
              />

              <input
                name="featuredOrder"
                type="number"
                placeholder="Homepage order"
                defaultValue={999}
                className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
              />

              <label className="inline-flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="inStock"
                  defaultChecked
                  className="h-4 w-4 rounded border-neutral-300 accent-emerald-600"
                />
                <span>In stock</span>
              </label>

              <label className="inline-flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="featured"
                  className="h-4 w-4 rounded border-neutral-300 accent-emerald-600"
                />
                <span>Show on homepage</span>
              </label>
            </div>

            <textarea
              name="description"
              placeholder="Product description"
              className="mt-4 min-h-[140px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
            />

            <input
              name="images"
              type="file"
              multiple
              accept="image/*"
              className="mt-4 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            />

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-sm text-neutral-500">
                Price is entered in dollars and saved as cents.
              </p>

              <button className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
                Save Product
              </button>
            </div>
          </form>
        </details>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-950">All products</h2>
          </div>

          <div className="divide-y divide-neutral-200">
            {products.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                No products yet. Click Add product to create your first one.
              </div>
            ) : (
              products.map((product) => {
                const imageUrl = product.images[0]?.url || "/bags.png";
                const priceLabel = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(product.price / 100);

                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-neutral-100">
                        <Image src={imageUrl} alt={product.name} fill className="object-cover" />
                      </div>

                      <div>
                        <p className="font-medium text-neutral-950">{product.name}</p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {product.brand?.name || "No brand"} · {priceLabel} ·{" "}
                          {product.inStock ? `Stock: ${product.stockCount}` : "Out of stock"}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {product.featured ? `Featured order: ${product.featuredOrder}` : "Not on homepage"}
                        </p>
                      </div>
                    </div>

                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button className="inline-flex h-11 items-center rounded-full border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100">
                        Delete
                      </button>
                    </form>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}