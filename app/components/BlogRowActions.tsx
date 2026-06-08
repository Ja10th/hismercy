"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { deleteBlogPost, setBlogPostStatus } from "../admin/blog/actions";

export function BlogRowActions({ post }: { post: { id: string; status: string } }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
          <Link
            href={`/admin/blog/${post.id}/edit`}
            className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Edit
          </Link>

          <form action={setBlogPostStatus}>
            <input type="hidden" name="id" value={post.id} />
            <input
              type="hidden"
              name="status"
              value={post.status === "published" ? "draft" : "published"}
            />
            <button
              type="submit"
              className="block w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {post.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </form>

          <form action={deleteBlogPost}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}