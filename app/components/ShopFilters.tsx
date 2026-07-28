"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  X,
} from "lucide-react";

type Brand = { id: string; name: string };
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const brandScrollRef = useRef<HTMLDivElement | null>(null);

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

  const hasNonSearchFilters = Boolean(brand || sort !== "featured");

  const clearAllHref = buildHref(pathname, currentParamsRef.current, {
    q: undefined,
    brand: undefined,
    sort: undefined,
    page: undefined,
  });

  useEffect(() => {
    const el = brandScrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    };

    updateScrollState();
    const raf = requestAnimationFrame(updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    el.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [brands.length]);

  const scrollBrands = (direction: "left" | "right") => {
    const el = brandScrollRef.current;
    if (!el) return;

    el.scrollBy({
      left:
        direction === "left"
          ? -Math.floor(el.clientWidth * 0.7)
          : Math.floor(el.clientWidth * 0.7),
      behavior: "smooth",
    });
  };

  const sortSelect = (
    <div className="flex w-26 h-10 items-center overflow-hidden rounded-xl border border-neutral-200 bg-[#f1f1f1] shrink-0">
      <div className="flex items-center gap-1.5 px-3 h-full">
        <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        <select
          value={sort}
          onChange={(e) => updateSort(e.target.value)}
          className="cursor-pointer appearance-none bg-transparent text-sm text-neutral-700 outline-none pr-1 w-[130px]"
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
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 transition hover:bg-red-100 whitespace-nowrap"
    >
      <X className="h-3.5 w-3.5" />
      Clear
    </Link>
  ) : null;

  const brandPills = (
    <div className="relative min-w-0 flex-1">
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent transition-opacity ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        type="button"
        onClick={() => scrollBrands("left")}
        disabled={!canScrollLeft}
        aria-label="Scroll brands left"
        className={`absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-emerald-200 bg-white p-1 shadow-sm transition ${
          canScrollLeft
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronLeft className="h-3.5 w-3.5 text-neutral-700" />
      </button>

      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent transition-opacity ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        type="button"
        onClick={() => scrollBrands("right")}
        disabled={!canScrollRight}
        aria-label="Scroll brands right"
        className={`absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-emerald-200 bg-white p-1 shadow-sm transition ${
          canScrollRight
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronRight className="h-3.5 w-3.5 text-neutral-700" />
      </button>

      <div
        ref={brandScrollRef}
        className="brand-scroll overflow-x-auto pb-1 px-6 md:px-0"
      >
        <div className="flex w-max gap-2">
          <Link
            href={buildHref(pathname, currentParamsRef.current, {
              brand: undefined,
            })}
            className={`shrink-0 rounded-xl  border px-3.5 py-2 text-xs md:text-sm font-medium transition ${
              !brand
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
            }`}
          >
            All brands
          </Link>

          {brands.map((b) => (
            <Link
              key={b.id}
              href={buildHref(pathname, currentParamsRef.current, {
                brand: b.id,
              })}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs md:text-sm font-medium transition ${
                brand === b.id
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="-mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      {/* Desktop */}
      <div className="">
        <div className="hidden sm:inline-flex  w-full flex-col  justify-center pt-2 items-center   gap-3">
          <div className="flex items-center gap-3 justify-start">
            <div className="relative w-56 shrink-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search…"
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
            <Link
              href="/custom-order"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 whitespace-nowrap"
            >
              <ClipboardList className="h-4 w-4" />
              Custom Order
            </Link>
          </div>

          <div className="pt-4">{brandPills}</div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
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

        <Link
          href="/custom-order"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <ClipboardList className="h-4 w-4" />
          Custom Order
        </Link>

        {brandPills}
      </div>

      <style jsx>{`
        .brand-scroll {
          scrollbar-width: thin;
          scrollbar-color: #a3a3a3 #f5f5f5;
        }
        .brand-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .brand-scroll::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 9999px;
        }
        .brand-scroll::-webkit-scrollbar-thumb {
          background: #a3a3a3;
          border-radius: 9999px;
        }
        .brand-scroll::-webkit-scrollbar-thumb:hover {
          background: #737373;
        }
      `}</style>
    </div>
  );
}
