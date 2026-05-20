"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateHomepage() {
  revalidatePath("/admin/home");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function updateHomepageProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  const featured = formData.get("featured") === "on";
  const featuredOrder = Number(formData.get("featuredOrder") || 999);

  if (!id) return;

  await prisma.product.update({
    where: { id },
    data: { featured, featuredOrder },
  });

  revalidateHomepage();
}

export async function removeHomepageProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.product.update({
    where: { id },
    data: {
      featured: false,
      featuredOrder: 999,
    },
  });

  revalidateHomepage();
}