import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

type AdminPageProps = {
  searchParams?: Promise<{
    range?: string;
  }>;
};

function formatNaira(amount?: number | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format((amount || 0) / 100);
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatRange(start: Date, end: Date) {
  return `${formatDayLabel(start)} – ${formatDayLabel(end)}`;
}

function getStatusClass(status: string) {
  switch (status) {
    case "paid":
    case "success":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "on_the_way":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "delivered":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "completed":
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function comparisonMeta(current: number, previous: number) {
  if (previous === 0 && current === 0) {
    return {
      text: "No change",
      positive: null as boolean | null,
    };
  }

  if (previous === 0 && current > 0) {
    return {
      text: "100.0%",
      positive: true as boolean | null,
    };
  }

  const pct = ((current - previous) / previous) * 100;

  if (Math.abs(pct) < 0.05) {
    return {
      text: "No change",
      positive: null as boolean | null,
    };
  }

  return {
    text: `${Math.abs(pct).toFixed(1)}%`,
    positive: pct >= 0,
  };
}

function pointsToPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const d = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const after = points[i + 2] || next;

    const cp1x = current.x + (next.x - prev.x) / 6;
    const cp1y = current.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (after.x - current.x) / 6;
    const cp2y = next.y - (after.y - current.y) / 6;

    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`);
  }

  return d.join(" ");
}

function makeChartPoints(values: number[], width: number, height: number) {
  const padding = 18;
  const maxValue = Math.max(...values, 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const denominator = Math.max(values.length - 1, 1);

  return values.map((value, index) => {
    const x = padding + (usableWidth * index) / denominator;
    const y = padding + usableHeight - (value / maxValue) * usableHeight;
    return { x, y };
  });
}

function PersonAvatar() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 12.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M5.5 19a6.5 6.5 0 0 1 13 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const rangeDays = [7, 14, 30].includes(Number(params.range))
    ? Number(params.range)
    : 7;

  const today = startOfDay(new Date());
  const currentStart = addDays(today, -(rangeDays - 1));
  const previousStart = addDays(currentStart, -rangeDays);
  const previousEnd = addDays(currentStart, -1);

  const chartDays = Array.from({ length: rangeDays }, (_, index) =>
    addDays(currentStart, index),
  );

  const [
    productCount,
    customerCount,
    totalOrders,
    totalRevenue,
    currentRevenue,
    previousRevenue,
    currentOrders,
    previousOrders,
    currentCustomers,
    previousCustomers,
    currentProducts,
    previousProducts,
    recentOrders,
    recentCustomers,
    recentProducts,
    chartPaidOrders,
    allPaidOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: { in: ["paid", "success"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        paymentStatus: { in: ["paid", "success"] },
        createdAt: {
          gte: currentStart,
          lte: today,
        },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        paymentStatus: { in: ["paid", "success"] },
        createdAt: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: currentStart,
          lte: today,
        },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
    }),
    prisma.customer.count({
      where: {
        createdAt: {
          gte: currentStart,
          lte: today,
        },
      },
    }),
    prisma.customer.count({
      where: {
        createdAt: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
    }),
    prisma.product.count({
      where: {
        createdAt: {
          gte: currentStart,
          lte: today,
        },
      },
    }),
    prisma.product.count({
      where: {
        createdAt: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderCode: true,
        fullName: true,
        total: true,
        paymentStatus: true,
        status: true,
      },
    }),
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 1,
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 1,
      include: {
        brand: true,
        images: true,
      },
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: { in: ["paid", "success"] },
        createdAt: {
          gte: currentStart,
          lte: today,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
    }),
    prisma.order.findMany({
      where: { paymentStatus: { in: ["paid", "success"] } },
      select: {
        customerId: true,
        total: true,
      },
    }),
  ]);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const totalRevenueValue = totalRevenue._sum.total || 0;
  const currentRevenueValue = currentRevenue._sum.total || 0;
  const previousRevenueValue = previousRevenue._sum.total || 0;

  const weeklyValues = chartDays.map((day) => {
    const nextDay = addDays(day, 1);
    return chartPaidOrders
      .filter((order) => order.createdAt >= day && order.createdAt < nextDay)
      .reduce((sum, order) => sum + order.total, 0);
  });

  const chartWidth = 760;
  const chartHeight = 240;
  const chartPoints = makeChartPoints(weeklyValues, chartWidth, chartHeight);
  const linePath = pointsToPath(chartPoints);
  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - 18} L ${chartPoints[0].x} ${chartHeight - 18} Z`
      : "";

  const paidBadge = ["paid", "success"];

  const paidRevenueByCustomer = new Map<string, number>();
  for (const order of allPaidOrders) {
    paidRevenueByCustomer.set(
      order.customerId,
      (paidRevenueByCustomer.get(order.customerId) || 0) + order.total,
    );
  }

  const stats = [
    {
      label: "Revenue",
      value: formatNaira(totalRevenueValue),
      icon: Wallet,
      accent: "bg-emerald-50 text-emerald-600",
      current: currentRevenueValue,
      previous: previousRevenueValue,
    },
    {
      label: "Orders",
      value: totalOrders,
      icon: ShoppingBag,
      accent: "bg-sky-50 text-sky-600",
      current: currentOrders,
      previous: previousOrders,
    },
    {
      label: "Customers",
      value: customerCount,
      icon: Users,
      accent: "bg-violet-50 text-violet-600",
      current: currentCustomers,
      previous: previousCustomers,
    },
    {
      label: "Products",
      value: productCount,
      icon: Package,
      accent: "bg-amber-50 text-amber-600",
      current: currentProducts,
      previous: previousProducts,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-1">
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            const trend = comparisonMeta(item.current, item.previous);
            const trendColor =
              trend.positive === true
                ? "text-emerald-600"
                : trend.positive === false
                  ? "text-red-600"
                  : "text-neutral-500";

            return (
              <div
                key={item.label}
                className="rounded-[28px] border border-neutral-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
              >
                <div
                  className={`flex h-11 w-13 items-center justify-center rounded-2xl ${item.accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <p className="mt-4 text-sm text-neutral-500">{item.label}</p>
                <p className="mt-1 text-[28px] font-semibold tracking-tight text-neutral-950">
                  {item.value}
                </p>

                <div
                  className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${trendColor}`}
                >
                  {trend.positive === true ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : trend.positive === false ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : null}
                  <span>
                    {trend.text !== "No change" ? trend.text : "No change"}
                  </span>
                  <span className="font-normal text-neutral-500">
                    vs {formatRange(previousStart, previousEnd)}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="rounded-[30px] border border-neutral-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="mt-1 text-xs text-neutral-500">
                  Showing {rangeDays} days
                </p>
              </div>

              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700">
                  Last {rangeDays} days
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </summary>

                <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg">
                  {[7, 14, 30].map((value) => (
                    <Link
                      key={value}
                      href={`/admin?range=${value}`}
                      className={`block rounded-xl px-3 py-2 text-sm transition hover:bg-neutral-100 ${
                        rangeDays === value
                          ? "bg-neutral-100 text-neutral-950"
                          : "text-neutral-600"
                      }`}
                    >
                      Last {value} days
                    </Link>
                  ))}
                </div>
              </details>
            </div>

            <div className="mt-4 rounded-[24px] border border-neutral-200 bg-neutral-50 p-3">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-[220px] w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="weeklyArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.18" />
                    <stop
                      offset="100%"
                      stopColor="#1d4ed8"
                      stopOpacity="0.02"
                    />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3].map((line) => (
                  <line
                    key={line}
                    x1="18"
                    x2={chartWidth - 18}
                    y1={18 + ((chartHeight - 36) * line) / 3}
                    y2={18 + ((chartHeight - 36) * line) / 3}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}

                {chartPoints.map((point, index) => (
                  <line
                    key={`stem-${index}`}
                    x1={point.x}
                    x2={point.x}
                    y1={chartHeight - 18}
                    y2={point.y}
                    stroke="#dbe3f5"
                    strokeWidth="1"
                  />
                ))}

                <path d={areaPath} fill="url(#weeklyArea)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartPoints.map((point, index) => {
                  if (
                    index !== 0 &&
                    index !== Math.floor(chartPoints.length / 2) &&
                    index !== chartPoints.length - 1
                  ) {
                    return null;
                  }

                  return (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill="#1d4ed8"
                      stroke="#fff"
                      strokeWidth="3"
                    />
                  );
                })}
              </svg>

              <div
                className={`mt-2 grid gap-1 text-center text-[11px] text-neutral-500 ${
                  rangeDays <= 7 ? `grid-cols-${rangeDays}` : "grid-cols-7"
                }`}
              >
                {rangeDays <= 7
                  ? chartDays.map((day, index) => (
                      <div key={day.toISOString()}>
                        <p>{formatDayLabel(day)}</p>
                        <p className="mt-1 font-medium text-neutral-700">
                          {formatNaira(weeklyValues[index] || 0)}
                        </p>
                      </div>
                    ))
                  : [
                      0,
                      Math.floor(rangeDays / 4),
                      Math.floor(rangeDays / 2),
                      Math.floor((rangeDays * 3) / 4),
                      rangeDays - 1,
                    ].map((index) => {
                      const day = chartDays[index];
                      return (
                        <div key={day.toISOString()}>
                          <p>{formatDayLabel(day)}</p>
                          <p className="mt-1 font-medium text-neutral-700">
                            {formatNaira(weeklyValues[index] || 0)}
                          </p>
                        </div>
                      );
                    })}
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-600">
                <span className="h-0.5 w-8 rounded-full bg-blue-600" />
                <span>Revenue</span>
                <span className="font-semibold text-neutral-950">
                  {formatNaira(currentRevenueValue)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Recent orders
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Latest customer checkouts
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300  p-5 text-sm text-neutral-500">
                  No orders yet.
                </div>
              ) : (
                recentOrders.map((order) => {
                  const isPaid = paidBadge.includes(order.paymentStatus);

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200  p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PersonAvatar />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {order.fullName}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {order.orderCode}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-neutral-950">
                          {formatNaira(order.total)}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                            isPaid
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Recent customers
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Saved customer records
                </p>
              </div>

              <Link
                href="/admin/customers"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentCustomers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-500">
                  No customers yet.
                </div>
              ) : (
                recentCustomers.map((customer) => {
                  const spent = paidRevenueByCustomer.get(customer.id) || 0;

                  return (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between gap-4 rounded-[22px] border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PersonAvatar />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {customer.fullName}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {customer.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-950">
                          {customer._count.orders} order
                          {customer._count.orders === 1 ? "" : "s"}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {formatNaira(spent)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Recent products
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Newly added inventory
                </p>
              </div>

              <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-500">
                  No products yet.
                </div>
              ) : (
                recentProducts.map((product) => {
                  const imageUrl = product.images[0]?.url || "/bags.png";

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-[22px] border border-neutral-200 bg-neutral-50 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {product.name}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {product.brand?.name || "No brand"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs font-medium ${
                            product.inStock
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.inStock ? "In stock" : "Out"}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {product.stockCount} units
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
