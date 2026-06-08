"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Filter, LayoutGrid, List, Search } from "lucide-react";

function buildHref(
  pathname: string,
  params: {
    q?: string;
    sort?: string;
    view?: "grid" | "list";
    page?: number;
  },
) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.view) searchParams.set("view", params.view);
  if (params.page) searchParams.set("page", String(params.page));

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function BrandsToolbar({
  q,
  sort,
  view,
}: {
  q: string;
  sort: string;
  view: "grid" | "list";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const href = buildHref(pathname, {
        q: normalizedQuery || undefined,
        sort,
        view,
        page: 1,
      });

      router.replace(href, { scroll: false });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [normalizedQuery, pathname, router, sort, view]);

  const currentSort = searchParams.get("sort") ?? sort;
  const currentView = (
    searchParams.get("view") === "list" ? "list" : "grid"
  ) as "grid" | "list";

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-500">
          <Search className="h-4 w-4" />
          <input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands…"
            className="w-44 bg-transparent outline-none placeholder:text-neutral-400"
          />
        </div>

        <details className="relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100">
            <Filter className="h-4 w-4" />
            Filter
            <ChevronDown className="h-4 w-4" />
          </summary>

          <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
            <Link
              href={buildHref(pathname, {
                q: normalizedQuery || undefined,
                sort: "created_desc",
                view: currentView,
                page: 1,
              })}
              className={`block rounded-xl px-3 py-2 text-sm hover:bg-neutral-100 ${
                currentSort === "created_desc"
                  ? "text-emerald-700"
                  : "text-neutral-700"
              }`}
            >
              Newest
            </Link>

            <Link
              href={buildHref(pathname, {
                q: normalizedQuery || undefined,
                sort: "name_asc",
                view: currentView,
                page: 1,
              })}
              className={`block rounded-xl px-3 py-2 text-sm hover:bg-neutral-100 ${
                currentSort === "name_asc"
                  ? "text-emerald-700"
                  : "text-neutral-700"
              }`}
            >
              Name A–Z
            </Link>

            <Link
              href={buildHref(pathname, {
                q: normalizedQuery || undefined,
                sort: "name_desc",
                view: currentView,
                page: 1,
              })}
              className={`block rounded-xl px-3 py-2 text-sm hover:bg-neutral-100 ${
                currentSort === "name_desc"
                  ? "text-emerald-700"
                  : "text-neutral-700"
              }`}
            >
              Name Z–A
            </Link>
          </div>
        </details>

        <Link
          href={buildHref(pathname, {
            q: normalizedQuery || undefined,
            sort: currentSort,
            view: "grid",
            page: 1,
          })}
          className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
            currentView === "grid"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Grid
        </Link>

        <Link
          href={buildHref(pathname, {
            q: normalizedQuery || undefined,
            sort: currentSort,
            view: "list",
            page: 1,
          })}
          className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
            currentView === "list"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100"
          }`}
        >
          <List className="h-4 w-4" />
          List
        </Link>
      </div>
    </div>
  );
}