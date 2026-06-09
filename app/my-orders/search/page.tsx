import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  Headphones,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { TfiArrowLeft } from "react-icons/tfi";

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
      return "Pending";
    default:
      return paymentStatus;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Placed";
    case "on_the_way":
      return "On the way";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Completed";
    default:
      return status;
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

  const previousOrders =
    email.length > 0
      ? await prisma.order.findMany({
          where: {
            email: { equals: email, mode: "insensitive" },
            ...(order ? { id: { not: order.id } } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            items: {
              orderBy: { createdAt: "asc" },
              take: 1,
            },
          },
        })
      : [];

  const steps = [
    { key: "pending", label: "Placed", icon: Clock3 },
    { key: "on_the_way", label: "On the way", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Package },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
  ] as const;

  const stepIndex = order ? statusStepIndex(order.status) : 0;
  const paid =
    order?.paymentStatus === "paid" || order?.paymentStatus === "success";

  const itemsPreview = order?.items.slice(0, 4) || [];
  const extraCount = Math.max(0, (order?.items.length || 0) - 4);

  const receiptHref = order
    ? `/api/my-orders/${order.orderCode}/receipt?email=${encodeURIComponent(order.email)}`
    : "#";

  // ── Shared card shell ────────────────────────────────────────────────────────
  function Card({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div
        className={`overflow-hidden rounded-[24px] border border-neutral-200 bg-white ${className}`}
      >
        {children}
      </div>
    );
  }

  function CardHeader({
    icon: Icon,
    title,
    action,
  }: {
    icon: React.ElementType;
    title: string;
    action?: React.ReactNode;
  }) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
            <Icon className="h-3.5 w-3.5 text-emerald-700" />
          </div>
          <h3 className="text-[15px] font-semibold text-neutral-950">
            {title}
          </h3>
        </div>
        {action}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen px-4 pb-16 pt-24 md:pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Top bar */}
          <div className="mb-7 flex items-center gap-4">
            <Link
              href="/my-orders"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50"
            >
              <TfiArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <p className="hidden text-sm text-neutral-500 md:block">
              Order tracking
            </p>
          </div>

          {/* ── No search params ─────────────────────────────────────────────── */}
          {!email || !orderCode ? (
            <Card>
              <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Search result
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                  <Package className="h-6 w-6 text-neutral-300" />
                </div>
                <div>
                  <p className="text-base font-semibold text-neutral-950">
                    No search yet
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-neutral-500">
                    Enter your email address and order code to look up your
                    order.
                  </p>
                </div>
                <Link
                  href="/my-orders"
                  className="mt-1 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-emerald-800"
                >
                  Search orders
                </Link>
              </div>
            </Card>
          ) : /* ── Order not found ──────────────────────────────────────────────── */
          !order ? (
            <Card>
              <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Search result
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-100 bg-red-50">
                  <Package className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-neutral-950">
                    No order found
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-neutral-500">
                    We couldn&apos;t find{" "}
                    <span className="font-medium text-neutral-700">
                      {orderCode}
                    </span>{" "}
                    for that email address. Check your details and try again.
                  </p>
                </div>
                <Link
                  href="/my-orders"
                  className="mt-1 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-emerald-800"
                >
                  Try again
                </Link>
              </div>
            </Card>
          ) : (
            /* ── Order found ──────────────────────────────────────────────────── */
            <div className="space-y-5">
              {/* Order header + progress */}
              <Card>
                {/* Header row */}
                <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between md:px-6 md:py-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                        {order.fullName}
                      </span>
                      <span className="hidden h-3.5 w-px bg-neutral-200 md:block" />
                      <span className="text-xs text-neutral-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-3 font-mono text-[26px] font-semibold tracking-wider text-neutral-950 md:text-[30px]">
                      {order.orderCode}
                    </h2>
                  </div>

                  <div className="shrink-0">
                    <p className="text-right text-xs font-semibold uppercase tracking-widest text-neutral-400">
                      Total
                    </p>
                    <p className="mt-1 text-[28px] font-semibold tracking-tight text-neutral-950 md:text-[32px]">
                      {formatNaira(order.total)}
                    </p>
                  </div>
                </div>

                {/* Progress steps */}
                <div className="border-t border-neutral-100 px-5 py-5 md:px-6">
                  <div className="flex items-center">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const active = index <= stepIndex;
                      const last = index === steps.length - 1;

                      return (
                        <div
                          key={step.key}
                          className="flex flex-1 items-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={[
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                                active
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-neutral-200 bg-white text-neutral-300",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <p
                              className={[
                                " text-xs font-medium sm:block",
                                active
                                  ? "text-neutral-950"
                                  : "text-neutral-400",
                              ].join(" ")}
                            >
                              {step.label}
                            </p>
                          </div>

                          {!last && (
                            <div
                              className={[
                                "mx-2 h-px flex-1 transition-colors sm:mx-3",
                                index < stepIndex
                                  ? "bg-emerald-500"
                                  : "bg-neutral-200",
                              ].join(" ")}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Main grid */}
              <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                  {/* Order items */}
                  <Card>
                    <CardHeader
                      icon={Package}
                      title="Order items"
                      action={
                        <Link
                          href={receiptHref}
                          className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-700 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Receipt
                        </Link>
                      }
                    />

                    <div className="p-5">
                      {itemsPreview.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-[18px] border border-dashed border-neutral-200 bg-neutral-50 py-10 text-center">
                          <Package className="h-6 w-6 text-neutral-300" />
                          <p className="text-sm text-neutral-400">
                            No items on this order.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {itemsPreview.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3 rounded-[18px] border border-neutral-100 bg-neutral-50 p-3.5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                                  <Image
                                    src={item.image || "/bags.png"}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-1.5"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-neutral-950">
                                    {item.name}
                                  </p>
                                  <p className="mt-0.5 text-xs text-neutral-400">
                                    Qty {item.qty}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold text-neutral-950">
                                  {formatNaira(item.price * item.qty)}
                                </p>
                                {index === itemsPreview.length - 1 &&
                                  extraCount > 0 && (
                                    <p className="mt-0.5 text-xs text-neutral-400">
                                      +{extraCount} more
                                    </p>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Previous orders */}
                  <Card>
                    <CardHeader icon={Clock3} title="Previous orders" />

                    <div className="p-5">
                      {previousOrders.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-[18px] border border-dashed border-neutral-200 bg-neutral-50 py-10 text-center">
                          <Clock3 className="h-6 w-6 text-neutral-300" />
                          <p className="text-sm text-neutral-400">
                            No other orders for this email.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {previousOrders.map((prev) => (
                            <div
                              key={prev.id}
                              className="flex items-start justify-between gap-3 rounded-[18px] border border-emerald-100 bg-[#f1fbf4] p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white bg-white">
                                  <Image
                                    src={prev.items[0]?.image || "/bags.png"}
                                    alt={prev.orderCode}
                                    fill
                                    className="object-contain p-1.5"
                                  />
                                </div>
                                <div>
                                  <p className="font-mono text-sm font-semibold text-neutral-950">
                                    {prev.orderCode}
                                  </p>
                                  <p className="mt-0.5 text-xs text-neutral-500">
                                    {formatDate(prev.createdAt)}
                                  </p>
                                  <span className="mt-1.5 inline-block rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                    {statusLabel(prev.status)}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold text-neutral-950">
                                  {formatNaira(prev.total)}
                                </p>
                                <p className="mt-0.5 text-xs text-neutral-400">
                                  {prev.items.length} item
                                  {prev.items.length === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Support banner */}
                  <div className="rounded-[22px] border border-emerald-100 bg-[#f1fbf4] px-5 py-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white">
                          <Headphones className="h-4 w-4 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-950">
                            Need help with this order?
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            Our team is available to assist you.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <Link
                          href="/faq"
                          className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:bg-emerald-50"
                        >
                          <CircleHelp className="h-3.5 w-3.5" />
                          FAQs
                        </Link>
                        <Link
                          href="/contact-us"
                          className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-700 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800"
                        >
                          <Headphones className="h-3.5 w-3.5" />
                          Contact support
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar: summary */}
                <div className="space-y-5">
                  <Card>
                    <CardHeader icon={Package} title="Summary" />

                    <div className="p-5">
                      <div className="space-y-3 text-sm">
                        {/* Payment */}
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Payment</span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              paid
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {paid ? "Paid" : paymentLabel(order.paymentStatus)}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Status</span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              paid
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </div>

                        {/* Delivery */}
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Delivery</span>
                          <span className="font-medium capitalize text-neutral-950">
                            {order.deliveryMethod}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Items</span>
                          <span className="font-medium text-neutral-950">
                            {order.items.length}
                          </span>
                        </div>

                        {/* Price breakdown */}
                        <div className="border-t border-dashed border-neutral-200 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="font-medium text-neutral-950">
                              {formatNaira(order.subtotal)}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-neutral-500">
                              Delivery fee
                            </span>
                            <span className="font-medium text-neutral-950">
                              {formatNaira(order.deliveryFee)}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-neutral-200 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-500">
                              Total
                            </span>
                            <span className="text-[20px] font-semibold text-emerald-700">
                              {formatNaira(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
