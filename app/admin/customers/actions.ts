"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

export async function deleteCustomer(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.customer.delete({
    where: { id },
  });

  revalidatePath("/admin/customers");
}

export async function bulkDeleteCustomers(formData: FormData) {
  await requireAdmin();

  const idsRaw = String(formData.get("ids") || "[]");
  let ids: string[] = [];

  try {
    ids = JSON.parse(idsRaw);
  } catch {
    ids = [];
  }

  if (!Array.isArray(ids) || ids.length === 0) return;

  await prisma.customer.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/admin/customers");
}