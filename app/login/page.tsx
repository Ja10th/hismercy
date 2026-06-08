import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import {
  createAdminSession,
  getCurrentAdminSession,
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

  const user = await verifyAdminCredentials(email, password);

  if (!user) {
    redirect(`/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  await createAdminSession(user.id);

  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentAdminSession();
  if (session) redirect("/admin");

  const error = searchParams?.error === "1";
  const nextPath =
    typeof searchParams?.next === "string" ? searchParams.next : "/admin";

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-[#171717] px-4 py-10">
        <div className="w-full max-w-md rounded-4xl border border-neutral-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <LockKeyhole className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 text-center text-[16px] leading-6 text-neutral-500">
            Enter your admin credentials to continue.
          </p>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Invalid email or password.
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

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
