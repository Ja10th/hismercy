import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineStar } from "react-icons/md";
import {
  Camera,
  Grid2X2,
  LayoutList,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  X,
  Package,
  Check,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import ProductsToolbar from "@/app/components/ProductsToolBar";

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

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    brand?: string;
    status?: string;
    sort?: string;
    view?: string;
    page?: string;
    open?: string;
  }>;
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

function truncate(text: string, length = 110) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

function buildProductsHref(
  current: {
    q?: string;
    brand?: string;
    status?: string;
    sort?: string;
    view?: string;
  },
  overrides: Partial<{
    q: string;
    brand: string;
    status: string;
    sort: string;
    view: string;
  }> = {},
) {
  const params = new URLSearchParams();

  const q = overrides.q ?? current.q;
  const brand = overrides.brand ?? current.brand;
  const status = overrides.status ?? current.status;
  const sort = overrides.sort ?? current.sort;
  const view = overrides.view ?? current.view;

  if (q) params.set("q", q);
  if (brand) params.set("brand", brand);
  if (status && status !== "all") params.set("status", status);
  if (sort && sort !== "featured") params.set("sort", sort);
  if (view && view !== "grid") params.set("view", view);

  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

function buildProductsPageHref(
  current: {
    q?: string;
    brand?: string;
    status?: string;
    sort?: string;
    view?: string;
  },
  page: number,
) {
  const params = new URLSearchParams();

  if (current.q) params.set("q", current.q);
  if (current.brand) params.set("brand", current.brand);
  if (current.status && current.status !== "all") params.set("status", current.status);
  if (current.sort && current.sort !== "featured") params.set("sort", current.sort);
  if (current.view && current.view !== "grid") params.set("view", current.view);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
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

  if (!id || !name) return;

  const price = Math.round(Number(priceInput) * 100);
  if (!Number.isFinite(price)) return;

  const slug = await resolveProductSlug(name, brandId, id);

  await prisma.product.update({
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

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > 0) {
    const uploadedUrls = await saveUploadedImagesToDisk(files);

    for (const url of uploadedUrls) {
      await prisma.productImage.create({
        data: {
          url,
          productId: id,
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
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
      />

      <select
        name="brandId"
        defaultValue={product?.brandId || ""}
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
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
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
      />

      <input
        name="stockCount"
        type="number"
        defaultValue={product?.stockCount ?? 0}
        placeholder="Stock count"
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
      />

      <input
        name="featuredOrder"
        type="number"
        defaultValue={product?.featuredOrder ?? 999}
        placeholder="Homepage order"
        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
      />

      <label className="inline-flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="inStock"
          defaultChecked={product ? product.inStock : true}
          className="h-4 w-4 rounded border-neutral-300 accent-emerald-900"
        />
        <span>In stock</span>
      </label>

      <label className="inline-flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={product?.featured ?? false}
          className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
        />
        <span>Show on homepage</span>
      </label>

      <textarea
        name="description"
        defaultValue={product?.description || ""}
        placeholder="Product description"
        className="md:col-span-2 min-h-[140px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
      />

      <input
        name="images"
        type="file"
        multiple
        accept="image/*"
        className="md:col-span-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
      />
    </div>
  );
}

function ProductEditorModal({
  modalId,
  product,
  brands,
  defaultChecked = false,
}: {
  modalId: string;
  product: ProductItem;
  brands: BrandOption[];
  defaultChecked?: boolean;
}) {
  const imageUrl = product.images[0]?.url || "/bags.png";

  return (
    <div className="relative">
      <input
        id={modalId}
        type="checkbox"
        className="peer sr-only"
        defaultChecked={defaultChecked}
      />

      <div className="fixed inset-0 z-50 hidden items-center justify-center p-4 peer-checked:flex">
        <label
          htmlFor={modalId}
          className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        />

        <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-950">
                Edit product
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Update the product details and save changes.
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
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-base font-semibold text-neutral-950">
                  {product.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {product.brand?.name || "No brand"}
                </p>
                <p className="text-sm text-neutral-500">
                  {formatNaira(product.price)}
                </p>
                <p className="break-all text-xs text-neutral-400">
                  {product.slug}
                </p>
              </div>
            </div>

            <form action={updateProduct} className="p-5 sm:p-6">
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

                  <button className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
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

function AddProductModal({ brands }: { brands: BrandOption[] }) {
  const modalId = "add-product-modal";

  return (
    <div className="relative">
      <input id={modalId} type="checkbox" className="peer sr-only" />

      <label
        htmlFor={modalId}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
      >
        <Plus className="h-4 w-4" />
        Add Product
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
                  className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  Cancel
                </label>

                <button className="inline-flex h-11 items-center rounded-xl bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
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

function ActionsMenu({
  editModalId,
  productId,
  deleteAction,
}: {
  editModalId: string;
  productId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <details className="relative ml-auto group">
      <summary className="list-none inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100 [&::-webkit-details-marker]:hidden">
        <MoreVertical className="h-5 w-5" />
      </summary>

      <div className="absolute -top-28 right-0 z-20 mt-2 w-40 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
        <label
          htmlFor={editModalId}
          className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-neutral-700 transition hover:bg-neutral-100"
        >
          <PencilLine className="h-4 w-4" />
          Edit
        </label>

        <form action={deleteAction}>
          <input type="hidden" name="id" value={productId} />
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </form>
      </div>
    </details>
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
  const editModalId = `edit-product-${product.id}`;

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className="relative aspect-[6/3] bg-neutral-50">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain p-6 h-20 w-auto transition-transform duration-700 group-hover:scale-[1.03]"
        />

        {product.featured ? (
          <span className="absolute left-4 top-4 rounded-full font-medium text-white">
            <MdOutlineStar className="h-4 w-4 text-yellow-500" />
          </span>
        ) : null}
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
            <p className="text-[20px] font-semibold text-neutral-950">
              {formatNaira(product.price)}
            </p>
            <p className="mt-1 break-all text-xs text-neutral-400">
              {product.slug}
            </p>
          </div>
        </div>

        <p
          className="mt-4 text-sm leading-6 text-neutral-600"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description || "No description added yet."}
        </p>

        <div className=" mt-5 flex justify-between items-center gap-2 transform transition duration-700 ease-in-out">
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              <Package className="h-3.5 w-3.5" />
              Stock: {product.stockCount}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              <Camera className="h-3.5 w-3.5" />
              {product.images.length} image
              {product.images.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="hidden group-hover:flex transform transition duration-700 ease-in-out absolute bottom-0 right-0 p-4">
            <ActionsMenu
              editModalId={editModalId}
              productId={product.id}
              deleteAction={deleteProduct}
            />
          </div>
        </div>
      </div>

      <ProductEditorModal
        modalId={editModalId}
        product={product}
        brands={brands}
      />
    </div>
  );
}

function ProductRow({
  product,
  brands,
}: {
  product: ProductItem;
  brands: BrandOption[];
}) {
  const imageUrl = product.images[0]?.url || "/bags.png";
  const editModalId = `edit-product-row-${product.id}`;

  return (
    <div className="overflow-hidden rounded-[26px] border border-neutral-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-neutral-50 lg:h-24 lg:w-24 lg:shrink-0">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-3"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="relative flex flex-wrap items-center gap-2">
                {product.featured ? (
                  <span className=" rounded-full font-medium text-white">
                    <MdOutlineStar className="h-4 w-4 text-yellow-500" />
                  </span>
                ) : null}
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-600">
                  {product.brand?.name || "No brand"}
                </span>
              </div>

              <h2 className="mt-3 text-lg font-semibold text-neutral-950">
                {product.name}
              </h2>

              <p
                className="mt-2 text-sm leading-6 text-neutral-600"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.description || "No description added yet."}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xl font-semibold text-neutral-950">
                {formatNaira(product.price)}
              </p>
              <p className="mt-1 text-xs text-neutral-400 break-all">
                {product.slug}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              <Package className="h-3.5 w-3.5" />
              Stock: {product.stockCount}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              <Camera className="h-3.5 w-3.5" />
              {product.images.length} image
              {product.images.length === 1 ? "" : "s"}
            </span>

            {!product.inStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                Out of stock
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:flex-col lg:items-end">
          <label
            htmlFor={editModalId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </label>

          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </form>
        </div>
      </div>

      <ProductEditorModal
        modalId={editModalId}
        product={product}
        brands={brands}
      />
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = searchParams ? await searchParams : {};

  const q = typeof params.q === "string" ? params.q.trim() : "";
  const brand = typeof params.brand === "string" ? params.brand.trim() : "";
  const status =
    typeof params.status === "string" ? params.status.trim() : "all";
  const sort =
    typeof params.sort === "string" ? params.sort.trim() : "featured";
  const view = params.view === "list" ? "list" : "grid";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const openId = typeof params.open === "string" ? params.open.trim() : "";
  const perPage = 6;

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  if (brand) {
    where.brandId = brand;
  }

  if (status === "in_stock") {
    where.inStock = true;
  } else if (status === "out_of_stock") {
    where.inStock = false;
  } else if (status === "featured") {
    where.featured = true;
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : sort === "name_asc"
          ? { name: "asc" as const }
          : sort === "oldest"
            ? { createdAt: "asc" as const }
            : [
                { featured: "desc" as const },
                { featuredOrder: "asc" as const },
                { createdAt: "desc" as const },
              ];

  const totalCount = await prisma.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const currentPage = Math.min(page, pageCount);
  const skip = (currentPage - 1) * perPage;

  const products = await prisma.product.findMany({
    where,
    include: {
      brand: true,
      images: true,
    },
    orderBy,
    skip,
    take: perPage,
  });

  const openProductRaw = openId
    ? await prisma.product.findUnique({
        where: { id: openId },
        include: {
          brand: true,
          images: true,
        },
      })
    : null;

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

  const openProduct: ProductItem | null = openProductRaw
    ? {
        id: openProductRaw.id,
        name: openProductRaw.name,
        slug: openProductRaw.slug,
        price: openProductRaw.price,
        description: openProductRaw.description,
        inStock: openProductRaw.inStock,
        stockCount: openProductRaw.stockCount,
        featured: openProductRaw.featured,
        featuredOrder: openProductRaw.featuredOrder,
        brandId: openProductRaw.brandId,
        brand: openProductRaw.brand
          ? {
              id: openProductRaw.brand.id,
              name: openProductRaw.brand.name,
              slug: openProductRaw.brand.slug,
            }
          : null,
        images: openProductRaw.images.map((image) => ({
          id: image.id,
          url: image.url,
        })),
      }
    : null;

  const currentQuery = { q, brand, status, sort, view };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 pt-9 pb-3 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-400">
        {openProduct ? (
          <ProductEditorModal
            modalId="search-open-product"
            product={openProduct}
            brands={typedBrands}
            defaultChecked
          />
        ) : null}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Products
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Manage your products and inventory.
            </p>
          </div>

          <AddProductModal brands={typedBrands} />
        </div>

        <ProductsToolbar brands={typedBrands} currentQuery={currentQuery} />

        <div className="mt-5">
          {typedProducts.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-neutral-300 bg-white p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-neutral-300" />
              <h2 className="mt-4 text-lg font-semibold text-neutral-950">
                No products found
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Try a different search or add a new product.
              </p>

              <div className="mt-6 flex justify-center">
                <AddProductModal brands={typedBrands} />
              </div>
            </div>
          ) : view === "list" ? (
            <div className="space-y-4">
              {typedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  brands={typedBrands}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {typedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brands={typedBrands}
                />
              ))}
            </div>
          )}

          {pageCount > 1 ? (
            <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-500">
                Showing {skip + 1} to {Math.min(skip + perPage, totalCount)} of{" "}
                {totalCount} products
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={buildProductsPageHref(
                    currentQuery,
                    Math.max(1, currentPage - 1),
                  )}
                  className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                    currentPage === 1
                      ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  Prev
                </Link>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildProductsPageHref(currentQuery, p)}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-xs font-medium transition ${
                      p === currentPage
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                <Link
                  href={buildProductsPageHref(
                    currentQuery,
                    Math.min(pageCount, currentPage + 1),
                  )}
                  className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                    currentPage === pageCount
                      ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  Next
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}