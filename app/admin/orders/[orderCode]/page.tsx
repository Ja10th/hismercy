import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  MapPin,
  Truck,
  UserRound,
} from "lucide-react";
import AdminOrdersToasts from "../AdminOrdersToasts";
import { OrderActions } from "./OrderActions";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  on_the_way: "On the way",
  delivered: "Delivered",
  completed: "Completed",
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatPlacedAt(date: Date) {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `Placed on ${datePart} at ${timePart}`;
}

function formatTimelineAt(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isPaidStatus(paymentStatus: string) {
  return ["paid", "success"].includes(paymentStatus);
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: "customer" | "address" | "delivery" | "payment";
  label: string;
  children: React.ReactNode;
}) {
  const Icon =
    icon === "customer"
      ? UserRound
      : icon === "address"
        ? MapPin
        : icon === "delivery"
          ? Truck
          : CreditCard;

  return (
    <div className="flex items-start justify-between gap-4 border-t border-neutral-200 py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="text-sm text-neutral-950">{label}</p>
      </div>
      <div className="text-right text-sm leading-6 text-neutral-600">
        {children}
      </div>
    </div>
  );
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  await requireAdmin();

  const { orderCode } = await params;

  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: {
      customer: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
      history: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-2">
        <AdminOrdersToasts />
        <div className="mx-auto max-w-[1520px]">
          <p className="text-sm text-neutral-500">Order not found.</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const paid = isPaidStatus(order.paymentStatus);
  const customerName = order.customer?.fullName || order.fullName;
  const customerEmail = order.customer?.email || order.email;
  const customerPhone = order.customer?.phone || order.phone;
  const addressLine = `${order.street}, ${order.city}, ${order.state}${
    order.landmark ? `, ${order.landmark}` : ""
  }`;

  const orderPlacedAt = order.createdAt;
  const paymentConfirmedAt =
    order.paidAt ||
    order.history.find((entry) => isPaidStatus(order.paymentStatus))
      ?.createdAt ||
    order.updatedAt;

  const timeline = [
    {
      title: "Order placed",
      at: orderPlacedAt,
      note: formatTimelineAt(orderPlacedAt),
    },
    ...(paid
      ? [
          {
            title: "Payment confirmed",
            at: paymentConfirmedAt,
            note: formatTimelineAt(paymentConfirmedAt),
          },
        ]
      : []),
    ...order.history
      .filter((entry) =>
        ["on_the_way", "delivered", "completed"].includes(entry.status),
      )
      .map((entry) => ({
        title: statusLabels[entry.status] || entry.status,
        at: entry.createdAt,
        note: formatTimelineAt(entry.createdAt),
      })),
  ];

  const visibleItems = order.items.slice(0, 6);
  const hiddenCount = Math.max(order.items.length - visibleItems.length, 0);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 pt-8 pb-4 sm:px-6 lg:px-2">
      <AdminOrdersToasts />

      <div className="mx-auto max-w-8xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold tracking-tight text-neutral-950">
                Order {order.orderCode}
              </h1>

              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-700">
                Paid
              </span>

              <span className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-600">
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <p className="mt-2 ml-1 text-[13px] text-neutral-500">
              {formatPlacedAt(order.createdAt)}
            </p>
          </div>

          <OrderActions orderCode={order.orderCode} />
        </div>

        <section className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white">
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="px-6 py-6">
              <h2 className="text-[18px] font-semibold text-neutral-950">
                Order items
              </h2>

              <div className="mt-6 space-y-6">
                {visibleItems.map((item) => {
                  const itemImage = item.image || "/bags.png";
                  const sku = item.productId.slice(0, 6).toUpperCase();

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[96px_minmax(0,1fr)_120px] items-center gap-6"
                    >
                      <div className="relative h-[96px] w-[96px] overflow-hidden rounded-[12px] bg-neutral-100">
                        <Image
                          src={itemImage}
                          alt={item.name}
                          fill
                          className="object-contain p-3"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[17px] font-semibold text-neutral-950">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-[15px] text-neutral-500">
                          Top Feed
                        </p>

                        <div className="mt-5 flex items-center gap-5">
                          <span className="rounded-md bg-neutral-100 px-3 py-1.5 text-[12px] text-neutral-500">
                            SKU: {sku}
                          </span>
                          <span className="text-[15px] text-neutral-500">
                            × {item.qty}
                          </span>
                        </div>
                      </div>

                      <div className="justify-self-end text-[17px] font-medium text-neutral-950">
                        {formatNaira(item.price * item.qty)}
                      </div>
                    </div>
                  );
                })}

                {hiddenCount > 0 ? (
                  <p className="text-sm text-neutral-500">
                    +{hiddenCount} more item{hiddenCount === 1 ? "" : "s"}...
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-t border-neutral-200 px-6 py-6 xl:border-l xl:border-t-0">
              <h3 className="text-[18px] font-semibold text-neutral-950">
                Order summary
              </h3>

              <div className="mt-8 flex flex-col space-y-4 text-[15px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">Subtotal</span>
                    <span className="text-neutral-950">
                      {formatNaira(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">Delivery</span>
                    <span className="text-neutral-950">
                      {formatNaira(order.deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[18px] font-semibold text-neutral-950">
                      Total
                    </span>
                    <span className="text-[18px] font-semibold text-neutral-950">
                      {formatNaira(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white">
            <div className="px-6 py-6">
              <h2 className="text-[18px] font-semibold text-neutral-950">
                Order details
              </h2>

              <div className="mt-6">
                <DetailRow icon="customer" label="Customer">
                  <div className="flex flex-col">
                    <Link
                      href="/admin/customers"
                      className="font-semibold text-neutral-700 hover:underline"
                    >
                      {customerName}
                    </Link>
                    <span>{customerEmail}</span>
                    <span>{customerPhone}</span>
                  </div>
                </DetailRow>

                <DetailRow icon="address" label="Delivery address">
                  <div className="max-w-[220px]">{addressLine}</div>
                </DetailRow>

                <DetailRow icon="delivery" label="Delivery method">
                  <span>
                    {order.deliveryMethod === "standard"
                      ? "Standard Delivery"
                      : order.deliveryMethod === "express"
                        ? "Express Delivery"
                        : "Pickup"}
                  </span>
                </DetailRow>

                <DetailRow icon="payment" label="Payment method">
                  <span className="font-medium text-emerald-600">
                    Paid (Confirmed)
                  </span>
                </DetailRow>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white">
            <div className="px-6 py-6">
              <h2 className="text-[18px] font-semibold text-neutral-950">
                Order timeline
              </h2>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute left-[10px] top-3 bottom-3 w-px bg-emerald-200" />

                  <div className="space-y-8">
                    {timeline.map((entry) => (
                      <div
                        key={`${entry.title}-${entry.at.toISOString()}`}
                        className="relative pl-9"
                      >
                        <div className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>

                        <h3 className="text-[16px] font-semibold text-neutral-950">
                          {entry.title}
                        </h3>
                        <p className="mt-1 text-[14px] text-neutral-500">
                          {entry.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[18px] border border-neutral-200 bg-white">
          <div className="flex items-start justify-between gap-4 px-6 py-6">
            <div>
              <h2 className="text-[18px] font-semibold text-neutral-950">
                Order notes
              </h2>
              <p className="mt-8 text-[15px] text-neutral-500">
                {order.notes || "No notes added."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
