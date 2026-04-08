import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Overview and quick actions",
    icon: "grid",
  },
  {
    href: "/admin/brands",
    label: "Brands",
    description: "Manage brand collection",
    icon: "tag",
  },
  {
    href: "/admin/products",
    label: "Products",
    description: "Add products and images",
    icon: "box",
  },
  {
    href: "/admin/home",
    label: "Home Products",
    description: "Control homepage featured items",
    icon: "star",
  },
];

function Icon({ name }: { name: string }) {
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "tag") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M20 13.5 13.5 20a2 2 0 0 1-2.83 0L4 13.33V4h9.33L20 10.67a2 2 0 0 1 0 2.83Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 8.5h.01"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M21 8.5 12 4 3 8.5 12 13l9-4.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M3 8.5V17l9 4.5 9-4.5v-8.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="m12 3 2.78 5.64 6.22.9-4.5 4.38 1.06 6.2L12 17.9 6.44 20.12 7.5 13.92 3 9.54l6.22-.9L12 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return null;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6FB] text-neutral-900">
      <div className="flex">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[300px] lg:flex-col border-r border-white/10 bg-[#171717] text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="px-7 pt-7 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Admin Panel
                </p>
              </div>
            </div>
            </div>

          <nav className="flex-1 px-4 py-5 space-y-2">
            {navItems.map((item) => {
              const active =
                item.href === "/admin" ? item.href === "/admin" : false;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-2xl px-4 py-3 transition-all duration-200 text-white/75 hover:bg-white/8 hover:text-white"
                >
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 group-hover:bg-white/10">
                    <Icon name={item.icon} />
                  </span>

                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold leading-tight">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-white/45">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium">Management</p>
              <p className="mt-1 text-sm text-white/50">
                Brands, products, images, and homepage content all live here.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:ml-[300px]">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
