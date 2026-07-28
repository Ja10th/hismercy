import "server-only";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const ADMIN_COOKIE_NAME = "hm_admin_session";
const SESSION_DAYS = 7;

// ─── Login rate limiting ──────────────────────────────────────────────────────
// Keyed by email (lowercased) so credential-stuffing against one account is
// blocked regardless of which IP it comes from. Also keyed by IP so a single
// IP can't spray across many accounts.
// In-memory is fine for a single-instance server; for multi-instance swap the
// Map for Upstash Redis + @upstash/ratelimit.

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 10; // per key per window

type RateLimitEntry = { count: number; resetAt: number };
const loginRateStore = new Map<string, RateLimitEntry>();

function pruneLoginStore() {
  const now = Date.now();
  for (const [key, entry] of loginRateStore) {
    if (now > entry.resetAt) loginRateStore.delete(key);
  }
}

export function checkLoginRateLimit(email: string, ip: string): boolean {
  pruneLoginStore();
  const now = Date.now();

  for (const key of [`email:${email}`, `ip:${ip}`]) {
    const entry = loginRateStore.get(key);

    if (!entry || now > entry.resetAt) {
      loginRateStore.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
      continue;
    }

    if (entry.count >= LOGIN_MAX_ATTEMPTS) return true; // rate-limited

    entry.count += 1;
  }

  return false;
}

export function resetLoginRateLimit(email: string) {
  // Clear the email bucket on successful login so a legitimate user
  // who fat-fingered their password isn't locked out.
  loginRateStore.delete(`email:${email}`);
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function verifyAdminCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  // Accept both "admin" and "developer" roles
  if (!user || !["admin", "developer"].includes(user.role)) return null;

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
    sameSite: "strict",
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

  // Both "admin" and "developer" roles can access the admin panel.
  // "developer" has full access including the audit log.
  // "admin" has full access except the audit log.
  if (!session || !["admin", "developer"].includes(session.user.role)) {
    redirect("/login");
  }

  return session;
}

// Stricter guard — only "developer" role can access the audit log.
export async function requireDeveloper() {
  const session = await getCurrentAdminSession();

  if (!session || session.user.role !== "developer") {
    redirect("/admin");
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