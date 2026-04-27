"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "grid",
    accent: "text-sky-400",
    accentBg: "bg-sky-500/10",
  },
  {
    href: "/admin/brands",
    label: "Brands",
    icon: "tag",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: "box",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
  },
  {
    href: "/admin/home",
    label: "Home Products",
    icon: "star",
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
  },
] as const;

function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none">
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
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none">
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
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none">
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
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none">
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
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[280px] lg:flex-col border-r border-white/10 bg-[#171717] text-white">
          <div className="px-7 pt-7 pb-6 border-b border-white/10">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45 text-left">
              Admin Dashboard
            </p>
           
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200",
                    active
                      ? "bg-white/10 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                      : "text-white/75 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200",
                      active
                        ? `${item.accentBg} border-white/10`
                        : "border-white/10 bg-white/5 group-hover:bg-white/10",
                    ].join(" ")}
                  >
                    <Icon
                      name={item.icon}
                      className={[
                        active ? item.accent : "text-white/70 group-hover:text-white",
                      ].join(" ")}
                    />
                  </span>

                  <span className="flex-1">
                    <span className="block text-[13px] font-medium leading-tight">
                      {item.label}
                    </span>
                  </span>

                  {active ? (
                    <span className={`h-2 w-2 rounded-full ${item.accentBg.replace("/10", "")} bg-current`} />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-5">
            <Link
              href="/"
              className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Back Home
            </Link>
          </div>
        </aside>

        <main className="flex-1 lg:ml-[280px]">
          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}