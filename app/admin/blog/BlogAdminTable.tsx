"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Search,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { bulkBlogAction, deleteBlogPost, setBlogPostStatus } from "./actions";
import { BsDownload } from "react-icons/bs";
import { BiEditAlt } from "react-icons/bi";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  coverImage: string | null;
  status: string;
  publishedAt: Date | null;
  views: number;
};

type Props = {
  posts: BlogPost[];
  q: string;
  status: string;
  currentPage: number;
  pageCount: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "published":
      return "Published";
    case "draft":
      return "Draft";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "archived":
      return "border-neutral-200 bg-neutral-100 text-neutral-700";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
  }
}

function buildHref(params: { q?: string; status?: string; page?: number }) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const str = query.toString();
  return str ? `/admin/blog?${str}` : "/admin/blog";
}

export default function BlogAdminTable({
  posts,
  q,
  status,
  currentPage,
  pageCount,
  totalPosts,
  publishedPosts,
  draftPosts,
  archivedPosts,
}: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const openMenuRef = useRef<HTMLDivElement | null>(null);

  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);
  const allSelected = posts.length > 0 && selectedIds.length === posts.length;

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (openMenuRef.current && !openMenuRef.current.contains(target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    setSelectedIds([]);
    setOpenMenuId(null);
  }, [q, status, currentPage]);

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) => (prev.length === posts.length ? [] : postIds));
  };

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Blog
          </h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            Manage articles, drafts, and published posts.
          </p>
        </div>
      </div>

      <div className="rounded-[18px] py-4">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="flex h-11 items-center border-r border-neutral-200 px-4 text-sm text-neutral-700">
              {totalPosts} post{totalPosts === 1 ? "" : "s"}
            </div>

            <div className="flex h-11 items-center px-4 text-sm text-neutral-500">
              {publishedPosts} published, {draftPosts} draft
              {draftPosts === 1 ? "" : "s"}
            </div>

            <div className="flex h-11 items-center px-4 text-sm text-neutral-500">
              {archivedPosts} archived
            </div>
          </div>
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center ">
            <form
              action="/admin/blog"
              method="get"
              className="flex w-full gap-3 xl:max-w-[420px]"
            >
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="page" value="1" />

              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search posts"
                  className="h-11 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />
              </div>

              {q || status !== "all" ? (
                <Link
                  href="/admin/blog"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Clear
                </Link>
              ) : null}
            </form>

            <div className="flex items-center ">
              <details className="relative">
                <summary className="relative inline-flex h-11 w-52 text-center cursor-pointer list-none items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
                  {status === "all" ? "All posts" : statusLabel(status)}
                  <ChevronDown className="absolute right-2 h-4 w-4 text-neutral-400" />
                </summary>

                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                  {[
                    { label: "All posts", value: "all" },
                    { label: "Published", value: "published" },
                    { label: "Draft", value: "draft" },
                    { label: "Archived", value: "archived" },
                  ].map((item) => (
                    <Link
                      key={item.value}
                      href={buildHref({ q, status: item.value })}
                      className="block px-4 py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </div>

          <div className="">
            {selectedIds.length > 0 ? (
              <div className="px-1 py-2">
                <form
                  action={bulkBlogAction}
                  className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <input
                    type="hidden"
                    name="ids"
                    value={JSON.stringify(selectedIds)}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="inline-flex h-11 items-center rounded-2xl border border-red-200 bg-red-400/10 text-red-400 px-5 text-sm font-medium  transition hover:bg-neutral-50"
                    >
                      Clear
                    </button>
                    <select
                      name="action"
                      defaultValue="delete"
                      className="h-11 rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none"
                    >
                      <option value="delete">Delete selected</option>
                      <option value="unpublish">Unpublish selected</option>
                      <option value="publish">Publish selected</option>
                    </select>

                    <button className="inline-flex h-11 items-center rounded-2xl border border-neutral-200 bg-neutral-800 px-5 text-sm font-medium text-white transition hover:bg-neutral-900">
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/blog/new"
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-neutral-200 bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add post
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-neutral-50">
                <th className="w-[28px] px-4 py-4 text-left text-xs font-medium text-neutral-500">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="inline-flex h-4 w-4 rounded border border-neutral-300 bg-white"
                    aria-label={allSelected ? "Deselect all" : "Select all"}
                  >
                    {allSelected ? (
                      <span className="m-auto block h-2.5 w-2.5 rounded-[2px] bg-neutral-900" />
                    ) : null}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                  Post
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                  Published
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                  Views
                </th>
                <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-neutral-500"
                  >
                    No posts found.
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const hasCover = Boolean(post.coverImage);
                  const cover = post.coverImage || "/bags.png";
                  const menuOpen = openMenuId === post.id;
                  const isSelected = selectedIds.includes(post.id);

                  return (
                    <tr
                      key={post.id}
                      onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/admin/blog/${post.id}/edit`);
                        }
                      }}
                      tabIndex={0}
                      className={`cursor-pointer border-t border-neutral-200  focus:bg-neutral-50/60 ${isSelected ? "bg-blue-50/60 hover:bg-blue-50/60" : "hover:bg-neutral-50/60"}`}
                    >
                      <td
                        className="px-4 py-4 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => toggleOne(post.id)}
                          className="inline-flex h-4 w-4 rounded border border-neutral-300 bg-white"
                          aria-label={`Select ${post.title}`}
                        >
                          {isSelected ? (
                            <span className="m-auto block h-2.5 w-2.5 rounded-[2px] bg-emerald-700" />
                          ) : null}
                        </button>
                      </td>

                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-500">
                            {hasCover ? (
                              <Image
                                src={cover}
                                alt={post.title}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-5 w-5" />
                            )}
                          </div>

                          <div>
                            <p className="text-[15px] font-medium text-neutral-950">
                              {post.title}
                            </p>
                            <p className="mt-1 text-xs text-neutral-400">
                              {post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-medium ${statusClass(post.status)}`}
                        >
                          {statusLabel(post.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-middle">
                        <p className="text-sm text-neutral-500">
                          {post.publishedAt
                            ? formatDate(post.publishedAt)
                            : "Not set"}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-middle">
                        <span className="inline-flex items-center gap-2 text-sm text-neutral-700">
                          <Eye className="h-4 w-4 text-neutral-400" />
                          {post.views || 0}
                        </span>
                      </td>

                      <td
                        className="px-4 py-4 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          ref={menuOpen ? openMenuRef : undefined}
                          className="relative inline-block"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(menuOpen ? null : post.id)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition "
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {menuOpen ? (
                            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                              <Link
                                href={`/admin/blog/${post.id}/edit`}
                                className="block px-4 py-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <BiEditAlt className="h-4 w-4 inline-block mr-2" />
                                Edit
                              </Link>

                              <form action={setBlogPostStatus}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={post.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value={
                                    post.status === "published"
                                      ? "draft"
                                      : "published"
                                  }
                                />
                                <button
                                  type="submit"
                                  className="block w-full px-4 py-3 text-left text-sm text-neutral-700 transition hover:bg-neutral-50"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <BsDownload className="h-4 w-4 inline-block mr-2" />
                                  {post.status === "published"
                                    ? "Unpublish"
                                    : "Publish"}
                                </button>
                              </form>

                              <form action={deleteBlogPost}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={post.id}
                                />
                                <button
                                  type="submit"
                                  className="block w-full px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <Trash2 className="h-4 w-4 inline-block mr-2" />
                                  Delete
                                </button>
                              </form>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            Page {currentPage} of {pageCount}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildHref({
                q,
                status,
                page: Math.max(1, currentPage - 1),
              })}
              className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                currentPage === 1
                  ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Link>

            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (p) => (
                <Link
                  key={p}
                  href={buildHref({ q, status, page: p })}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-sm font-medium transition ${
                    p === currentPage
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                </Link>
              ),
            )}

            <Link
              href={buildHref({
                q,
                status,
                page: Math.min(pageCount, currentPage + 1),
              })}
              className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                currentPage === pageCount
                  ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-4 text-xs text-center text-neutral-400">
        Tip: clicking anywhere on a row opens the editor.
      </div>
    </>
  );
}
