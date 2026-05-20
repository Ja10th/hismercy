import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronDown,
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

function stepTone(index: number, active: boolean) {
  const base = "rounded-full flex h-11 w-11 items-center justify-center";
  if (!active) return `${base} bg-white text-emerald-700 shadow-sm`;
  if (index === 1) return `${base} bg-emerald-700 text-white`;
  return `${base} bg-emerald-700 text-white`;
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen px-4 pb-10 pt-24 md:pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/my-orders"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-2 text-sm font-medium  shadow-sm transition hover:bg-neutral-50"
            >
              <TfiArrowLeft className="h-4 w-4" />
            </Link>

            <p className="hidden text-sm text-neutral-500 md:block">
              Showing tracking details for your search.
            </p>
          </div>

          {!email || !orderCode ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500 shadow-sm">
              Enter your email and order code to see your order.
            </div>
          ) : !order ? (
            <div className="rounded-[28px] bg-white p-8 text-sm text-neutral-500 shadow-sm">
              No order was found for that email and order code.
            </div>
          ) : (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white">
                <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between md:px-6 md:py-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                        {order.fullName}
                      </span>

                      <div className="hidden h-4 w-px bg-neutral-200 md:block" />

                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <ChevronDown className="h-4 w-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <h2 className="mt-4 text-[26px] font-semibold tracking-tight text-neutral-950 md:text-[30px]">
                      {order.orderCode}
                    </h2>
                  </div>

                  <div className="flex items-start gap-4 md:items-center">
                    <div className="text-right">
                      <p className="mt-2 text-[26px] font-semibold tracking-tight text-neutral-950 md:text-[32px]">
                        {formatNaira(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 md:px-6 md:pb-6">
                  <div className="flex items-center justify-center gap-3 overflow-x-auto">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const active = index <= stepIndex;
                      const last = index === steps.length - 1;

                      return (
                        <div
                          key={step.key}
                          className="flex min-w-[160px] flex-1 items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={[
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                                active
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-neutral-200 bg-white text-neutral-400",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-neutral-950">
                                {step.label}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>

                          {!last ? (
                            <div
                              className={[
                                "mx-4 hidden h-px flex-1 border-t",
                                active
                                  ? "border-emerald-300"
                                  : "border-neutral-200",
                                "sm:block",
                              ].join(" ")}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-3 px-5 py-5">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-emerald-700" />
                        <h3 className="text-[18px] font-semibold text-neutral-950">
                          Order items
                        </h3>
                      </div>

                      <Link
                        href={receiptHref}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
                      >
                        <FileText className="h-4 w-4" />
                        Download receipt
                      </Link>
                    </div>

                    <div className="px-5 pb-5">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                        {itemsPreview.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                            No items found.
                          </div>
                        ) : (
                          itemsPreview.map((item, index) => {
                            const imageUrl = item.image || "/bags.png";

                            return (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-neutral-200 bg-white p-3 flex justify-between items-start"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
                                    <Image
                                      src={imageUrl}
                                      alt={item.name}
                                      fill
                                      className="object-contain p-1.5"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-neutral-950">
                                      {item.name}
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-500">
                                      Qty {item.qty}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-end justify-between gap-3">
                                  <p className="text-sm font-medium text-neutral-950">
                                    {formatNaira(item.price * item.qty)}
                                  </p>

                                  {index === itemsPreview.length - 1 &&
                                  extraCount > 0 ? (
                                    <span className="text-xs text-neutral-500">
                                      +{extraCount} more
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center gap-2 px-5 py-5">
                      <Clock3 className="h-4 w-4 text-emerald-700" />
                      <h3 className="text-[18px] font-semibold text-neutral-950">
                        Previous orders
                      </h3>
                    </div>

                    <div className="px-5 pb-5">
                      {previousOrders.length === 0 ? (
                        <div className="rounded-[18px] border border-dashed border-emerald-100 bg-[#f1fbf4] p-4 text-sm text-neutral-500">
                          No previous orders found for this email.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {previousOrders.map((prev) => {
                            const prevImage =
                              prev.items[0]?.image || "/bags.png";

                            return (
                              <div
                                key={prev.id}
                                className="rounded-[18px] border border-emerald-100 bg-[#f1fbf4] p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white">
                                      <Image
                                        src={prevImage}
                                        alt={prev.orderCode}
                                        fill
                                        className="object-contain p-1.5"
                                      />
                                    </div>

                                    <div>
                                      <p className="font-semibold text-neutral-950">
                                        {prev.orderCode}
                                      </p>
                                      <p className="mt-1 text-sm text-neutral-500">
                                        {formatDate(prev.createdAt)}
                                      </p>
                                      <p className="mt-1 text-sm text-neutral-600">
                                        {statusLabel(prev.status)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="font-semibold text-neutral-950">
                                      {formatNaira(prev.total)}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                      {prev.items.length} item
                                      {prev.items.length === 1 ? "" : "s"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-emerald-100 bg-[#f1fbf4] px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-neutral-100">
                          <Headphones className="h-5 w-5 text-neutral-900" />
                        </div>

                        <div>
                          <h3 className="text-[16px] font-semibold text-neutral-950">
                            Need help with this order?
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/faq"
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:underline"
                        >
                          <CircleHelp className="h-4 w-4" />
                          View FAQs
                        </Link>

                        <Link
                          href="/contact-us"
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
                        >
                          <Package className="h-4 w-4" />
                          Contact support
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center gap-2 px-5 py-5">
                      <Package className="h-4 w-4 text-emerald-700" />
                      <h3 className="text-[18px] font-semibold text-neutral-950">
                        Summary
                      </h3>
                    </div>

                    <div className="px-5 pb-5">
                      <div className="space-y-3 text-sm">
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
                          <span className="text-neutral-500">Status</span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${
                              paid
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Items</span>
                          <span className="font-medium text-neutral-950">
                            {order.items.length}
                          </span>
                        </div>

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
                            <span className="text-neutral-500">Total</span>
                            <span className="text-[20px] font-semibold text-emerald-700">
                              {formatNaira(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
