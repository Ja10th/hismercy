import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlogSearchBar from "./BlogSearchBar";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 6;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildBlogHref({ q, page }: { q?: string; page?: number }) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}) {
  const now = new Date();
  const resolvedSearchParams = await searchParams;

  const q = String(resolvedSearchParams.q ?? "").trim();
  const requestedPage = Number(resolvedSearchParams.page ?? "1");
  const pageCandidate =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const baseWhere = {
    OR: [
      { status: "published" as const },
      {
        status: "scheduled" as const,
        scheduledAt: { lte: now },
      },
    ],
  };

  const where = q
    ? {
        AND: [
          baseWhere,
          {
            title: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : baseWhere;

  const totalPosts = await prisma.blogPost.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const currentPage = Math.min(pageCandidate, totalPages);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take: PAGE_SIZE,
  });

  const startItem = totalPosts === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + PAGE_SIZE, totalPosts);
  const hrefForPage = (page: number) =>
    buildBlogHref({ q: q || undefined, page });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-[1280px] px-8 pb-16 pt-32 md:pt-32 md:pb-32">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-emerald-600">
                  Our Blog
                </p>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
                  Stay Informed.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
                  Insights, tips, and stories to help your business grow, make
                  better decisions, and stay ahead.
                </p>
              </div>

              <div className="relative hidden h-[220px] items-center justify-center lg:flex">
                <div className="absolute inset-0 rounded-[2rem] bg-emerald-50/60 blur-3xl" />
                <div className="relative h-[180px] w-[320px] rounded-[2rem] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <div className="absolute left-8 top-8 h-14 w-14 rounded-2xl bg-neutral-100" />
                  <div className="absolute left-28 top-6 h-2 w-36 rounded-full bg-neutral-200" />
                  <div className="absolute left-28 top-12 h-2 w-28 rounded-full bg-neutral-200" />
                  <div className="absolute left-28 top-18 h-2 w-24 rounded-full bg-neutral-200" />
                  <div className="absolute right-7 top-22 h-12 w-12 rounded-[1rem] bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-8 pb-20 pt-10">
          <div className="flex flex-col gap-4 rounded-[2rem]  bg-white p-4  md:flex-row md:items-center md:justify-between">
            <BlogSearchBar initialQuery={q} />

            <div className="text-sm text-neutral-500">
              {totalPosts > 0 ? (
                <span>
                  Showing {startItem} to {endItem} of {totalPosts} articles
                </span>
              ) : (
                <span>No posts found.</span>
              )}
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-neutral-300 bg-neutral-50 p-14 text-center text-sm text-neutral-500">
              No posts found.
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex flex-col bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="relative h-52 overflow-hidden bg-neutral-100">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-neutral-100 to-neutral-200 text-neutral-400">
                          <span className="text-sm">No image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="text-base md:text-xl font-medium text-neutral-900 leading-[1.4] flex-1">
                        {post.title}
                      </h2>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div className="inline-flex items-center border border-black/20 text-neutral-900 px-4 py-2 rounded-full text-[13px] font-medium hover:bg-neutral-900 hover:text-white transition-all duration-200">
                          Learn More
                        </div>

                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span className="text-[13px]">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={
                        currentPage > 1 ? hrefForPage(currentPage - 1) : "#"
                      }
                      aria-disabled={currentPage === 1}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                        currentPage === 1
                          ? "pointer-events-none border-neutral-200 bg-neutral-50 text-neutral-300"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(0, 5)
                      .map((page) => (
                        <Link
                          key={page}
                          href={hrefForPage(page)}
                          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition ${
                            page === currentPage
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          {page}
                        </Link>
                      ))}

                    {totalPages > 5 ? (
                      <span className="px-2 text-sm text-neutral-400">…</span>
                    ) : null}

                    {totalPages > 5 ? (
                      <Link
                        href={hrefForPage(totalPages)}
                        className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                      >
                        {totalPages}
                      </Link>
                    ) : null}

                    <Link
                      href={
                        currentPage < totalPages
                          ? hrefForPage(currentPage + 1)
                          : "#"
                      }
                      aria-disabled={currentPage === totalPages}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                        currentPage === totalPages
                          ? "pointer-events-none border-neutral-200 bg-neutral-50 text-neutral-300"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <p className="text-sm text-neutral-500">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
