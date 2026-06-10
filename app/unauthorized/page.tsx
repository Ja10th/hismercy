import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LockKeyhole, ArrowRight } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-20">
        <div className="mx-auto w-full max-w-md text-center">

          {/* Icon */}
          <div className="relative inline-flex">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
              <LockKeyhole className="h-9 w-9 text-neutral-400" strokeWidth={1.5} />
            </div>
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-xs font-bold text-white">
              401
            </span>
          </div>

          <h1 className="mt-7 text-2xl font-semibold tracking-tight text-neutral-950">
            You do not have access to this page.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            This area is restricted. If you think this is a mistake, make sure you are signed in with the correct account.
          </p>

          {/* Actions */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Link
              href="/admin/login"
              className="flex items-center justify-between px-6 py-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Sign in to your account
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </Link>
            <div className="border-t border-neutral-100" />
            <Link
              href="/"
              className="flex items-center justify-between px-6 py-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Go back to homepage
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </Link>
            <div className="border-t border-neutral-100" />
            <Link
              href="/contact-us"
              className="flex items-center justify-between px-6 py-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Contact support
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}