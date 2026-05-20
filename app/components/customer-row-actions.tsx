"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, PencilLine, Eye, Trash2, Check } from "lucide-react";

type CustomerRowActionsProps = {
  customerId: string;
};

export function CustomerRowActions({ customerId }: CustomerRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setSelected((prev) => !prev)}
        aria-pressed={selected}
        className={`inline-flex h-4 w-4 items-center justify-center rounded border transition ${
          selected
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-neutral-300 bg-white"
        }`}
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {open ? (
          <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
            <Link
              href={`/admin/customers/${customerId}`}
              className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
            <Link
              href={`/admin/customers/${customerId}/edit`}
              className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-neutral-50"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}