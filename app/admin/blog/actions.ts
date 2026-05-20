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

async function upsertBlogPost(
  formData: FormData,
  forcedStatus?: "published",
) {
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

  await prisma.blogPost.delete({
    where: { id },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog?deleted=1");
}