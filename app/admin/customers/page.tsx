import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  ChevronDown,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CustomersToolbar } from "@/app/components/customers-toolbar";

type CustomersPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

type CustomerStatusFilter = "all" | "subscribed" | "pending" | "not_subscribed";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function subscriptionLabel(hasPaidRevenue: boolean, hasOrders: boolean) {
  if (hasPaidRevenue) return "Subscribed";
  if (hasOrders) return "Pending";
  return "Not subscribed";
}

function subscriptionClass(hasPaidRevenue: boolean, hasOrders: boolean) {
  if (hasPaidRevenue) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (hasOrders) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-red-200 bg-red-50 text-red-600";
}

function RowActions({ customerId }: { customerId: string }) {
  return (
    <details className="relative">
      <summary className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
        <MoreHorizontal className="h-4 w-4" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
        <Link href={`/admin/customers/${customerId}`} className="block px-4 py-3 text-sm hover:bg-neutral-50">
          View
        </Link>
        <Link href={`/admin/customers/${customerId}/edit`} className="block px-4 py-3 text-sm hover:bg-neutral-50">
          Edit
        </Link>
        <button type="button" className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50">
          Delete
        </button>
      </div>
    </details>
  );
}

function buildHref(params: { q?: string; status?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const str = query.toString();
  return str ? `/admin/customers?${str}` : "/admin/customers";
}

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = (params.status as CustomerStatusFilter) ?? "all";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const perPage = 7;

  const [allCustomers, paidStats] = await Promise.all([
    prisma.customer.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { street: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { state: { contains: q, mode: "insensitive" } },
              { landmark: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        _count: { select: { orders: true } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 2,
          select: {
            id: true,
            orderCode: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: {
        paymentStatus: { in: ["paid", "success"] },
      },
      _sum: { total: true },
      _count: { _all: true },
      _max: { createdAt: true },
    }),
  ]);

  const paidStatsMap = new Map(
    paidStats.map((row) => [
      row.customerId,
      {
        revenue: row._sum.total || 0,
        paidCount: row._count._all,
        lastPaidAt: row._max.createdAt,
      },
    ]),
  );

  const filteredCustomers = allCustomers.filter((customer) => {
    const stats = paidStatsMap.get(customer.id);
    const hasPaidRevenue = (stats?.revenue || 0) > 0;
    const hasOrders = customer._count.orders > 0;

    if (status === "subscribed") return hasPaidRevenue;
    if (status === "pending") return !hasPaidRevenue && hasOrders;
    if (status === "not_subscribed") return !hasPaidRevenue && !hasOrders;
    return true;
  });

  const totalCount = filteredCustomers.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const customers = filteredCustomers.slice(start, start + perPage);

  const paidCustomers = filteredCustomers.filter(
    (customer) => (paidStatsMap.get(customer.id)?.revenue || 0) > 0,
  );

  const basePercent =
    filteredCustomers.length === 0
      ? 0
      : Math.round((paidCustomers.length / filteredCustomers.length) * 100);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 pb-4 pt-8 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Customers
            </h1>
            <p className="mt-2 text-[15px] text-neutral-500">
              Saved customer records and order history.
            </p>
          </div>
        </div>

        <CustomersToolbar
          query={q}
          status={status}
          totalCount={filteredCustomers.length}
          paidPercent={basePercent}
        />

        <div className="mt-4 overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="w-[28px] px-4 py-4 text-left text-xs font-medium text-neutral-500">
                    <span className="inline-flex h-4 w-4 rounded border border-neutral-300 bg-white" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Customers
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Email Subscription
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Location
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Orders
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Amount Spent
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const stats = paidStatsMap.get(customer.id);
                    const hasPaidRevenue = (stats?.revenue || 0) > 0;
                    const hasOrders = customer._count.orders > 0;

                    return (
                      <tr key={customer.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                        <td className="px-4 py-4 align-middle">
                          <input
                            type="checkbox"
                            aria-label={`Select ${customer.fullName}`}
                            className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                          />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                              <UserRound className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-[15px] font-medium text-neutral-950">
                                {customer.fullName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-medium ${subscriptionClass(
                              hasPaidRevenue,
                              hasOrders,
                            )}`}
                          >
                            {subscriptionLabel(hasPaidRevenue, hasOrders)}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <div className="text-sm text-neutral-500">
                            <p>
                              {customer.city}, {customer.state}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <p className="text-sm text-neutral-700">
                            {customer._count.orders} Order
                            {customer._count.orders === 1 ? "" : "s"}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <p className="text-sm font-medium text-neutral-700">
                            {formatNaira(stats?.revenue || 0)}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <RowActions customerId={customer.id} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {pageCount > 1 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Page {currentPage} of {pageCount}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buildHref({ q, status, page: Math.max(1, currentPage - 1) })}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  currentPage === 1
                    ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Link>

              {Array.from({ length: pageCount }, (_, index) => index + 1).map((p) => (
                <Link
                  key={p}
                  href={buildHref({ q, status, page: p })}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-sm font-medium transition ${
                    p === currentPage
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </Link>
              ))}

              <Link
                href={buildHref({ q, status, page: Math.min(pageCount, currentPage + 1) })}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  currentPage === pageCount
                    ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}