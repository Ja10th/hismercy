import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

// This middleware is a fast, edge-compatible safety net.
// It checks the session cookie exists and maps to a non-expired DB row
// BEFORE any admin page or API route renders. This means even if a developer
// forgets to call requireAdmin() inside a new admin page, the route is still
// protected.
//
// Full session validation (bcrypt, role check) still happens inside
// requireAdmin() — this layer just blocks obviously unauthenticated requests
// at the edge before any server component work runs.

const ADMIN_COOKIE_NAME = "hm_admin_session";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes and /api/admin routes
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Allow the login page through (it's at /login, not /admin, so this
  // branch is only hit for actual /admin/* paths)
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    // No cookie at all — redirect to login
    if (isAdminApi) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check the session exists and hasn't expired in the DB.
  // We do a raw DB query here because the Prisma client with all its
  // imports is too heavy for the Edge runtime. We use fetch against
  // Postgres via the internal API instead — but since we're on Node.js
  // runtime (not Edge), we CAN import Prisma directly.
  try {
    const { prisma } = await import("@/lib/prisma");

    const tokenHash = sha256(token);
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash },
      select: { expiresAt: true, user: { select: { role: true } } },
    });

    if (!session || session.expiresAt <= new Date() || !["admin", "developer"].includes(session.user.role)) {
      // Invalid / expired session
      if (isAdminApi) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear the stale cookie
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: "",
        path: "/",
        expires: new Date(0),
      });
      return response;
    }
  } catch (error) {
    // If the DB check fails for any reason, fail open to the page-level
    // requireAdmin() guard rather than hard-blocking the app. Log it so
    // it's visible in production logs.
    console.error("[middleware] session check failed — falling through to page guard:", error);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all /admin/* pages and /api/admin/* routes.
  // Excludes static files and Next.js internals automatically.
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
