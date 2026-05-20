"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Download,
  Plus,
  Search,
  Upload,
} from "lucide-react";

type CustomersToolbarProps = {
  query: string;
  status: string;
  totalCount: number;
  paidPercent: number;
};

export function CustomersToolbar({
  query,
  status,
  totalCount,
  paidPercent,
}: CustomersToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [inputValue, setInputValue] = useState(query);
  const [menuOpen, setMenuOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pushParams = (nextQuery: string, nextStatus: string) => {
    const params = new URLSearchParams();

    const cleanQuery = nextQuery.trim();
    if (cleanQuery) params.set("q", cleanQuery);
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);

    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(url);
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      pushParams(value, status);
    }, 250);
  };

  const setFilter = (nextStatus: string) => {
    setMenuOpen(false);
    pushParams(inputValue, nextStatus);
  };

  const clearFilters = () => {
    setMenuOpen(false);
    setInputValue("");
    router.replace(pathname);
  };

  const hasActiveFilter = Boolean(query || (status && status !== "all"));

  return (
    <div className="rounded-[18px] py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 items-center gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="flex h-12 items-center border-r border-neutral-200 px-4 text-sm text-neutral-700">
            {totalCount} customer{totalCount === 1 ? "" : "s"}
          </div>

          <div className="flex h-12 items-center px-4 text-sm text-neutral-500">
            {paidPercent}% of your customer base
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/customers/import"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <Upload className="h-4 w-4" />
            Import
          </Link>

          <Link
            href="/admin/customers/export"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <Download className="h-4 w-4" />
            Export
          </Link>

          <Link
            href="/admin/customers/new"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-700 px-4 text-xs font-medium text-white transition hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full gap-3 xl:max-w-[520px]">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search customer"
              className="h-11 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-200"
            />
          </div>

          {hasActiveFilter ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-100 px-4 text-xs font-medium text-red-500 transition hover:bg-neutral-50"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Add filter
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-neutral-50"
              >
                All customers
              </button>
              <button
                type="button"
                onClick={() => setFilter("subscribed")}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-neutral-50"
              >
                Subscribed
              </button>
              <button
                type="button"
                onClick={() => setFilter("pending")}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-neutral-50"
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setFilter("not_subscribed")}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-neutral-50"
              >
                Not subscribed
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}