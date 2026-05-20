import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { ArrowLeft } from "lucide-react";
import BlogStudioEditor from "../BlogEditor";
import { publishBlogPost, saveBlogPost } from "../actions";

export default async function NewBlogPostPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string; published?: string }>;
}) {
  await requireAdmin();
  const params = searchParams ? await searchParams : {};

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-4 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-8xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>

            <h1 className="mt-4 text-[32px] font-semibold tracking-tight text-neutral-950">
              Add post
            </h1>

            {params.created || params.published ? (
              <p className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {params.published ? "Post published successfully." : "Draft saved successfully."}
              </p>
            ) : null}
          </div>
        </div>

        <form action={saveBlogPost}>
          <BlogStudioEditor
            mode="create"
            publishAction={publishBlogPost}
          />
        </form>
      </div>
    </div>
  );
}