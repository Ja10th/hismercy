import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import BlogEditor from "../../BlogEditor";
import { deleteBlogPost, publishBlogPost, saveBlogPost } from "../../actions";
import AdminBlogToasts from "../../AdminBlogToasts";

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    updated?: string;
    created?: string;
    published?: string;
    deleted?: string;
  }>;
};

export default async function EditBlogPostPage({
  params,
  searchParams,
}: EditBlogPostPageProps) {
  await requireAdmin();

  const { id } = await params;
  const qs = searchParams ? await searchParams : {};

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) notFound();

  const statusLabel =
    post.status === "published"
      ? "Published"
      : post.status === "scheduled"
        ? "Scheduled"
        : "Draft";

  const successLabel =
    qs.published === "1"
      ? "Post published successfully."
      : qs.updated === "1"
        ? "Post updated successfully."
        : qs.created === "1"
          ? "Draft created successfully."
          : null;

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-neutral-50">
      <AdminBlogToasts />

      <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-2">
        <div className="mx-auto flex h-full max-w-8xl min-h-0 flex-col">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Link
                href="/admin/blog"
                className="inline-flex items-center gap-2 text-xs font-medium text-neutral-900 hover:opacity-80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to blog
              </Link>

              <h1 className="mt-4 ml-2 text-[24px] font-semibold tracking-tight text-neutral-950">
                Edit post
              </h1>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className=" px-3 py-1 text-xs font-medium text-emerald-700">
                {statusLabel}
              </span>
              {successLabel ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  {successLabel}
                </span>
              ) : null}
            </div>

            <form action={deleteBlogPost}>
              <input type="hidden" name="id" value={post.id} />
              <button
                type="submit"
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-xs font-medium text-red-600 transition hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </form>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-[28px]">
            <form action={saveBlogPost} className="h-full min-h-0">
              <input type="hidden" name="id" value={post.id} />
              <BlogEditor
                mode="edit"
                initial={{
                  id: post.id,
                  title: post.title,
                  slug: post.slug,
                  excerpt: post.excerpt || "",
                  category: post.category || "",
                  content: post.content,
                  status: post.status,
                  scheduledAt: post.scheduledAt
                    ? new Date(post.scheduledAt).toISOString().slice(0, 16)
                    : "",
                  coverImage: post.coverImage || null,
                }}
                publishAction={publishBlogPost}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
