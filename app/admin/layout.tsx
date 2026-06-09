import { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import AdminSidebar from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { Monitor } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-neutral-900">
      <div className="flex min-h-screen">
        <div className="flex min-h-screen w-full items-center justify-center px-6 lg:hidden">
          <div className="max-w-sm rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
              <Monitor className="h-7 w-7 text-neutral-700" />
            </div>

            <h1 className="text-2xl font-semibold text-neutral-900">
              Desktop only
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              The admin dashboard is not available on mobile devices. Please
              open it on a laptop or desktop screen.
            </p>
          </div>
        </div>

        <div className="hidden w-full lg:flex">
          <AdminSidebar />

          <main className="flex-1 lg:ml-[280px]">
            <AdminTopBar />
            <div className="px-4 pb-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}