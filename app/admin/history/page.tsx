import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Package,
  Search,
  Truck,
  UserRound,
} from "lucide-react";

type HistoryPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "on_the_way":
      return "On the way";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "on_the_way":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "delivered":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "completed":
      return "border-neutral-200 bg-neutral-100 text-neutral-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "on_the_way":
      return Truck;
    case "delivered":
    case "completed":
      return CheckCircle2;
    default:
      return Clock3;
  }
}

export default async function AdminHistoryPage({
  searchParams,
}: HistoryPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status =
    typeof params.status === "string" ? params.status.trim() : "all";

  const entries = await prisma.orderStatusHistory.findMany({
    include: {
      order: {
        include: {
          customer: true,
          _count: { select: { items: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 250,
  });

  const filtered = entries.filter((entry) => {
    const statusOk = status === "all" || entry.status === status;

    const searchOk =
      !q ||
      entry.order.orderCode.toLowerCase().includes(q.toLowerCase()) ||
      entry.order.fullName.toLowerCase().includes(q.toLowerCase()) ||
      entry.order.email.toLowerCase().includes(q.toLowerCase()) ||
      entry.order.phone.toLowerCase().includes(q.toLowerCase()) ||
      (entry.note || "").toLowerCase().includes(q.toLowerCase()) ||
      entry.status.toLowerCase().includes(q.toLowerCase());

    return statusOk && searchOk;
  });

  const activeFilters = Boolean(q || status !== "all");

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-4 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-neutral-950">
              History
            </h1>
            <p className="mt-2 text-[15px] text-neutral-500">
              Track order progress and status changes.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm">
            <CalendarDays className="h-4 w-4 text-neutral-500" />
            <span>
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </span>
          </div>
        </div>

        <div className="rounded-[18px] border border-neutral-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <form
              action="/admin/history"
              method="get"
              className="flex flex-1 items-center gap-3"
            >
              <input type="hidden" name="status" value={status} />

              <div className="relative w-full xl:max-w-[370px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search history..."
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />
              </div>

              <button className="inline-flex h-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800">
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Link
                href="/admin/history"
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  status === "all" && !q
                    ? "border-neutral-300 bg-neutral-100 text-neutral-900"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                All
              </Link>

              <Link
                href={`/admin/history?status=pending${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  status === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Clock3 className="h-4 w-4" />
                Pending
              </Link>

              <Link
                href={`/admin/history?status=on_the_way${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  status === "on_the_way"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Truck className="h-4 w-4" />
                On the way
              </Link>

              <Link
                href={`/admin/history?status=delivered${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  status === "delivered"
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Delivered
              </Link>

              <Link
                href={`/admin/history?status=completed${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  status === "completed"
                    ? "border-neutral-200 bg-neutral-100 text-neutral-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </Link>

              {activeFilters ? (
                <Link
                  href="/admin/history"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
              No history found.
            </div>
          ) : (
            filtered.map((entry) => {
              const Icon = statusIcon(entry.status);

              return (
                <Link
                  key={entry.id}
                  href={`/admin/orders/${entry.order.orderCode}`}
                  className="block overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
                >
                  <div className="grid gap-4 p-5 xl:grid-cols-[1fr_220px] xl:items-center">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[12px] font-medium ${statusBadgeClass(
                              entry.status,
                            )}`}
                          >
                            {statusLabel(entry.status)}
                          </span>

                          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12px] font-medium text-neutral-700">
                            {entry.order.orderCode}
                          </span>
                        </div>

                        <h2 className="mt-3 text-[18px] font-semibold text-neutral-950">
                          {entry.order.fullName}
                        </h2>

                        <p className="mt-2 text-[15px] text-neutral-500">
                          {entry.order.email} · {entry.order.phone}
                        </p>

                        <p className="mt-5 max-w-[620px] text-[15px] text-neutral-600">
                          {entry.note || "Status updated."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                            <Package className="h-3.5 w-3.5" />
                            {entry.order._count.items} item
                            {entry.order._count.items === 1 ? "" : "s"}
                          </span>

                          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-500">
                            {entry.order.city}, {entry.order.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 xl:flex-col xl:items-end xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                      <div className="text-right">
                        <p className="text-[16px] font-semibold text-neutral-950">
                          {formatDateTime(entry.createdAt)}
                        </p>
                        <p className="mt-2 text-[14px] text-neutral-500">
                          View order
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}