"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Grid2X2, LayoutList, Search, X } from "lucide-react";
import { IoGrid } from "react-icons/io5";
import { MdFormatListBulleted } from "react-icons/md";

type BrandOption = {
  id: string;
  name: string;
  slug: string;
};

type QueryState = {
  q?: string;
  brand?: string;
  status?: string;
  sort?: string;
  view?: string;
};

export default function ProductsToolbar({
  brands,
  currentQuery,
}: {
  brands: BrandOption[];
  currentQuery: QueryState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(currentQuery.q || "");

  useEffect(() => {
    setQ(currentQuery.q || "");
  }, [currentQuery.q]);

  const buildUrl = useMemo(() => {
    return (patch: Partial<QueryState> = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      const nextQ = patch.q ?? currentQuery.q;
      const nextBrand = patch.brand ?? currentQuery.brand;
      const nextStatus = patch.status ?? currentQuery.status;
      const nextSort = patch.sort ?? currentQuery.sort;
      const nextView = patch.view ?? currentQuery.view;

      if (nextQ?.trim()) params.set("q", nextQ.trim());
      else params.delete("q");

      if (nextBrand) params.set("brand", nextBrand);
      else params.delete("brand");

      if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
      else params.delete("status");

      if (nextSort && nextSort !== "featured") params.set("sort", nextSort);
      else params.delete("sort");

      if (nextView && nextView !== "grid") params.set("view", nextView);
      else params.delete("view");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    };
  }, [currentQuery.brand, currentQuery.q, currentQuery.sort, currentQuery.status, currentQuery.view, pathname, router, searchParams]);

  useEffect(() => {
    const trimmed = q.trim();
    const current = (currentQuery.q || "").trim();

    if (trimmed === current) return;

    const timer = setTimeout(() => {
      buildUrl({ q: trimmed });
    }, 350);

    return () => clearTimeout(timer);
  }, [q, currentQuery.q, buildUrl]);

  function updateField(name: keyof QueryState, value: string) {
    buildUrl({ [name]: value } as Partial<QueryState>);
  }

  const view = currentQuery.view === "list" ? "list" : "grid";
  const status = currentQuery.status || "all";
  const sort = currentQuery.sort || "featured";
  const brand = currentQuery.brand || "";

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>

        <label className="relative">
          <select
            value={brand}
            onChange={(e) => updateField("brand", e.target.value)}
            className="h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-neutral-400"
          >
            <option value="">Category</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </label>

        <label className="relative">
          <select
            value={status}
            onChange={(e) => updateField("status", e.target.value)}
            className="h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-neutral-400"
          >
            <option value="all">Status</option>
            <option value="featured">Featured</option>
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </label>

        <label className="relative">
          <select
            value={sort}
            onChange={(e) => updateField("sort", e.target.value)}
            className="h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-neutral-400"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="price_asc">Sort by: Price low</option>
            <option value="price_desc">Sort by: Price high</option>
            <option value="name_asc">Sort by: Name</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <button
            type="button"
            onClick={() => buildUrl({ view: "grid" })}
            className={[
              "inline-flex h-12 w-12 items-center border border-r border-t-0 border-b-0 border-l-0 border-neutral-200 justify-center transition",
              view === "grid"
                ? "text-black "
                : "text-gray-400 hover:bg-neutral-100",
            ].join(" ")}
            aria-label="Grid view"
          >
            <IoGrid  className="h-4 w-4"/>
          </button>

          <button
            type="button"
            onClick={() => buildUrl({ view: "list" })}
            className={[
              "inline-flex h-12 w-12 items-center justify-center transition",
              view === "list"
                ? "text-black"
                : "text-neutral-400 hover:bg-neutral-100",
            ].join(" ")}
            aria-label="List view"
          >
            <MdFormatListBulleted className="h-4 w-4"/>
          </button>
        </div>

        {q || brand || status !== "all" || sort !== "featured" ? (
          <button
            type="button"
            onClick={() => router.replace(pathname)}
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}