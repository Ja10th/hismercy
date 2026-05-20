"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type OrdersSearchBarProps = {
  q: string;
  payment: string;
  status: string;
};

export function OrdersSearchBar({
  q,
  payment,
  status,
}: OrdersSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const params = new URLSearchParams();

      if (query.trim()) params.set("q", query.trim());
      if (payment !== "all") params.set("payment", payment);
      if (status !== "all") params.set("status", status);

      router.replace(params.toString() ? `/admin/orders?${params}` : "/admin/orders");
    }, 250);

    return () => window.clearTimeout(t);
  }, [query, payment, status, router]);

  return (
    <div className="relative w-full xl:max-w-[370px]">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search orders..."
        className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-200"
      />
    </div>
  );
}