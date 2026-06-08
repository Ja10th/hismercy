"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Search, LoaderCircle } from "lucide-react";

export default function MyOrdersSearchForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const safeEmail = email.trim();
    const safeOrderCode = orderCode.trim();

    if (!safeEmail || !safeOrderCode) return;

    setLoading(true);
    router.push(
      `/my-orders/search?email=${encodeURIComponent(safeEmail)}&orderCode=${encodeURIComponent(safeOrderCode)}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Order code
        </label>
        <input
          type="text"
          required
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          placeholder="ORD-XXXXXXXX"
          className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
        />
      </div>

      <div className="w-full ">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              View order
            </>
          )}
        </button>
      </div>
    </form>
  );
}
