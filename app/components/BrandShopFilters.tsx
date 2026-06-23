"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

type BrandShopFiltersProps = {
  q: string;
  sort: string;
  brandName: string;
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

export default function BrandShopFilters({
  q,
  sort,
  brandName,
}: BrandShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(q);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentParamsRef = useRef<URLSearchParams>(new URLSearchParams());
  currentParamsRef.current = new URLSearchParams(searchParams.toString());

  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      const next = new URLSearchParams(currentParamsRef.current.toString());

      if (trimmed) next.set("q", trimmed);
      else next.delete("q");

      next.delete("page");

      const nextHref = next.toString()
        ? `${pathname}?${next.toString()}`
        : pathname;

      const currentHref = window.location.pathname + window.location.search;
      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [searchValue, pathname, router]);

  const clearSearch = () => {
    setSearchValue("");

    const next = new URLSearchParams(currentParamsRef.current.toString());
    next.delete("q");
    next.delete("page");

    const href = next.toString() ? `${pathname}?${next.toString()}` : pathname;
    router.replace(href, { scroll: false });
  };

  const updateSort = (value: string) => {
    startTransition(() => {
      const next = new URLSearchParams(currentParamsRef.current.toString());
      if (value && value !== "featured") next.set("sort", value);
      else next.delete("sort");

      next.delete("page");

      const href = next.toString()
        ? `${pathname}?${next.toString()}`
        : pathname;

      if (href !== window.location.pathname + window.location.search) {
        router.push(href, { scroll: false });
      }
    });
  };

  const hasNonSearchFilters = sort !== "featured";

  const clearAllHref = buildHref(pathname, currentParamsRef.current, {
    q: undefined,
    sort: undefined,
    page: undefined,
  });

  const sortSelect = (
    <div className="flex h-10 w-28 shrink-0 items-center overflow-hidden rounded-xl border border-neutral-200 bg-[#f1f1f1]">
      <div className="flex h-full items-center gap-1.5 px-3">
        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        <select
          value={sort}
          onChange={(e) => updateSort(e.target.value)}
          className="w-[130px] cursor-pointer appearance-none bg-transparent pr-1 text-sm text-neutral-700 outline-none"
        >
          <option value="featured">Featured</option>
          <option value="price_asc">Low price</option>
          <option value="price_desc">High price</option>
        </select>
      </div>
    </div>
  );

  const clearBtn = hasNonSearchFilters ? (
    <Link
      href={clearAllHref}
      className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
    >
      <X className="h-3.5 w-3.5" />
      Clear
    </Link>
  ) : null;

  return (
    <div className="-mx-4 px-4 py-1 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="hidden sm:inline-flex w-full flex-col items-center justify-center gap-3 pt-1">
        <div className="flex items-center justify-start gap-3">
          <div className="relative w-56 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Search ${brandName} products…`}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-8 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-100"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {sortSelect}
          {clearBtn}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Search ${brandName}…`}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-8 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-100"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {sortSelect}
          {clearBtn}
        </div>
      </div>
    </div>
  );
}