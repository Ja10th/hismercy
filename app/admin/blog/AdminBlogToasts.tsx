"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";

export default function AdminBlogToasts() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      toast.success("Draft created successfully.");
    }

    if (searchParams.get("updated") === "1") {
      toast.success("Post updated successfully.");
    }

    if (searchParams.get("published") === "1") {
      toast.success("Post published successfully.");
    }

    if (searchParams.get("deleted") === "1") {
      toast.success("Post deleted successfully.");
    }
  }, [searchParams]);

  return <Toaster position="top-right" richColors closeButton />;
}