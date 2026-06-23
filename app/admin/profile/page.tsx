import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { updateAdminPassword, updateAdminProfile } from "./actions";
import {
  KeyRound,
  Mail,
  ShieldCheck,
  Clock3,
  Activity,
  UserRound,
} from "lucide-react";

function getInitials(name: string | null | undefined) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(date: Date | null | undefined, withTime = false) {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; "password-updated"?: string }>;
}) {
  const session = await requireAdmin();
  const admin = session.user;
  const params = searchParams ? await searchParams : {};

  const account = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { sessions: true } },
    },
  });

  const initials = getInitials(account?.name);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              Profile
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Manage your admin account details and password.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {params.updated ? (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                Profile updated successfully.
              </span>
            ) : null}

            {params["password-updated"] ? (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                Password changed. Please log in again.
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="h-28 bg-gradient-to-br from-emerald-700 to-emerald-900" />
              <div className="-mt-10 px-6 pb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-emerald-700 shadow-sm">
                  <span className="text-xl font-semibold tracking-wide text-white">
                    {initials}
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-neutral-950">
                    {account?.name || "Admin"}
                  </h2>
                  <p className="mt-1 break-words text-sm text-neutral-500">
                    {account?.email}
                  </p>
                </div>

                <div className="mt-4 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-neutral-600">
                  {account?.role ?? "admin"}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400">
                Account info
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="text-xs text-neutral-500">
                    Active sessions
                  </span>
                  <span className="text-sm font-semibold text-neutral-950">
                    {account?._count.sessions ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="text-xs text-neutral-500">Member since</span>
                  <span className="text-sm font-semibold text-neutral-950">
                    {formatDate(account?.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="text-xs text-neutral-500">Last updated</span>
                  <span className="text-sm font-semibold text-neutral-950">
                    {formatDate(account?.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">
                  Security note
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-amber-700">
                Changing your password signs you out of all active sessions
                immediately.
              </p>
            </div>
          </aside>

          <div className="grid gap-6">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                  <Mail className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-950">
                    Account details
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Update your display name and login email.
                  </p>
                </div>
              </div>

              <form
                action={updateAdminProfile}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="space-y-2 md:col-span-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                    <UserRound className="h-3.5 w-3.5" />
                    Full name
                  </span>
                  <input
                    name="name"
                    defaultValue={account?.name ?? ""}
                    placeholder="Your name"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                    <Mail className="h-3.5 w-3.5" />
                    Email address
                  </span>
                  <input
                    name="email"
                    type="email"
                    defaultValue={account?.email ?? ""}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
                  />
                </label>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center rounded-2xl bg-emerald-700 px-6 text-sm font-medium text-white transition hover:bg-emerald-800"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                  <KeyRound className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-950">
                    Change password
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Must be at least 8 characters. Signs you out everywhere.
                  </p>
                </div>
              </div>

              <form
                action={updateAdminPassword}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Current password
                  </span>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-neutral-700">
                    New password
                  </span>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New password"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
                  />
                </label>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center rounded-2xl bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Update password
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
