"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";

export default function AdminOrdersToasts() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const deleted = searchParams.get("deleted") === "1";
    const updated = searchParams.get("updated") === "1";
    const error = searchParams.get("error") === "1";

    if (!deleted && !updated && !error) return;

    if (deleted) toast.success("Order deleted successfully.");
    if (updated) toast.success("Order updated successfully.");
    if (error) toast.error("Something went wrong.");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("deleted");
    params.delete("updated");
    params.delete("error");

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [pathname, router, searchParams]);

  return <Toaster position="top-right" richColors closeButton />;
}