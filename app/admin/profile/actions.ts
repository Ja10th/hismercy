"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logoutAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function updateAdminProfile(formData: FormData) {
  const session = await requireAdmin();
  const admin = session.user;

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid profile data");
  }

  const data = parsed.data;
  const nextEmail = data.email.toLowerCase();

  const emailExists = await prisma.adminUser.findFirst({
    where: {
      email: nextEmail,
      NOT: { id: admin.id },
    },
    select: { id: true },
  });

  if (emailExists) {
    throw new Error("That email is already in use");
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      name: data.name,
      email: nextEmail,
    },
  });

  revalidatePath("/admin/profile");
  redirect("/admin/profile?updated=1");
}

export async function updateAdminPassword(formData: FormData) {
  const session = await requireAdmin();
  const admin = session.user;

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid password data");
  }

  const data = parsed.data;

  const user = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new Error("Admin account not found");
  }

  const ok = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!ok) {
    throw new Error("Current password is incorrect");
  }

  const nextHash = await bcrypt.hash(data.newPassword, 12);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: nextHash },
  });

  await prisma.adminSession.deleteMany({
    where: { userId: admin.id },
  });

  await logoutAdmin();

  redirect("/login?password-updated=1");
}