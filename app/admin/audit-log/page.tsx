import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  MinusCircle,
  ShieldCheck,
  ShieldX,
  ExternalLink,
  Receipt,
} from "lucide-react";

const PER_PAGE = 25;

type SearchParams = {
  status?: string;
  page?: string;
  q?: string;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; className: string; Icon: React.ElementType }
  > = {
    processed: {
      label: "Processed",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Icon: CheckCircle2,
    },
    failed: {
      label: "Failed",
      className: "bg-red-50 text-red-700 border-red-200",
      Icon: XCircle,
    },
    ignored: {
      label: "Ignored",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      Icon: MinusCircle,
    },
    received: {
      label: "Received",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      Icon: Clock3,
    },
  };

  const cfg = map[status] ?? {
    label: status,
    className: "bg-neutral-50 text-neutral-600 border-neutral-200",
    Icon: Clock3,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <cfg.Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function buildUrl(
  base: Record<string, string>,
  overrides: Record<string, string>,
) {
  const params = new URLSearchParams({ ...base, ...overrides });
  for (const [k, v] of params.entries()) {
    if (!v) params.delete(k);
  }
  return `/admin/audit-log?${params.toString()}`;
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function PaymentAuditLogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const status = params.status ?? "";
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));
  const skip = (page - 1) * PER_PAGE;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" as const } },
            { event: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const baseParams = {
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
  };

  const [logs, total, grouped] = await Promise.all([
    prisma.paymentAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
      select: {
        id: true,
        event: true,
        reference: true,
        status: true,
        signatureVerified: true,
        errorMessage: true,
        processedAt: true,
        createdAt: true,
        transactionId: true,
        orderId: true,
      },
    }),
    prisma.paymentAuditLog.count({ where }),
    prisma.paymentAuditLog.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const statMap = Object.fromEntries(
    grouped.map((g) => [g.status, g._count.status]),
  );

  const statCards = [
    {
      label: "Processed",
      value: statMap.processed ?? 0,
      textColor: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      Icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: statMap.failed ?? 0,
      textColor: "text-red-700",
      bg: "bg-red-50 border-red-200",
      Icon: XCircle,
    },
    {
      label: "Ignored",
      value: statMap.ignored ?? 0,
      textColor: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      Icon: MinusCircle,
    },
    {
      label: "Received",
      value: statMap.received ?? 0,
      textColor: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
      Icon: Clock3,
    },
  ];

  const filterTabs = [
    { label: "All", value: "" },
    { label: "Processed", value: "processed" },
    { label: "Failed", value: "failed" },
    { label: "Ignored", value: "ignored" },
    { label: "Received", value: "received" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Payment Audit Log
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Every payment event recorded in one
              place.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={buildUrl({}, { status: card.label.toLowerCase() })}
              className={`group rounded-3xl border p-5 transition  ${card.bg}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                  {card.label}
                </p>
                <card.Icon className={`h-4 w-4 ${card.textColor}`} />
              </div>
              <p
                className={`mt-2 text-3xl font-semibold tabular-nums ${card.textColor}`}
              >
                {card.value.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status tabs */}
          <div className="flex flex-wrap gap-1.5">
            {filterTabs.map((tab) => {
              const active = tab.value === status;
              return (
                <Link
                  key={tab.value}
                  href={buildUrl(
                    { ...(q ? { q } : {}), page: "1" },
                    { status: tab.value },
                  )}
                  className={[
                    "rounded-2xl border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search */}
          <form method="GET" action="/admin/audit-log" className="flex gap-2">
            {status ? (
              <input type="hidden" name="status" value={status} />
            ) : null}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search reference or event…"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 sm:w-64"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              Search
            </button>
            {q ? (
              <Link
                href={buildUrl({ ...(status ? { status } : {}) }, { q: "" })}
                className="inline-flex h-10 items-center rounded-xl border text-red-500 border-red-200 bg-red-50 px-4 text-sm transition hover:bg-neutral-50"
              >
                Clear
              </Link>
            ) : null}
          </form>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <Receipt className="h-8 w-8 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-950">
                No entries found
              </p>
              <p className="text-xs text-neutral-400">
                {q || status
                  ? "Try adjusting your filters."
                  : "Payment events will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-neutral-400">
                      Event
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-neutral-400">
                      Reference
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-neutral-400">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-neutral-400">
                      Sig
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-neutral-400">
                      Error
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-widest text-neutral-400">
                      Time
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="group transition hover:bg-neutral-50/60"
                    >
                      <td className="px-5 py-4">
                        <span className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-xs text-neutral-700">
                          {log.event}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-neutral-700">
                          {log.reference ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-5 py-4">
                        {log.signatureVerified ? (
                          <span title="Signature verified">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          </span>
                        ) : (
                          <span title="No HMAC signature (callback redirect)">
                            <ShieldX className="h-4 w-4 text-neutral-300" />
                          </span>
                        )}
                      </td>
                      <td className="max-w-[220px] px-5 py-4">
                        {log.errorMessage ? (
                          <p
                            className="truncate text-xs text-red-600"
                            title={log.errorMessage}
                          >
                            {log.errorMessage}
                          </p>
                        ) : (
                          <span className="text-xs text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-neutral-500">
                        {formatDate(log.processedAt ?? log.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        {log.orderId && log.reference ? (
                          <Link
                            href={`/admin/orders/${log.orderId}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 opacity-0 transition group-hover:opacity-100 hover:underline"
                          >
                            Order
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Showing {skip + 1}–{Math.min(skip + PER_PAGE, total)} of{" "}
              {total.toLocaleString()} entries
            </p>

            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildUrl(baseParams, { page: String(page - 1) })}
                  className="inline-flex h-9 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition hover:bg-neutral-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex h-9 cursor-not-allowed items-center rounded-xl border border-neutral-100 bg-neutral-50 px-4 text-sm text-neutral-300">
                  Previous
                </span>
              )}

              <span className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={buildUrl(baseParams, { page: String(page + 1) })}
                  className="inline-flex h-9 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition hover:bg-neutral-50"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex h-9 cursor-not-allowed items-center rounded-xl border border-neutral-100 bg-neutral-50 px-4 text-sm text-neutral-300">
                  Next
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
