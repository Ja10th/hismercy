import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import Image from "next/image";
import {
  Plus,
  PencilLine,
  X,
  Package,
  Tag,
  Trash2,
  Camera,
} from "lucide-react";
import { Fragment } from "react";

type BrandOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  featuredOrder: number;
  brandId: string | null;
  brand: BrandOption | null;
  images: {
    id: string;
    url: string;
  }[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

function truncate(text: string, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

async function getUniqueProductSlug(baseSlug: string, excludeId?: string) {
  const existing = await prisma.product.findMany({
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

async function resolveProductSlug(
  name: string,
  brandId: string,
  excludeId?: string,
) {
  const brand = brandId
    ? await prisma.brand.findUnique({
        where: { id: brandId },
        select: { slug: true },
      })
    : null;

  const brandSlug = brand?.slug || "general";
  const baseSlug = slugify(`${brandSlug}-${name}`);

  return getUniqueProductSlug(baseSlug, excludeId);
}

async function saveUploadedImagesToDisk(files: File[]) {
  const urls: string[] = [];

  if (files.length === 0) return urls;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filepath, buffer);
    urls.push(`/uploads/${filename}`);
  }

  return urls;
}

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

  const price = Math.round(Number(priceInput) * 100);
  if (!Number.isFinite(price)) return;

  const slug = await resolveProductSlug(name, brandId);

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const uploadedUrls = await saveUploadedImagesToDisk(files);

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

  for (const url of uploadedUrls) {
    await prisma.productImage.create({
      data: {
        url,
        productId: product.id,
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");

  redirect("/admin/products");
}

async function updateProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const brandId = String(formData.get("brandId") || "");
  const priceInput = String(formData.get("price") || "0").trim();

  const stockCount = Number(formData.get("stockCount") || 0);
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const featuredOrder = Number(formData.get("featuredOrder") || 999);
  const primaryImageId = String(formData.get(`primaryImageId-${id}`) || "");

  if (!id || !name) return;

  const price = Math.round(Number(priceInput) * 100);
  if (!Number.isFinite(price)) return;

  const slug = await resolveProductSlug(name, brandId, id);

  const existingImages = await prisma.productImage.findMany({
    where: { productId: id },
    select: { id: true, url: true },
  });

  const selectedPrimary =
    existingImages.find((image) => image.id === primaryImageId) ||
    existingImages[0] ||
    null;

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const uploadedUrls = await saveUploadedImagesToDisk(files);

  const orderedUrls = [
    ...(selectedPrimary ? [selectedPrimary.url] : []),
    ...existingImages
      .filter((image) => image.id !== selectedPrimary?.id)
      .map((image) => image.url),
    ...uploadedUrls,
  ];

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
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

    await tx.productImage.deleteMany({
      where: { productId: id },
    });

    for (const url of orderedUrls) {
      await tx.productImage.create({
        data: {
          productId: id,
          url,
        },
      });
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);

  redirect("/admin/products");
}

async function deleteProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({
      where: { productId: id },
    });

    await tx.product.delete({
      where: { id },
    });
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");

  if (product?.slug) {
    revalidatePath(`/shop/${product.slug}`);
  }

  redirect("/admin/products");
}

function ProductFields({
  brands,
  product,
}: {
  brands: BrandOption[];
  product?: ProductItem;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <input
        name="name"
        defaultValue={product?.name || ""}
        placeholder="Product name"
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
      />

      <select
        name="brandId"
        defaultValue={product?.brandId || ""}
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
        defaultValue={product ? (product.price / 100).toFixed(2) : ""}
        placeholder="Price in naira"
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
      />

      <input
        name="stockCount"
        type="number"
        defaultValue={product?.stockCount ?? 0}
        placeholder="Stock count"
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
      />

      <input
        name="featuredOrder"
        type="number"
        defaultValue={product?.featuredOrder ?? 999}
        placeholder="Homepage order"
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
      />

      <label className="inline-flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="inStock"
          defaultChecked={product ? product.inStock : true}
          className="h-4 w-4 rounded border-neutral-300 accent-emerald-600"
        />
        <span>In stock</span>
      </label>

      <label className="inline-flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={product?.featured ?? false}
          className="h-4 w-4 rounded border-neutral-300 accent-emerald-600"
        />
        <span>Show on homepage</span>
      </label>

      <textarea
        name="description"
        defaultValue={product?.description || ""}
        placeholder="Product description"
        className="md:col-span-2 min-h-[140px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:bg-white"
      />

      <input
        name="images"
        type="file"
        multiple
        accept="image/*"
        className="md:col-span-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
      />
    </div>
  );
}

function AddProductModal({ brands }: { brands: BrandOption[] }) {
  const modalId = "add-product-modal";

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

        <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">
                Add product
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Create a new product and upload its images.
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

          <form
            action={createProduct}
            className="max-h-[90vh] overflow-y-auto p-5 sm:p-6"
          >
            <ProductFields brands={brands} />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-500">
                Prices are entered in naira and saved in kobo.
              </p>

              <div className="flex items-center gap-3">
                <label
                  htmlFor={modalId}
                  className="inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  Cancel
                </label>

                <button className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
                  Save Product
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({
  product,
  brands,
}: {
  product: ProductItem;
  brands: BrandOption[];
}) {
  const modalId = `edit-product-${product.id}`;
  const formId = `edit-form-${product.id}`;
  const imageUrl = product.images[0]?.url || "/bags.png";
  const primarySelectName = `primaryImageId-${product.id}`;

  return (
    <div className="relative">
      <input id={modalId} type="checkbox" className="peer sr-only" />

      <div className="fixed inset-0 z-50 hidden items-center justify-center p-4 peer-checked:flex">
        <label
          htmlFor={modalId}
          className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        />

        <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">
                Edit product
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Pick the main image, then save changes.
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

          <div className="grid max-h-[90vh] overflow-y-auto lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="border-b border-neutral-200 bg-neutral-50 p-5 lg:border-b-0 lg:border-r">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100">
                {product.images.length > 0 ? (
                  product.images.map((image, index) => {
                    const radioId = `${modalId}-image-${image.id}`;

                    return (
                      <Fragment key={image.id}>
                        <input
                          id={radioId}
                          type="radio"
                          name={primarySelectName}
                          form={formId}
                          value={image.id}
                          defaultChecked={index === 0}
                          className="peer sr-only"
                        />

                        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 peer-checked:opacity-100">
                          <Image
                            src={image.url}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                      </Fragment>
                    );
                  })
                ) : (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                )}
              </div>

              {product.images.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {product.images.map((image) => {
                    const radioId = `${modalId}-image-${image.id}`;

                    return (
                      <label
                        key={image.id}
                        htmlFor={radioId}
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-neutral-400"
                      >
                        <Image
                          src={image.url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </label>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-neutral-950">
                  {product.name}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {product.brand?.name || "No brand"}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatNaira(product.price)}
                </p>
              </div>
            </div>

            <form id={formId} action={updateProduct} className="p-5 sm:p-6">
              <input type="hidden" name="id" value={product.id} />

              <ProductFields brands={brands} product={product} />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500">
                  Existing images stay. New uploads will be added.
                </p>

                <div className="flex items-center gap-3">
                  <label
                    htmlFor={modalId}
                    className="inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Cancel
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  brands,
}: {
  product: ProductItem;
  brands: BrandOption[];
}) {
  const imageUrl = product.images[0]?.url || "/bags.png";

  return (
    <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white">
      <div className="relative aspect-[5/3] bg-neutral-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain"
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.featured ? (
            <span className="rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-medium text-white">
              Featured
            </span>
          ) : null}

          {!product.inStock ? (
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-900">
              Out of stock
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-neutral-950">
              {product.name}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
              <Tag className="h-4 w-4" />
              {product.brand?.name || "No brand"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xl font-semibold text-neutral-950">
              {formatNaira(product.price)}
            </p>
            <p className="mt-1 break-all text-xs text-neutral-400">
              {product.slug}
            </p>
          </div>
        </div>

        {product.description ? (
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            {truncate(product.description)}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            No description added yet.
          </p>
        )}
        <div className="flex justify-between">
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              <Package className="h-3.5 w-3.5" />
              {product.inStock
                ? `Stock: ${product.stockCount}`
                : "Out of stock"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              <Camera className="h-3.5 w-3.5" />
              {product.images.length} image
              {product.images.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <label
              htmlFor={`edit-product-${product.id}`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm font-medium text-black transition hover:border-neutral-300 hover:bg-neutral-100"
            >
              <PencilLine className="h-4 w-4" />
            </label>

            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <EditProductModal product={product} brands={brands} />
    </div>
  );
}

export default async function ProductsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    include: { brand: true, images: true },
    orderBy: { createdAt: "desc" },
  });

  const typedBrands: BrandOption[] = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
  }));

  const typedProducts: ProductItem[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    description: product.description,
    inStock: product.inStock,
    stockCount: product.stockCount,
    featured: product.featured,
    featuredOrder: product.featuredOrder,
    brandId: product.brandId,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
        }
      : null,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
    })),
  }));

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-8xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl ">
              Products
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Manage your products. Add, edit, delete as you wish!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AddProductModal brands={typedBrands} />
          </div>
        </div>

        {typedProducts.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-neutral-300 bg-white p-10 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <Package className="mx-auto h-10 w-10 text-neutral-300" />
            <h2 className="mt-4 text-lg font-semibold text-neutral-950">
              No products yet
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Add your first product to get started.
            </p>

            <div className="mt-6 flex justify-center">
              <AddProductModal brands={typedBrands} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {typedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                brands={typedBrands}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
