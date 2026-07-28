"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Tag,
  Box,
  Star,
  ShoppingCart,
  Users,
  FileText,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import LogoutButton from "../components/LogoutButton";

const ALL_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin",       label: "Dashboard",     icon: LayoutDashboard, accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/brands",   label: "Brands",        icon: Tag,          accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
      { href: "/admin/products", label: "Products",      icon: Box,          accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
      { href: "/admin/home",     label: "Home Products", icon: Star,         accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders",   label: "Orders",        icon: ShoppingCart, accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers",   icon: Users,        accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog",     label: "Blog",          icon: FileText,     accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
    ],
  },
  {
    // Only shown to developers — filtered out for "admin" role
    label: "Logs",
    developerOnly: true,
    items: [
      { href: "/admin/audit-log", label: "Audit Log",   icon: ShieldCheck,  accent: "text-emerald-400", accentBg: "bg-emerald-500/10" },
    ],
  },
] as const;

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
};

function NavIcon({ icon: Icon, className = "" }: { icon: React.ElementType; className?: string }) {
  return <Icon className={`h-4.5 w-4.5 ${className}`} />;
}

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const isDeveloper = role === "developer";

  // Resolve pending: if navigation completed (pathname matches), clear it
  const resolvedPending =
    pendingHref &&
    (pendingHref === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(pendingHref))
      ? null
      : pendingHref;

  // Filter groups based on role
  const groups = ALL_GROUPS.filter(
    (g) => !("developerOnly" in g && g.developerOnly && !isDeveloper),
  );

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-66 lg:flex-col border-r border-white/10 bg-[#000000] text-white">
      <div className="flex justify-left px-4 items-center border-b border-white/10 pt-2 pb-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          <img src="/logoo.jpeg" alt="" className="h-12 w-auto" />
        </p>
        <p className="text-base text-white font-semibold tracking-widest">Mercy</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.2em] text-white/35">
                {group.label}
              </p>

              <nav className="space-y-1">
                {(group.items as readonly NavItem[]).map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  const isPending = resolvedPending === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { if (!active) setPendingHref(item.href); }}
                      className={[
                        "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200",
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/72 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200",
                          active
                            ? `${item.accentBg} border-white/10`
                            : "border-white/10 bg-white/5 group-hover:bg-white/10",
                        ].join(" ")}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        ) : (
                          <NavIcon
                            icon={item.icon}
                            className={active ? item.accent : "text-white/65 group-hover:text-white"}
                          />
                        )}
                      </span>

                      <span className="flex-1">
                        <span className="block text-[13px] font-medium leading-tight">
                          {item.label}
                        </span>
                      </span>

                      {isPending ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        {isDeveloper ? (
          <div className="mb-2 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-400/70">
            Developer access
          </div>
        ) : null}
        <form action="/api/admin/logout" method="post">
          <LogoutButton />
        </form>
      </div>
    </aside>
  );
}
