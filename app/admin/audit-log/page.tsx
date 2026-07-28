import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/admin-auth";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Layers,
  MinusCircle,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShieldX,
  ShoppingCart,
  Tag,
  UserRound,
  Users,
  XCircle,
  Clock3,
} from "lucide-react";

const PER_PAGE = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = {
  category?: string;
  q?: string;
  page?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(overrides: Record<string, string>) {
  const params = new URLSearchParams(overrides);
  for (const [k, v] of params.entries()) {
    if (!v) params.delete(k);
  }
  return `/admin/audit-log?${params.toString()}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

// ─── Category config ──────────────────────────────────────────────────────────

type CategoryKey =
  | "order" | "product" | "brand" | "blog"
  | "customer" | "settings" | "auth" | "payment" | "system";

const CATEGORY_CONFIG: Record<
  CategoryKey,
  { label: string; Icon: React.ElementType; dot: string; badge: string }
> = {
  order:    { label: "Orders",    Icon: ShoppingCart, dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  product:  { label: "Products",  Icon: Package,      dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  brand:    { label: "Brands",    Icon: Tag,          dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  blog:     { label: "Blog",      Icon: FileText,     dot: "bg-pink-500",    badge: "bg-pink-50 text-pink-700 border-pink-200" },
  customer: { label: "Customers", Icon: Users,        dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  settings: { label: "Settings",  Icon: Settings,     dot: "bg-neutral-500", badge: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  auth:     { label: "Auth",      Icon: UserRound,    dot: "bg-sky-500",     badge: "bg-sky-50 text-sky-700 border-sky-200" },
  payment:  { label: "Payments",  Icon: CreditCard,   dot: "bg-green-500",   badge: "bg-green-50 text-green-700 border-green-200" },
  system:   { label: "System",    Icon: Layers,       dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 border-rose-200" },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category as CategoryKey] ?? {
    label: category,
    Icon: Layers,
    dot: "bg-neutral-400",
    badge: "bg-neutral-50 text-neutral-600 border-neutral-200",
  };
}

// ─── Payment status badge ─────────────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
    processed: { label: "Processed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
    failed:    { label: "Failed",    className: "bg-red-50 text-red-700 border-red-200",             Icon: XCircle },
    ignored:   { label: "Ignored",   className: "bg-amber-50 text-amber-700 border-amber-200",       Icon: MinusCircle },
    received:  { label: "Received",  className: "bg-blue-50 text-blue-700 border-blue-200",          Icon: Clock3 },
  };
  const cfg = map[status] ?? { label: status, className: "bg-neutral-50 text-neutral-600 border-neutral-200", Icon: Clock3 };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      <cfg.Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await requireDeveloper();

  const params = searchParams ? await searchParams : {};
  const category = params.category ?? "";
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));
  const skip = (page - 1) * PER_PAGE;

  // ── Fetch admin audit logs ──────────────────────────────────────────────────
  const auditWhere = {
    ...(category && category !== "payment" ? { category } : {}),
    ...(q ? {
      OR: [
        { action: { contains: q, mode: "insensitive" as const } },
        { target: { contains: q, mode: "insensitive" as const } },
        { actor:  { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  // ── Fetch payment audit logs ────────────────────────────────────────────────
  const paymentWhere = {
    ...(q ? {
      OR: [
        { reference: { contains: q, mode: "insensitive" as const } },
        { event:     { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const showPayments = !category || category === "payment";
  const showAdmin    = !category || category !== "payment";

  const [
    auditLogs,
    auditTotal,
    paymentLogs,
    paymentTotal,
    categoryGroups,
  ] = await Promise.all([
    showAdmin
      ? prisma.auditLog.findMany({
          where: auditWhere,
          orderBy: { createdAt: "desc" },
          skip: showPayments ? 0 : skip,
          take: showPayments ? 200 : PER_PAGE,
        })
      : Promise.resolve([]),
    showAdmin ? prisma.auditLog.count({ where: auditWhere }) : Promise.resolve(0),
    showPayments
      ? prisma.paymentAuditLog.findMany({
          where: paymentWhere,
          orderBy: { createdAt: "desc" },
          skip: !showAdmin ? skip : 0,
          take: 200,
          select: {
            id: true, event: true, reference: true, status: true,
            signatureVerified: true, errorMessage: true,
            processedAt: true, createdAt: true, orderId: true,
          },
        })
      : Promise.resolve([]),
    showPayments ? prisma.paymentAuditLog.count({ where: paymentWhere }) : Promise.resolve(0),
    prisma.auditLog.groupBy({ by: ["category"], _count: { category: true } }),
  ]);

  // Merge and sort by date when showing all categories
  type AdminEntry = {
    _type: "admin";
    id: string;
    actor: string;
    category: string;
    action: string;
    target: string | null;
    href: string | null;
    meta: unknown;
    createdAt: Date;
  };

  type PaymentEntry = {
    _type: "payment";
    id: string;
    event: string;
    reference: string | null;
    status: string;
    signatureVerified: boolean;
    errorMessage: string | null;
    processedAt: Date | null;
    createdAt: Date;
    orderId: string | null;
  };

  type Entry = AdminEntry | PaymentEntry;

  const adminEntries: AdminEntry[] = auditLogs.map((l: any) => ({ _type: "admin", ...l }));
  const paymentEntries: PaymentEntry[] = paymentLogs.map((l: any) => ({ _type: "payment", ...l }));

  // Merge + sort + paginate when no category filter (unified view)
  let entries: Entry[];
  let total: number;

  if (!category) {
    const merged = [...adminEntries, ...paymentEntries].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    total = auditTotal + paymentTotal;
    entries = merged.slice(skip, skip + PER_PAGE);
  } else if (category === "payment") {
    total = paymentTotal;
    entries = paymentEntries.slice(skip, skip + PER_PAGE);
  } else {
    total = auditTotal;
    entries = adminEntries.slice(0, PER_PAGE);
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  // Stat cards
  const catMap = Object.fromEntries(categoryGroups.map((g: { category: any; _count: { category: any; }; }) => [g.category, g._count.category]));

  const TABS = [
    { value: "",        label: "All",       count: auditTotal + paymentTotal },
    { value: "auth",    label: "Auth",      count: catMap.auth ?? 0 },
    { value: "order",   label: "Orders",    count: catMap.order ?? 0 },
    { value: "product", label: "Products",  count: catMap.product ?? 0 },
    { value: "brand",   label: "Brands",    count: catMap.brand ?? 0 },
    { value: "blog",    label: "Blog",      count: catMap.blog ?? 0 },
    { value: "customer",label: "Customers", count: catMap.customer ?? 0 },
    { value: "settings",label: "Settings",  count: catMap.settings ?? 0 },
    { value: "payment", label: "Payments",  count: paymentTotal },
  ];

  const baseParams = {
    ...(category ? { category } : {}),
    ...(q ? { q } : {}),
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Audit Log
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Complete record of every admin action and payment event.
          </p>
        </div>

        {/* Stat strip */}
   

        {/* Search + filter bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[{ value: "", label: "All events" }, ...TABS.slice(1)].map((tab) => (
              <Link
                key={tab.value}
                href={buildUrl({ ...(q ? { q } : {}), category: tab.value, page: "1" })}
                className={[
                  "rounded-2xl border px-3.5 py-2 text-sm font-medium transition",
                  (tab.value === "" ? category === "" : category === tab.value)
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <form method="GET" action="/admin/audit-log" className="flex gap-2">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search action, target, actor…"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 sm:w-64"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Search
            </button>
            {q ? (
              <Link
                href={buildUrl(category ? { category } : {})}
                className="inline-flex h-10 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm text-red-500 transition hover:bg-red-100"
              >
                Clear
              </Link>
            ) : null}
          </form>
        </div>

        {/* Log feed */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
              <Receipt className="h-9 w-9 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-950">No log entries found</p>
              <p className="text-xs text-neutral-400">
                {q || category ? "Try adjusting your filters." : "Actions will appear here as you use the admin."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {entries.map((entry) => {
                if (entry._type === "admin") {
                  const cfg = getCategoryConfig(entry.category);
                  const meta = entry.meta as Record<string, unknown> | null;

                  return (
                    <div key={`admin-${entry.id}`} className="group flex items-start gap-4 px-5 py-4 transition hover:bg-neutral-50/70">
                      {/* Timeline dot */}
                      <div className="relative mt-1.5 flex shrink-0 flex-col items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${cfg.dot}`} />
                      </div>

                      {/* Icon */}
                      <div className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500`}>
                        <cfg.Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <p className="text-sm font-medium text-neutral-950">{entry.action}</p>
                          {entry.target ? (
                            <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs text-neutral-600">
                              {entry.target}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <UserRound className="h-3 w-3" />
                            {entry.actor}
                          </span>
                          <span title={formatDate(entry.createdAt)}>{timeAgo(entry.createdAt)}</span>
                        </div>

                        {/* Meta snapshot */}
                        {meta && Object.keys(meta).length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(meta).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                              >
                                {k}: <span className="font-medium">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {/* Link */}
                      {entry.href ? (
                        <Link
                          href={entry.href}
                          className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100"
                          title="Open"
                        >
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        </Link>
                      ) : null}
                    </div>
                  );
                }

                // Payment entry
                return (
                  <div key={`pay-${entry.id}`} className="group flex items-start gap-4 px-5 py-4 transition hover:bg-neutral-50/70">
                    <div className="relative mt-1.5 flex shrink-0 flex-col items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                        entry.status === "processed" ? "bg-emerald-500" :
                        entry.status === "failed" ? "bg-red-500" : "bg-amber-400"
                      }`} />
                    </div>

                    <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                      <CreditCard className="h-4 w-4 text-neutral-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                          Payment
                        </span>
                        <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs text-neutral-700">
                          {entry.event}
                        </span>
                        <PaymentStatusBadge status={entry.status} />
                        {entry.signatureVerified ? (
                          <span title="HMAC signature verified">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          </span>
                        ) : (
                          <span title="No HMAC signature (browser callback)">
                            <ShieldX className="h-3.5 w-3.5 text-neutral-300" />
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        {entry.reference ? (
                          <span className="font-mono">{entry.reference}</span>
                        ) : null}
                        <span title={formatDate(entry.processedAt ?? entry.createdAt)}>
                          {timeAgo(entry.processedAt ?? entry.createdAt)}
                        </span>
                      </div>

                      {entry.errorMessage ? (
                        <p className="mt-1 max-w-md truncate text-xs text-red-500" title={entry.errorMessage}>
                          {entry.errorMessage}
                        </p>
                      ) : null}
                    </div>

                    {entry.orderId && entry.reference ? (
                      <Link
                        href={`/admin/orders/${entry.reference}`}
                        className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100"
                        title="View order"
                      >
                        <ExternalLink className="h-4 w-4 text-emerald-600" />
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Showing {skip + 1}–{Math.min(skip + PER_PAGE, total)} of {total.toLocaleString()} entries
            </p>

            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildUrl({ ...baseParams, page: String(page - 1) })}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition hover:bg-neutral-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </Link>
              ) : (
                <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-xl border border-neutral-100 bg-neutral-50 px-4 text-sm text-neutral-300">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </span>
              )}

              <span className="text-sm text-neutral-500">
                {page} / {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={buildUrl({ ...baseParams, page: String(page + 1) })}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition hover:bg-neutral-50"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-xl border border-neutral-100 bg-neutral-50 px-4 text-sm text-neutral-300">
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
