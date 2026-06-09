"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { HiMiniBell } from "react-icons/hi2";
import { FaUserLarge } from "react-icons/fa6";

type SearchItem = {
  id: string;
  label: string;
  href: string;
  type: "product" | "customer" | "brand";
  meta?: string;
};

type SearchResponse = {
  products: Array<{ id: string; name: string; slug: string }>;
  customers: Array<{ id: string; fullName: string; email: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  type: "order" | "blog" | "product" | "customer" | "brand" | "system";
  createdAt: string;
  read: boolean;
};

function getNotificationIcon(type: NotificationItem["type"]) {
  switch (type) {
    case "order":
      return ShoppingCart;
    case "blog":
      return FileText;
    case "product":
      return Box;
    case "customer":
      return Users;
    case "brand":
      return Tag;
    default:
      return Sparkles;
  }
}

function getNotificationChipClass(type: NotificationItem["type"]) {
  switch (type) {
    case "order":
      return "bg-blue-50 text-blue-700";
    case "blog":
      return "bg-violet-50 text-violet-700";
    case "product":
      return "bg-amber-50 text-amber-700";
    case "customer":
      return "bg-emerald-50 text-emerald-700";
    case "brand":
      return "bg-cyan-50 text-cyan-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

export function AdminTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [userOpen, setUserOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchModalRef = useRef<HTMLDivElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  const topPath = useMemo(() => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/products")) return "Products";
    if (pathname.startsWith("/admin/brands")) return "Brands";
    if (pathname.startsWith("/admin/orders")) return "Orders";
    if (pathname.startsWith("/admin/customers")) return "Customers";
    if (pathname.startsWith("/admin/blog")) return "Blog";
    if (pathname.startsWith("/admin/search")) return "Search";
    return "Admin";
  }, [pathname]);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const shortcutLabel = useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl K";
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    return isMac ? "⌘ K" : "Ctrl K";
  }, []);

  const openSearchModal = () => {
    setSearchModalOpen(true);
    setNotifOpen(false);
    setUserOpen(false);
  };

  const loadNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);

      const res = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load notifications");

      const data = (await res.json()) as {
        notifications: NotificationItem[];
      };

      setNotifications(data.notifications ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";
      const isShortcut = (event.metaKey || event.ctrlKey) && isK;

      if (isShortcut) {
        event.preventDefault();
        openSearchModal();
      }

      if (event.key === "Escape") {
        setSearchModalOpen(false);
        setNotifOpen(false);
        setUserOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        searchModalOpen &&
        searchModalRef.current &&
        !searchModalRef.current.contains(target)
      ) {
        setSearchModalOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }

      if (userRef.current && !userRef.current.contains(target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [searchModalOpen]);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2 || !searchModalOpen) {
      setResults([]);
      setLoading(false);
      return;
    }

    const t = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error("Search failed");

        const data = (await res.json()) as SearchResponse;

        const mapped: SearchItem[] = [
          ...data.products.map((item) => ({
            id: item.id,
            label: item.name,
            href: `/admin/products/${item.id}`,
            type: "product" as const,
            meta: item.slug,
          })),
          ...data.customers.map((item) => ({
            id: item.id,
            label: item.fullName,
            href: `/admin/customers/${item.id}`,
            type: "customer" as const,
            meta: item.email,
          })),
          ...data.brands.map((item) => ({
            id: item.id,
            label: item.name,
            href: `/admin/brands/${item.id}`,
            type: "brand" as const,
            meta: item.slug,
          })),
        ];

        setResults(mapped.slice(0, 10));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [query, searchModalOpen]);

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 15000);

    const onFocus = () => {
      void loadNotifications();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (notifOpen) {
      void loadNotifications();
    }
  }, [notifOpen, loadNotifications]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const q = query.trim();
    if (!q) return;

    router.push(`/admin/search?q=${encodeURIComponent(q)}`);
    setSearchModalOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications/mark-all-read", {
        method: "POST",
      });
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      // ignore
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch("/api/admin/notifications/clear", {
        method: "POST",
      });
      setNotifications([]);
    } catch {
      // ignore
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-[#f6f7fb]/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">
              {topPath}
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center px-3">
            <div ref={searchWrapRef} className="relative w-full max-w-[640px]">
              <button
                type="button"
                onClick={openSearchModal}
                className="flex h-11 w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 text-left text-sm text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <Search className="h-4 w-4 text-neutral-400" />
                <span className="truncate">
                  Search product, customer, brand
                </span>
                <kbd className="ml-auto rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-500">
                  {shortcutLabel}
                </kbd>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUserOpen(false);
                  setSearchModalOpen(false);
                }}
                className="relative inline-flex h-11 items-center justify-center rounded-2xl text-neutral-800 transition hover:bg-neutral-50"
                aria-label="Notifications"
              >
                <HiMiniBell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute right-0 top-2 h-2 w-2 rounded-full bg-rose-500" />
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 top-full mt-2 w-96 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                  <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">
                        Notifications
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {notificationsLoading ? (
                      <div className="px-3 py-8 text-sm text-neutral-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 py-8 text-sm text-neutral-500">
                        No notifications.
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const Icon = getNotificationIcon(item.type);

                        const content = (
                          <div
                            className={`rounded-2xl border px-4 py-4 transition ${
                              item.read
                                ? "border-neutral-200 bg-white hover:bg-neutral-50"
                                : "border-emerald-200 bg-emerald-50/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700">
                                <Icon className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate text-sm font-medium text-neutral-950">
                                        {item.title}
                                      </p>
                                      {!item.read ? (
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                      ) : null}
                                    </div>

                                    <p className="mt-1 text-sm leading-5 text-neutral-600">
                                      {item.description}
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getNotificationChipClass(
                                          item.type,
                                        )}`}
                                      >
                                        {item.type}
                                      </span>
                                      <span className="text-[11px] text-neutral-400">
                                        {new Date(item.createdAt).toLocaleString(
                                          [],
                                          {
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                          },
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {item.href ? (
                                    <span className="shrink-0 text-xs font-medium text-emerald-600">
                                      Open
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        );

                        if (!item.href) {
                          return <div key={item.id}>{content}</div>;
                        }

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => {
                              setNotifOpen(false);
                              void markOneRead(item.id);
                            }}
                            className="block"
                          >
                            {content}
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div ref={userRef} className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setUserOpen((v) => !v);
                  setNotifOpen(false);
                  setSearchModalOpen(false);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-2xl px-1 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                aria-label="Account menu"
              >
                <FaUserLarge className="h-4 w-4 text-emerald-700" />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-700 transition hover:bg-neutral-50"
              >
                <CalendarDays className="h-4 w-4 text-neutral-500" />
                <span>{dateLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {userOpen ? (
                <div className="absolute right-40 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-sm font-semibold text-neutral-950">
                      Admin account
                    </p>
                    <p className="text-xs text-neutral-500">
                      Signed in as admin
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm hover:bg-neutral-50"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm hover:bg-neutral-50"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm hover:bg-neutral-50"
                    >
                      <CircleUserRound className="h-4 w-4" />
                      Profile
                    </Link>

                    <form action="/api/admin/logout" method="post">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {searchModalOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setSearchModalOpen(false)}
          />
          <div className="relative mx-auto flex min-h-full max-w-3xl items-start justify-center px-4 pt-20">
            <div
              ref={searchModalRef}
              className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]"
            >
              <div className="border-b border-neutral-100 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-neutral-950">
                      Search
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Search products, customers, and brands
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSearchModalOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative mt-6">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search product, customer, brand"
                    className="h-12 w-full rounded-2xl border border-neutral-100 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-200 focus:bg-white"
                  />
                </form>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {query.trim().length < 2 ? (
                  <div className="px-4 py-10 text-sm text-neutral-500">
                    Type at least 2 characters to search.
                  </div>
                ) : loading ? (
                  <div className="px-4 py-10 text-sm text-neutral-500">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-10 text-sm text-neutral-500">
                    No matches found.
                  </div>
                ) : (
                  results.map((item) => {
                    const Icon =
                      item.type === "product"
                        ? Box
                        : item.type === "customer"
                          ? Users
                          : Tag;

                    return (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.href}
                        onClick={() => setSearchModalOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-neutral-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-neutral-950">
                            {item.label}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">
                            {item.meta}
                          </span>
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}