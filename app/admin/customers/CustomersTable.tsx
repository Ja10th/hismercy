"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CiImport } from "react-icons/ci";
import { CiExport } from "react-icons/ci";
import { GoPlus } from "react-icons/go";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  MoreVertical,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { bulkDeleteCustomers, deleteCustomer } from "./actions";

type CustomerStatusFilter = "all" | "subscribed" | "pending" | "not_subscribed";

type CustomerRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  revenue: number;
  hasPaidRevenue: boolean;
  _count: { orders: number };
  orders: {
    id: string;
    orderCode: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: Date;
  }[];
};

type CustomersTableProps = {
  customers: CustomerRow[];
  query: string;
  status: CustomerStatusFilter;
  totalCount: number;
  paidPercent: number;
  currentPage: number;
  pageCount: number;
  allEmails: string[];
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function subscriptionLabel(hasPaidRevenue: boolean, hasOrders: boolean) {
  if (hasPaidRevenue) return "Subscribed";
  if (hasOrders) return "Pending";
  return "Not subscribed";
}

function subscriptionClass(hasPaidRevenue: boolean, hasOrders: boolean) {
  if (hasPaidRevenue)
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (hasOrders) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-600";
}

function buildHref(params: { q?: string; status?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const str = query.toString();
  return str ? `/admin/customers?${str}` : "/admin/customers";
}

function RowActions({
  customer,
  openUp = false,
}: {
  customer: CustomerRow;
  openUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white hover:border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className={`absolute right-0 z-30 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg ${
            openUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <a
            href={`mailto:${customer.email}`}
            className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Mail className="h-4 w-4" />
            Send email
          </a>

          <form action={deleteCustomer}>
            <input type="hidden" name="id" value={customer.id} />
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => setOpen(false)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default function CustomersTable({
  customers,
  query,
  status,
  totalCount,
  paidPercent,
  currentPage,
  pageCount,
  allEmails,
}: CustomersTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, query, status]);

  const selectedCustomers = useMemo(
    () => customers.filter((customer) => selectedIds.includes(customer.id)),
    [customers, selectedIds],
  );

  const allSelected =
    customers.length > 0 && selectedIds.length === customers.length;

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === customers.length ? [] : customers.map((c) => c.id),
    );
  };

  const mailSelectedHref = useMemo(() => {
    const emails = selectedCustomers.map((c) => c.email).filter(Boolean);
    if (emails.length === 0) return "#";
    return `mailto:${emails.join(",")}`;
  }, [selectedCustomers]);

  const mailEveryoneHref = useMemo(() => {
    if (allEmails.length === 0) return "#";
    return `mailto:${allEmails.join(",")}`;
  }, [allEmails]);

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Customers
          </h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            Saved customer records and order history.
          </p>
        </div>
      </div>

      <div className="rounded-[18px] py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="flex h-1 items-center border-r border-neutral-200 px-4 text-sm text-neutral-700">
              {totalCount} customer{totalCount === 1 ? "" : "s"}
            </div>

            <div className="flex h-11 items-center px-4 text-sm text-neutral-500">
              {paidPercent}% subscribed
            </div>
          </div>
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <form
              action="/admin/customers"
              method="get"
              className="flex w-full gap-3 xl:max-w-[420px]"
            >
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="page" value="1" />

              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search customer"
                  className="h-11 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />
              </div>

              {query || status !== "all" ? (
                <Link
                  href="/admin/customers"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-100 px-4 text-sm font-medium text-red-500 transition hover:bg-neutral-50"
                >
                  Clear
                </Link>
              ) : null}
            </form>
          </div>

          <div className="flex items-center gap-2">
            <details className="relative">
              <summary className="inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
                {status === "all" ? "All customers" : status}
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </summary>

              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                {[
                  { label: "All customers", value: "all" },
                  { label: "Subscribed", value: "subscribed" },
                  { label: "Pending", value: "pending" },
                  { label: "Not subscribed", value: "not_subscribed" },
                ].map((item) => (
                  <Link
                    key={item.value}
                    href={buildHref({ q: query, status: item.value })}
                    className="block px-4 py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
            {selectedIds.length > 0 ? (
              <div className="">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="inline-flex h-11 items-center rounded-2xl border border-red-200 bg-red-400/10 text-red-400 px-5 text-sm transition hover:bg-neutral-50"
                    >
                      Clear
                    </button>
                    <a
                      href={mailSelectedHref}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-400/10 px-5 py-1 text-sm font-medium text-blue-400 inset-ring inset-ring-blue-400/30"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>

                    <form action={bulkDeleteCustomers}>
                      <input
                        type="hidden"
                        name="ids"
                        value={JSON.stringify(selectedIds)}
                      />
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <thead>
            <tr className="bg-neutral-50">
              <th className="w-12 px-4 py-4 text-left text-xs font-medium text-neutral-500">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="inline-flex h-4 w-4 rounded border border-neutral-300 bg-white"
                  aria-label={allSelected ? "Deselect all" : "Select all"}
                >
                  {allSelected ? (
                    <span className="m-auto block h-2.5 w-2.5 rounded-[2px] bg-neutral-900" />
                  ) : null}
                </button>
              </th>

              <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                Customers
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                Email
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                Phone
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                Location
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                Orders
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                Amount Spent
              </th>
              <th className="w-20 px-4 py-4 text-left text-sm font-medium text-neutral-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-neutral-500"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer, index) => {
                const checked = selectedIds.includes(customer.id);
                const openUp = index >= customers.length - 2;

                return (
                  <tr
                    key={customer.id}
                    className="border-t border-neutral-200 hover:bg-neutral-50/60"
                  >
                    <td className="px-4 py-4 align-middle">
                      <input
                        type="checkbox"
                        aria-label={`Select ${customer.fullName}`}
                        checked={checked}
                        onChange={() => toggleOne(customer.id)}
                        className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                      />
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium text-neutral-950">
                            {customer.fullName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <p className="truncate text-sm text-neutral-700">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <p className="truncate text-sm text-neutral-700">
                        {customer.phone}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <p className="truncate text-sm text-neutral-500">
                        {customer.city}, {customer.state}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <p className="text-sm text-neutral-700">
                        {customer._count.orders} Order
                        {customer._count.orders === 1 ? "" : "s"}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <p className="text-sm font-medium text-neutral-700">
                        {formatNaira(customer.revenue)}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-middle">
                      <RowActions customer={customer} openUp={openUp} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            Page {currentPage} of {pageCount}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildHref({
                q: query,
                status,
                page: Math.max(1, currentPage - 1),
              })}
              className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
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
                  href={buildHref({ q: query, status, page: p })}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-sm font-medium transition ${
                    p === currentPage
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </Link>
              ),
            )}

            <Link
              href={buildHref({
                q: query,
                status,
                page: Math.min(pageCount, currentPage + 1),
              })}
              className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
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
    </>
  );
}
