import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Package,
  Search,
  Tag,
  Truck,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OrdersSearchBar } from "@/app/components/OrdersSearchBar";
import AdminOrdersToasts from "./AdminOrdersToasts";

type OrdersPageProps = {
  searchParams?: Promise<{
    q?: string;
    payment?: string;
    status?: string;
    page?: string;
  }>;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function paymentLabel(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
    case "success":
      return "Paid";
    case "pending":
      return "Pending payment";
    default:
      return paymentStatus;
  }
}

function paymentBadgeClass(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "border-neutral-200 bg-neutral-100 text-neutral-700";
    case "delivered":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "on_the_way":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-neutral-200 bg-white text-neutral-600";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "on_the_way":
      return "On the way";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Completed";
    default:
      return "Pending";
  }
}

function buildHref(params: {
  q?: string;
  payment?: string;
  status?: string;
  page?: number;
}) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.payment && params.payment !== "all") {
    query.set("payment", params.payment);
  }
  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  const str = query.toString();
  return str ? `/admin/orders?${str}` : "/admin/orders";
}

function filterMatches(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const params = searchParams ? await searchParams : {};

  const q = typeof params.q === "string" ? params.q.trim() : "";
  const payment =
    typeof params.payment === "string" ? params.payment.trim() : "all";
  const status =
    typeof params.status === "string" ? params.status.trim() : "all";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const perPage = 4;

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
      history: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredOrders = orders.filter((order) => {
    const paymentOk = payment === "all" || order.paymentStatus === payment;
    const statusOk = status === "all" || order.status === status;

    const searchOk =
      !q ||
      filterMatches(order.orderCode, q) ||
      filterMatches(order.fullName, q) ||
      filterMatches(order.email, q) ||
      filterMatches(order.phone, q) ||
      filterMatches(order.street, q) ||
      filterMatches(order.city, q) ||
      filterMatches(order.state, q) ||
      order.items.some((item) => filterMatches(item.name, q));

    return paymentOk && statusOk && searchOk;
  });

  const totalCount = filteredOrders.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const visibleOrders = filteredOrders.slice(start, start + perPage);

  const activeFilters = Boolean(q || payment !== "all" || status !== "all");

  return (
    <div className="min-h-screen bg-neutral-50 px-4 pt-8 pb-4 sm:px-6 lg:px-2">
      <AdminOrdersToasts />

      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Orders
            </h1>
            <p className="mt-2 text-[15px] text-neutral-500">
              Manage customer orders and monitor payments.
            </p>
          </div>
        </div>

        <div className="py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <OrdersSearchBar q={q} payment={payment} status={status} />

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Link
                href={buildHref({ q, payment: "all", status: "all" })}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  !activeFilters
                    ? "border-neutral-300 bg-neutral-100 text-neutral-900"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Package className="h-4 w-4" />
                All
              </Link>

              <Link
                href={buildHref({ q, payment: "paid", status })}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  payment === "paid"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Paid
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Link>

              <Link
                href={buildHref({ q, payment: "pending", status })}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  payment === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Clock3 className="h-4 w-4 text-amber-500" />
                Pending payment
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Link>

              <Link
                href={buildHref({ q, payment, status: "on_the_way" })}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  status === "on_the_way"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Truck className="h-4 w-4 text-sky-500" />
                On the way
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Link>

              <Link
                href={buildHref({ q, payment, status: "delivered" })}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  status === "delivered"
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-violet-500" />
                Delivered
              </Link>

              {activeFilters ? (
                <Link
                  href="/admin/orders"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-red-200 bg-red-100 px-4 text-xs font-medium text-red-500 transition hover:bg-neutral-50"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {visibleOrders.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
              No orders found.
            </div>
          ) : (
            visibleOrders.map((order) => {
              const firstImage = order.items[0]?.image || "/bags.png";
              const secondImage = order.items[1]?.image || "/bags.png";
              const paid =
                order.paymentStatus === "paid" ||
                order.paymentStatus === "success";

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.orderCode}`}
                  className="block overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
                >
                  <div className="grid gap-4 p-5 xl:grid-cols-[1.1fr_240px_190px] xl:items-center">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[18px] font-semibold text-neutral-950">
                            {order.fullName}
                          </p>
                        </div>

                        <p className="mt-2 text-[15px] text-neutral-500">
                          {order.email}
                        </p>
                        <p className="mt-1 text-[15px] text-neutral-500">
                          {order.phone}
                        </p>
                        <p className="mt-5 max-w-[430px] text-[15px] text-neutral-600">
                          {order.street}, {order.city}, {order.state}
                        </p>
                      </div>

                      <div className="hidden xl:flex xl:flex-col xl:items-end xl:gap-2">
                        <span className="rounded-xl border border-neutral-200 bg-white px-3 py-1 text-base font-medium text-neutral-700">
                          {order.orderCode}
                        </span>
                        <span
                          className={`rounded-xl border px-3 py-1 text-[12px] font-medium ${
                            paid
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {paid ? "Paid" : paymentLabel(order.paymentStatus)}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-[12px] font-medium ${statusBadgeClass(order.status)}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t border-neutral-200 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                      <div className="flex min-w-[132px] items-start gap-3">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-neutral-100">
                          <Image
                            src={firstImage}
                            alt={order.orderCode}
                            width={80}
                            height={80}
                            className="h-full w-full object-contain p-2"
                          />
                        </div>

                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[14px] bg-neutral-100">
                          <Image
                            src={secondImage}
                            alt={order.orderCode}
                            width={80}
                            height={80}
                            className="h-full w-full object-contain p-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 xl:flex-col xl:items-end xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                      <div className="text-right">
                        <p className="text-[24px] font-semibold tracking-tight text-neutral-950">
                          {formatNaira(order.total)}
                        </p>
                        <p className="mt-2 text-[14px] text-neutral-500">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {pageCount > 1 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              Page {currentPage} of {pageCount}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buildHref({
                  q,
                  payment,
                  status,
                  page: Math.max(1, currentPage - 1),
                })}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
                  currentPage === 1
                    ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Link>

              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={buildHref({ q, payment, status, page: p })}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-xs font-medium transition ${
                      p === currentPage
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}

              <Link
                href={buildHref({
                  q,
                  payment,
                  status,
                  page: Math.min(pageCount, currentPage + 1),
                })}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-medium transition ${
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