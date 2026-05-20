import "server-only";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const ADMIN_COOKIE_NAME = "hm_admin_session";
const SESSION_DAYS = 7;

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function verifyAdminCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user || user.role !== "admin") return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return user;
}

export async function createAdminSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return null;

  const tokenHash = sha256(token);

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });

  if (!session) {
    cookieStore.delete(ADMIN_COOKIE_NAME);
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash },
    });
    cookieStore.delete(ADMIN_COOKIE_NAME);
    return null;
  }

  await prisma.adminSession.update({
    where: { tokenHash },
    data: { lastSeenAt: new Date() },
  });

  return session;
}

export async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return session;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = sha256(token);
    await prisma.adminSession.deleteMany({
      where: { tokenHash },
    });
  }

  cookieStore.delete(ADMIN_COOKIE_NAME);
}