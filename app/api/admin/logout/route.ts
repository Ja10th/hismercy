// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  const cookieName = "hm_admin_session";

  const token = request.cookies.get(cookieName)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  const response = NextResponse.redirect(
    new URL("/login", request.url),
    303,
  );

  response.cookies.set({
    name: cookieName,
    value: "",
    path: "/",
    expires: new Date(0),
  });

  return response;
}