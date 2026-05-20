"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function BlogSearchBar({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQueryString = searchParams.toString();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const targetUrl = useMemo(() => {
    const next = new URLSearchParams(currentQueryString);
    const q = value.trim();

    if (q) next.set("q", q);
    else next.delete("q");

    next.delete("page");

    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [currentQueryString, pathname, value]);

  useEffect(() => {
    const currentUrl = currentQueryString
      ? `${pathname}?${currentQueryString}`
      : pathname;

    if (targetUrl === currentUrl) return;

    const timer = setTimeout(() => {
      router.replace(targetUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [targetUrl, currentQueryString, pathname, router]);

  return (
    <div className="flex h-12 w-full max-w-xl items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 px-4">
      <Search className="h-4 w-4 text-neutral-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles..."
        className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}