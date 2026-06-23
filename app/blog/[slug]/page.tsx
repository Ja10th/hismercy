import { prisma } from "@/lib/prisma";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";
import { CalendarDays, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const now = new Date();

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      OR: [
        { status: "published" },
        {
          status: "scheduled",
          scheduledAt: { lte: now },
        },
      ],
    },
  });

  if (!post) notFound();

  await prisma.blogPost.update({
    where: { id: post.id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  const publishedDate = post.publishedAt || post.createdAt;

  return (
    <>
      <Navbar />
      <main>
        <section className="py-24 md:py-32 bg-white">
          <div className="mx-auto max-w-[960px] px-8">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:opacity-75"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>

            <h1 className="max-w-4xl font-semibold leading-snug text-3xl sm:text-5xl lg:text-5xl">
              {post.title}
            </h1>

            {post.coverImage ? (
              <div className="mt-10 overflow-hidden rounded-[20px] bg-white">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-[420px] w-full object-cover"
                />
              </div>
            ) : null}

            <article className="prose prose-neutral mt-2 max-w-none rounded-[20px] px-2 pt-3 pb-8 text-gray-600">
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="[&_h1]:text-4xl [&_h1]:tracking-[-0.04em] [&_h1]:text-gray-600 [&_h2]:text-3xl [&_h2]:tracking-[-0.04em] [&_h2]:text-gray-600 [&_h3]:text-2xl [&_h3]:tracking-[-0.03em] [&_h3]:text-gray-600 [&_p]:my-5 [&_p]:text-[16px] md:[&_p]:text-base lg:[&_p]:text-[20px] [&_img]:my-8 [&_img]:w-full [&_img]:rounded-[20px] [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-5 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-gray-600 [&_a]:underline"
              />
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
