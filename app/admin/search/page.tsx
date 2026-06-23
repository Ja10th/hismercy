import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { Box, Tag, Users, Search } from "lucide-react";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminSearchPage({
  searchParams,
}: SearchPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const q = typeof params.q === "string" ? params.q.trim() : "";

  if (!q) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-8">
        <div className="flex items-center gap-3 text-neutral-500">
          <Search className="h-5 w-5" />
          <p>Search products, customers, or brands.</p>
        </div>
      </div>
    );
  }

  const [products, customers, brands] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    prisma.customer.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    }),
    prisma.brand.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-neutral-950">Search results</h1>
        <p className="mt-2 text-sm text-neutral-500">Results for “{q}”</p>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Box className="h-4 w-4 text-neutral-500" />
          <h2 className="text-lg font-semibold">Products</h2>
        </div>

        <div className="space-y-2">
          {products.length === 0 ? (
            <p className="text-sm text-neutral-500">No products found.</p>
          ) : (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products?open=${product.id}&q=${encodeURIComponent(q)}`}
                className="block rounded-2xl border border-neutral-200 px-4 py-3 transition hover:bg-neutral-50"
              >
                <p className="font-medium text-neutral-950">{product.name}</p>
                <p className="text-sm text-neutral-500">{product.slug}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-neutral-500" />
          <h2 className="text-lg font-semibold">Customers</h2>
        </div>

        <div className="space-y-2">
          {customers.length === 0 ? (
            <p className="text-sm text-neutral-500">No customers found.</p>
          ) : (
            customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="block rounded-2xl border border-neutral-200 px-4 py-3 transition hover:bg-neutral-50"
              >
                <p className="font-medium text-neutral-950">{customer.fullName}</p>
                <p className="text-sm text-neutral-500">{customer.email}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4 text-neutral-500" />
          <h2 className="text-lg font-semibold">Brands</h2>
        </div>

        <div className="space-y-2">
          {brands.length === 0 ? (
            <p className="text-sm text-neutral-500">No brands found.</p>
          ) : (
            brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/admin/brands/${brand.id}`}
                className="block rounded-2xl border border-neutral-200 px-4 py-3 transition hover:bg-neutral-50"
              >
                <p className="font-medium text-neutral-950">{brand.name}</p>
                <p className="text-sm text-neutral-500">{brand.slug}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}