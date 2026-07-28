import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import {
  checkLoginRateLimit,
  createAdminSession,
  getCurrentAdminSession,
  resetLoginRateLimit,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { LoginButton } from "../components/LoginButton";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    next?: string;
  };
};

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const nextPath = String(formData.get("next") || "/admin");

  // Derive client IP from the request headers available inside Server Actions
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : (headersList.get("x-real-ip") ?? "unknown");

  // Rate-limit before touching the DB — stops brute-force and credential stuffing
  if (checkLoginRateLimit(email, ip)) {
    redirect(`/login?error=rate&next=${encodeURIComponent(nextPath)}`);
  }

  const user = await verifyAdminCredentials(email, password);

  if (!user) {
    redirect(`/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  // Clear rate-limit bucket for this email on successful login
  resetLoginRateLimit(email);

  await createAdminSession(user.id);

  // Log the login event — fire-and-forget, don't block redirect
  import("@/lib/audit").then(({ logAudit }) =>
    logAudit({
      category: "auth",
      action: "Admin login",
      target: user.email,
      actor: user.name || user.email,
      meta: { ip },
    }),
  );

  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentAdminSession();
  if (session) redirect("/admin");

  const errorParam = searchParams?.error;
  const nextPath =
    typeof searchParams?.next === "string" ? searchParams.next : "/admin";

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden bg-emerald-950 pb-14 md:pb-28 pt-28 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
          aria-hidden
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-emerald-400" />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span className="select-none text-[24vw] md:text-[22vw] font-black uppercase leading-none tracking-tighter text-emerald-900/20">
            ADMIN
          </span>
        </div>
        <div className="relative z-10 px-4 sm:px-0">
          <div className="w-full max-w-md mx-auto rounded-4xl border border-neutral-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-center text-[16px] leading-6 text-neutral-500">
              Enter your admin credentials to continue.
            </p>

            {errorParam === "1" ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                Invalid email or password.
              </div>
            ) : errorParam === "rate" ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Too many login attempts. Please wait 15 minutes and try again.
              </div>
            ) : null}

            <form action={loginAction} className="mt-6 space-y-4">
              <input type="hidden" name="next" value={nextPath} />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="username"
                    placeholder="admin@example.com"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Password
                </span>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter password"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white"
                  />
                </div>
              </label>

              <LoginButton />
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
