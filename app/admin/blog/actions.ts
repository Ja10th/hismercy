"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const blogSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(180),
  slug: z.string().trim().max(180).optional().or(z.literal("")),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  content: z.string().min(20, "Content is too short").max(50000),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduledAt: z.string().optional().or(z.literal("")),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });
}

function parseDateTime(value: string | null | undefined) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function saveCoverImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Cover image must be an image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Cover image must be 5MB or less.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "blog");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  return `/uploads/blog/${filename}`;
}

async function getUniqueSlug(baseSlug: string, excludeId?: string) {
  const existing = await prisma.blogPost.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { slug: true },
  });

  if (existing.length === 0) return baseSlug;

  const taken = new Set(existing.map((item) => item.slug));
  let suffix = 2;

  while (taken.has(`${baseSlug}-${suffix}`)) suffix += 1;

  return `${baseSlug}-${suffix}`;
}

async function createAdminNotification(input: {
  title: string;
  description: string;
  href?: string;
  type?: "order" | "blog" | "product" | "customer" | "brand" | "system";
}) {
  await prisma.adminNotification.create({
    data: {
      title: input.title,
      description: input.description,
      href: input.href,
      type: input.type || "system",
    },
  });
}

import { logAudit } from "@/lib/audit";

async function upsertBlogPost(formData: FormData, forcedStatus?: "published") {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const parsed = blogSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    content: formData.get("content"),
    status: forcedStatus || String(formData.get("status") || "draft"),
    scheduledAt: String(formData.get("scheduledAt") || ""),
  });

  if (!parsed.success) {
    throw new Error("Invalid blog data.");
  }

  const data = parsed.data;
  const existing = id
    ? await prisma.blogPost.findUnique({ where: { id } })
    : null;

  const coverFile = formData.get("coverImage");
  const coverImage =
    coverFile instanceof File && coverFile.size > 0
      ? await saveCoverImage(coverFile)
      : existing?.coverImage || null;

  const slugBase = slugify(data.slug || data.title);
  const slug = await getUniqueSlug(slugBase, id || undefined);
  const content = cleanContent(data.content);
  const scheduledAt = parseDateTime(data.scheduledAt);
  const nextStatus = forcedStatus || data.status;

  if (id) {
    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        category: data.category || null,
        content,
        coverImage,
        status: nextStatus,
        scheduledAt: nextStatus === "scheduled" ? scheduledAt : null,
        publishedAt:
          nextStatus === "published"
            ? existing?.publishedAt || new Date()
            : existing?.publishedAt || null,
      },
    });

    await createAdminNotification({
      type: "blog",
      title:
        nextStatus === "published"
          ? "Blog post published"
          : existing?.status === "draft"
            ? "Blog draft updated"
            : "Blog post updated",
      description: updated.title,
      href: `/admin/blog/${updated.id}/edit`,
    });

    await logAudit({
      category: "blog",
      action: nextStatus === "published" ? "Published blog post" : "Updated blog post",
      target: updated.title,
      href: `/admin/blog/${updated.id}/edit`,
      meta: { status: nextStatus, from: existing?.status },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/admin/blog/${updated.id}/edit`);
    redirect(
      `/admin/blog/${updated.id}/edit?${nextStatus === "published" ? "published=1" : "updated=1"}`,
    );
  }

  const created = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      category: data.category || null,
      content,
      coverImage,
      status: nextStatus,
      scheduledAt: nextStatus === "scheduled" ? scheduledAt : null,
      publishedAt: nextStatus === "published" ? new Date() : null,
    },
  });

  await createAdminNotification({
    type: "blog",
    title:
      nextStatus === "published"
        ? "Blog post published"
        : "Blog draft created",
    description: created.title,
    href: `/admin/blog/${created.id}/edit`,
  });

  await logAudit({
    category: "blog",
    action: nextStatus === "published" ? "Published blog post" : "Created blog draft",
    target: created.title,
    href: `/admin/blog/${created.id}/edit`,
    meta: { status: nextStatus },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect(
    `/admin/blog/${created.id}/edit?${nextStatus === "published" ? "published=1" : "created=1"}`,
  );
}

export async function saveBlogPost(formData: FormData) {
  return upsertBlogPost(formData);
}

export async function publishBlogPost(formData: FormData) {
  formData.set("status", "published");
  return upsertBlogPost(formData, "published");
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { title: true },
  });

  await prisma.blogPost.delete({
    where: { id },
  });

  await createAdminNotification({
    type: "blog",
    title: "Blog post deleted",
    description: post?.title || "A blog post was deleted",
    href: "/admin/blog",
  });

  await logAudit({
    category: "blog",
    action: "Deleted blog post",
    target: post?.title,
    href: "/admin/blog",
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog?deleted=1");
}

export async function setBlogPostStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !["draft", "published", "archived"].includes(status)) return;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "published" ? new Date() : null,
    },
  });

  await createAdminNotification({
    type: "blog",
    title:
      status === "published"
        ? "Blog post published"
        : status === "draft"
          ? "Blog post unpublished"
          : "Blog post archived",
    description: post.title,
    href: `/admin/blog/${post.id}/edit`,
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function bulkBlogAction(formData: FormData) {
  await requireAdmin();

  const idsRaw = String(formData.get("ids") || "[]");
  const action = String(formData.get("action") || "");

  let ids: string[] = [];
  try {
    ids = JSON.parse(idsRaw);
  } catch {
    ids = [];
  }

  if (!Array.isArray(ids) || ids.length === 0) return;

  if (action === "delete") {
    await prisma.blogPost.deleteMany({
      where: { id: { in: ids } },
    });

    await createAdminNotification({
      type: "blog",
      title: "Bulk blog delete",
      description: `${ids.length} blog post(s) were deleted`,
      href: "/admin/blog",
    });
  }

  if (action === "unpublish") {
    await prisma.blogPost.updateMany({
      where: { id: { in: ids } },
      data: { status: "draft", publishedAt: null },
    });

    await createAdminNotification({
      type: "blog",
      title: "Bulk unpublish",
      description: `${ids.length} blog post(s) were moved back to draft`,
      href: "/admin/blog",
    });
  }

  if (action === "publish") {
    await prisma.blogPost.updateMany({
      where: { id: { in: ids } },
      data: { status: "published", publishedAt: new Date() },
    });

    await createAdminNotification({
      type: "blog",
      title: "Bulk publish",
      description: `${ids.length} blog post(s) were published`,
      href: "/admin/blog",
    });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}