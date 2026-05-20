"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Download, Trash2, Truck, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function OrderActions({ orderCode }: { orderCode: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setShowDeleteConfirm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function changeStatus(
    status: "on_the_way" | "delivered" | "completed",
  ) {
    try {
      setPending(true);

      const response = await fetch(`/api/admin/orders/${orderCode}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to update order status",
        );
      }

      setOpen(false);
      toast.success("Order updated successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update order status",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    try {
      setPending(true);

      const response = await fetch(`/api/admin/orders/${orderCode}`, {
        method: "DELETE",
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to delete order",
        );
      }

      setShowDeleteConfirm(false);
      setOpen(false);
      toast.success("Order deleted successfully.");
      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete order",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={pending}
        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-medium text-neutral-900 disabled:opacity-60"
      >
        Actions
        <ChevronDown className="h-4 w-4 text-neutral-500" />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          <Link
            href={`/admin/orders/${orderCode}/receipt`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
          >
            <Download className="h-4 w-4" />
            Download receipt
          </Link>
          <button
            type="button"
            onClick={() => changeStatus("on_the_way")}
            disabled={pending}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-60"
          >
            <Truck className="h-4 w-4" />
            Mark as on the way
          </button>

          <button
            type="button"
            onClick={() => changeStatus("delivered")}
            disabled={pending}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as delivered
          </button>

          <button
            type="button"
            onClick={() => changeStatus("completed")}
            disabled={pending}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as completed
          </button>

          <div className="my-2 border-t border-neutral-200" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setShowDeleteConfirm(true);
            }}
            disabled={pending}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Delete order
          </button>
        </div>
      ) : null}

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Delete this order?
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  This action cannot be undone. The order will be permanently
                  removed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={pending}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-60"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={pending}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? "Deleting..." : "Delete order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
