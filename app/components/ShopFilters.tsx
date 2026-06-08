"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpDown, Search, X } from "lucide-react";

type Brand = {
  id: string;
  name: string;
};

type ShopFiltersProps = {
  brands: Brand[];
  q: string;
  brand: string;
  sort: string;
};

function buildHref(
  pathname: string,
  currentParams: URLSearchParams,
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams(currentParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (!value) params.delete(key);
    else params.set(key, value);
  }

  params.delete("page");

  const stringified = params.toString();
  return stringified ? `${pathname}?${stringified}` : pathname;
}

export default function ShopFilters({
  brands,
  q,
  brand,
  sort,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(q);

  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  const searchParamsString = searchParams.toString();

  const currentParams = useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      const next = new URLSearchParams(currentParams.toString());

      if (trimmed) next.set("q", trimmed);
      else next.delete("q");

      next.delete("page");

      const nextHref = next.toString() ? `${pathname}?${next.toString()}` : pathname;
      const currentHref =
        window.location.pathname + window.location.search;

      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [searchValue, currentParams, pathname, router]);

  const updateSort = (value: string) => {
    startTransition(() => {
      const next = new URLSearchParams(currentParams.toString());

      if (value && value !== "featured") next.set("sort", value);
      else next.delete("sort");

      next.delete("page");

      const href = next.toString() ? `${pathname}?${next.toString()}` : pathname;
      if (href !== window.location.pathname + window.location.search) {
        router.push(href, { scroll: false });
      }
    });
  };

  const clearAllHref = buildHref(pathname, currentParams, {
    q: undefined,
    brand: undefined,
    sort: undefined,
    page: undefined,
  });

  return (
    <div className="z-20 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products…"
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-10 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-100"
            />
            {searchValue ? (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <select
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="h-10 cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-neutral-950"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {(q || brand || sort !== "featured") && (
            <Link
              href={clearAllHref}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Link>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href={buildHref(pathname, currentParams, {
            brand: undefined,
          })}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
            !brand
              ? "bg-emerald-700 text-white"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
          }`}
        >
          All brands
        </Link>

        {brands.map((b) => (
          <Link
            key={b.id}
            href={buildHref(pathname, currentParams, {
              brand: b.id,
            })}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              brand === b.id
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {b.name}
          </Link>
        ))}
      </div>
    </div>
  );
}