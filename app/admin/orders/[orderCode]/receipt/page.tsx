import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

type PageProps = {
  searchParams?: Promise<{
    email?: string;
    orderCode?: string;
  }>;
};

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

function paymentClass(paymentStatus: string) {
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

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "In progress";
    case "on_the_way":
      return "In progress";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Delivered";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "pending":
    case "on_the_way":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "delivered":
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
  }
}

function statusStepIndex(status: string) {
  switch (status) {
    case "pending":
      return 0;
    case "on_the_way":
      return 1;
    case "delivered":
      return 2;
    case "completed":
      return 3;
    default:
      return 0;
  }
}

export default async function MyOrdersSearchPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const email = typeof params.email === "string" ? params.email.trim() : "";
  const orderCode =
    typeof params.orderCode === "string" ? params.orderCode.trim() : "";

  const order =
    email && orderCode
      ? await prisma.order.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
            orderCode: { equals: orderCode, mode: "insensitive" },
          },
          include: {
            items: { orderBy: { createdAt: "asc" } },
            history: { orderBy: { createdAt: "asc" } },
          },
        })
      : null;

  const steps = [
    { key: "pending", label: "Placed", icon: Clock3 },
    { key: "on_the_way", label: "On the way", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Package },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
  ] as const;

  const stepIndex = order ? statusStepIndex(order.status) : 0;
  const paid =
    order?.paymentStatus === "paid" || order?.paymentStatus === "success";
  const receiptHref = order
    ? `/my-orders/${order.orderCode}/receipt?email=${encodeURIComponent(
        order.email,
      )}`
    : "#";

  const itemsPreview = order?.items.slice(0, 10) || [];
  const extraCount = Math.max(0, (order?.items.length || 0) - 10);

  return (
    <>
      <NavbarWrapper />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_34%),linear-gradient(to_bottom,_#f8fafc,_#f6f7fb_40%,_#f6f7fb)] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium tracking-wide text-emerald-700">
                ORDER TRACKING
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                Order Result
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-neutral-500 sm:text-base">
                Review your order status, payment details, delivery information,
                and receipt in one clean view.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/my-orders"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
              >
                Search again
              </Link>
            </div>
          </div>

          {!email || !orderCode ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white/90 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <h2 className="text-lg font-semibold text-neutral-950">
                No search details yet
              </h2>
              <p className="mt-2 max-w-xl text-sm text-neutral-500">
                Enter your email and order code to view tracking details.
              </p>
              <div className="mt-5">
                <Link
                  href="/my-orders"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Go back
                </Link>
              </div>
            </div>
          ) : !order ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white/90 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <h2 className="text-lg font-semibold text-neutral-950">
                Order not found
              </h2>
              <p className="mt-2 max-w-xl text-sm text-neutral-500">
                No order matches that email and order code.
              </p>
              <div className="mt-5">
                <Link
                  href="/my-orders"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Try again
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-6 p-6 lg:p-8">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                          Order ID: {order.orderCode}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            paid
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : paymentClass(order.paymentStatus)
                          }`}
                        >
                          {paid ? "Paid" : paymentLabel(order.paymentStatus)}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                            order.status,
                          )}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </div>

                      <div className="mt-5 flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                          <Package className="h-7 w-7" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                            {order.fullName}
                          </h2>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-600">
                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-neutral-400" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-neutral-400" />
                              {order.city}, {order.state}
                            </span>
                            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600">
                              {order.deliveryMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
                      <div className="text-left lg:text-right">
                        <p className="text-3xl font-semibold tracking-tight text-neutral-950">
                          {formatNaira(order.total)}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {order.items.length} item
                          {order.items.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <Link
                        href={receiptHref}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
                      >
                        <FileText className="h-4 w-4" />
                        Download receipt
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
                    <div className="grid gap-4 md:grid-cols-4">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        const active = index <= stepIndex;

                        return (
                          <div
                            key={step.key}
                            className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-3 shadow-sm"
                          >
                            <div
                              className={[
                                "flex h-10 w-10 items-center justify-center rounded-full",
                                active
                                  ? "bg-emerald-700 text-white"
                                  : "bg-neutral-100 text-neutral-400",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-neutral-950">
                                {step.label}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {active ? "Updated" : "Pending"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        Order items
                      </h3>

                      <Link
                        href={receiptHref}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        <FileText className="h-4 w-4" />
                        Receipt
                      </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                      {itemsPreview.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                          No items found.
                        </div>
                      ) : (
                        itemsPreview.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition hover:bg-white"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-neutral-950">
                                {item.name}
                              </p>
                              <p className="mt-1 text-sm text-neutral-500">
                                Qty {item.qty}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-neutral-950">
                              {formatNaira(item.price * item.qty)}
                            </p>
                          </div>
                        ))
                      )}

                      {extraCount > 0 ? (
                        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
                          +{extraCount} more item{extraCount === 1 ? "" : "s"}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      Need help with this order?{" "}
                      <Link href="/contact" className="font-semibold underline">
                        Contact support
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                    <h3 className="text-lg font-semibold text-neutral-950">
                      History
                    </h3>

                    <div className="mt-5 space-y-3">
                      {order.history.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                          No status updates yet.
                        </div>
                      ) : (
                        order.history.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-neutral-950">
                                  {statusLabel(entry.status)}
                                </p>
                                {entry.note ? (
                                  <p className="mt-1 text-sm text-neutral-500">
                                    {entry.note}
                                  </p>
                                ) : null}
                              </div>
                              <span className="shrink-0 text-xs text-neutral-400">
                                {formatDateTime(entry.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <aside className="space-y-6 lg:sticky lg:top-28 self-start">
                  <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        Summary
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                          order.status,
                        )}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    <div className="mt-5 space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Payment</span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            paid
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {paid ? "Paid" : paymentLabel(order.paymentStatus)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Items</span>
                        <span className="font-medium text-neutral-950">
                          {order.items.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Total</span>
                        <span className="text-lg font-semibold text-neutral-950">
                          {formatNaira(order.total)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Date</span>
                        <span className="font-medium text-neutral-950">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                    <h3 className="text-lg font-semibold text-neutral-950">
                      Delivery details
                    </h3>

                    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                      <p className="inline-flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                        <span>
                          {order.street}, {order.city}, {order.state}
                          {order.landmark ? `, ${order.landmark}` : ""}
                        </span>
                      </p>

                      <div className="mt-4 space-y-2">
                        <p>
                          <span className="font-medium text-neutral-950">
                            Delivery method:
                          </span>{" "}
                          {order.deliveryMethod}
                        </p>
                        <p>
                          <span className="font-medium text-neutral-950">
                            Email:
                          </span>{" "}
                          {order.email}
                        </p>
                        <p>
                          <span className="font-medium text-neutral-950">
                            Phone:
                          </span>{" "}
                          {order.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}