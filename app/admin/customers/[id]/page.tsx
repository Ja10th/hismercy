import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  ArrowUpRight,
  Receipt,
} from "lucide-react";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_PALETTES = [
  "bg-rose-50 text-rose-700 ring-rose-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-sky-50 text-sky-700 ring-sky-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
  "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
];

function getAvatarPalette(name: string) {
  const sum = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_PALETTES[sum % AVATAR_PALETTES.length];
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PROCESSING: "bg-sky-50 text-sky-700 ring-sky-200",
  SHIPPED: "bg-violet-50 text-violet-700 ring-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-neutral-100 text-neutral-500 ring-neutral-200",
  REFUNDED: "bg-rose-50 text-rose-700 ring-rose-200",
};

const PAYMENT_STYLES: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-200",
  REFUNDED: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

function StatusPill({
  label,
  styles,
}: {
  label: string;
  styles: Record<string, string>;
}) {
  const className =
    styles[label?.toUpperCase()] ??
    "bg-neutral-100 text-neutral-600 ring-neutral-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
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
  });

  if (!customer) notFound();

  const lifetimeSpend = customer.orders.reduce(
    (sum, order) => sum + order.total,
    0
  );
  const initials = getInitials(customer.fullName);
  const avatarPalette = getAvatarPalette(customer.fullName);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 pt-4 text-sm font-medium text-neutral-700 transition hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customers
      </Link>

      {/* Hero card */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="h-20 bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-50" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-semibold ring-4 ring-white ${avatarPalette}`}
              >
                {initials || "?"}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-semibold text-neutral-950 sm:text-3xl">
                  {customer.fullName}
                </h1>
                <p className="text-sm text-neutral-500">
                  Customer since{" "}
                  {new Date(customer.createdAt).toLocaleDateString("en-NG", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Contact strip */}
          <div className="mt-6 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
             <a href={`mailto:${customer.email}`}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <Mail className="h-4 w-4 text-neutral-400" />
              <span className="truncate">{customer.email}</span>
            </a>
            
            <a  href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <Phone className="h-4 w-4 text-neutral-400" />
              {customer.phone}
            </a>
            <p className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
              {customer.street}, {customer.city}, {customer.state}
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Total orders
              </p>
              <p className="mt-1 text-xl font-semibold text-neutral-950">
                {customer._count.orders}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Recent spend
              </p>
              <p className="mt-1 text-xl font-semibold text-neutral-950">
                {formatNaira(lifetimeSpend)}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Last order
              </p>
              <p className="mt-1 text-xl font-semibold text-neutral-950">
                {customer.orders[0]
                  ? new Date(customer.orders[0].createdAt).toLocaleDateString(
                      "en-NG",
                      { day: "numeric", month: "short" }
                    )
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-950">
              Recent orders
            </h2>
          </div>
          {customer._count.orders > 5 && (
            <span className="text-xs font-medium text-neutral-400">
              Showing 5 of {customer._count.orders}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {customer.orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 py-10 text-center">
              <Receipt className="h-6 w-6 text-neutral-300" />
              <p className="text-sm text-neutral-500">No orders yet.</p>
            </div>
          ) : (
            customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.orderCode}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 transition group-hover:bg-neutral-200">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-950">
                      {order.orderCode}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden gap-2 sm:flex">
                    <StatusPill label={order.status} styles={STATUS_STYLES} />
                    <StatusPill
                      label={order.paymentStatus}
                      styles={PAYMENT_STYLES}
                    />
                  </div>
                  <p className="font-semibold text-neutral-950">
                    {formatNaira(order.total)}
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-500" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}