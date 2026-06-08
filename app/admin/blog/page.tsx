import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import AdminBlogToasts from "./AdminBlogToasts";
import BlogAdminTable from "./BlogAdminTable";

type BlogPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

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
  const posts = allPosts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const publishedPosts = allPosts.filter((post) => post.status === "published").length;
  const draftPosts = allPosts.filter((post) => post.status === "draft").length;
  const archivedPosts = allPosts.filter((post) => post.status === "archived").length;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 pt-8 pb-4 sm:px-6 lg:px-2">
      <AdminBlogToasts />
      <div className="mx-auto max-w-[1600px]">
        <BlogAdminTable
          posts={posts}
          q={q}
          status={status}
          currentPage={currentPage}
          pageCount={pageCount}
          totalPosts={totalPosts}
          publishedPosts={publishedPosts}
          draftPosts={draftPosts}
          archivedPosts={archivedPosts}
        />
      </div>
    </div>
  );
}