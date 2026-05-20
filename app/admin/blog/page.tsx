import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  CalendarDays,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminBlogToasts from "./AdminBlogToasts";

type BlogPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
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

function buildHref(params: {
  q?: string;
  status?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const str = query.toString();
  return str ? `/admin/blog?${str}` : "/admin/blog";
}

export default async function AdminBlogPage({ searchParams }: BlogPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status.trim() : "all";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const perPage = 7;

  const where = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
            { category: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const allPosts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const totalPosts = allPosts.length;
  const pageCount = Math.max(1, Math.ceil(totalPosts / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const posts = allPosts.slice(start, start + perPage);

  const publishedPosts = allPosts.filter((post) => post.status === "published").length;
  const draftPosts = allPosts.filter((post) => post.status === "draft").length;
  const archivedPosts = allPosts.filter((post) => post.status === "archived").length;

  const activeFilters = Boolean(q || status !== "all");

  return (
    <div className="min-h-screen bg-neutral-50 px-4 pt-8 pb-4 sm:px-6 lg:px-2">
      <AdminBlogToasts />
      <div className="mx-auto max-w-[1600px]">
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
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 items-center gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="flex h-12 items-center border-r border-neutral-200 px-4 text-sm text-neutral-700">
                {totalPosts} post{totalPosts === 1 ? "" : "s"}
              </div>

              <div className="flex h-12 items-center px-4 text-sm text-neutral-500">
                {publishedPosts} published, {draftPosts} draft
                {draftPosts === 1 ? "" : "s"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/blog/new"
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-neutral-200 bg-emerald-700 px-4 text-xs font-medium text-white transition hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4" />
                Add post
              </Link>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <form action="/admin/blog" method="get" className="flex w-full gap-3 xl:max-w-[420px]">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search posts"
                  className="h-11 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />
              </div>

              {activeFilters ? (
                <Link
                  href="/admin/blog"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Clear
                </Link>
              ) : null}
            </form>

            <div className="flex items-center gap-2">
              <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
                All posts
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>

              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="w-[28px] px-4 py-4 text-left text-xs font-medium text-neutral-500">
                    <span className="inline-flex h-4 w-4 rounded border border-neutral-300 bg-white" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Post
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-neutral-500">
                    Category
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
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => {
                    const hasCover = Boolean(post.coverImage);
                    const cover = post.coverImage || "/bags.png";

                    return (
                      <tr key={post.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                        <td className="px-4 py-4 align-middle">
                          <span className="inline-flex h-4 w-4 rounded border border-neutral-300 bg-white" />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-500">
                              {hasCover ? (
                                <img src={cover} alt={post.title} className="h-full w-full object-cover" />
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
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[12px] font-medium text-neutral-600">
                            <Tag className="h-3.5 w-3.5" />
                            {post.category || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-medium ${statusClass(post.status)}`}>
                            {statusLabel(post.status)}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <p className="text-sm text-neutral-500">
                            {post.publishedAt ? formatDate(post.publishedAt) : "Not set"}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <span className="inline-flex items-center gap-2 text-sm text-neutral-700">
                            <Eye className="h-4 w-4 text-neutral-400" />
                            {post.views || 0}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Link>
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
                href={buildHref({ q, status, page: Math.max(1, currentPage - 1) })}
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                  currentPage === 1
                    ? "pointer-events-none border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Link>

              {Array.from({ length: pageCount }, (_, index) => index + 1).map((p) => (
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
              ))}

              <Link
                href={buildHref({ q, status, page: Math.min(pageCount, currentPage + 1) })}
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
      </div>
    </div>
  );
}