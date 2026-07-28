"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { navLinks, assets } from "@/data/content";
import { useCart } from "./cart/CartProvider";
import { slugify } from "@/lib/slugify";
import {
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Minus,
  Plus,
  Store,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Brand = {
  id: string;
  name: string;
};

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

/* ---------- shared dropdown styling ---------- */

const PANEL_CLASS =
  "absolute z-[260] mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-150 ease-out origin-top";
const PANEL_VISIBLE = "opacity-100 translate-y-0 pointer-events-auto";
const PANEL_HIDDEN = "opacity-0 -translate-y-1 pointer-events-none";
const ITEM_CLASS =
  "flex items-center gap-2.5 px-4 py-3 text-sm text-white/85 transition hover:bg-white/10 hover:text-white";

const MOBILE_CARD_CLASS = "rounded-2xl";
const MOBILE_ITEM_CLASS =
  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/85 transition hover:bg-white/10 hover:text-white";

/* ---------- shared open/outside-click/escape logic ---------- */

function useDropdown() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return { open, setOpen, ref };
}

function ProfileDropdown() {
  const { open, setOpen, ref } = useDropdown();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-xl px-2 py-2.5 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-white/20"
      >
        <UserRound className="h-4 w-4" />
        <ChevronDown
          className={`h-4 w-4 opacity-80 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        role="menu"
        className={`${PANEL_CLASS} right-0 top-full w-56 ${
          open ? PANEL_VISIBLE : PANEL_HIDDEN
        }`}
      >
        <Link role="menuitem" href="/my-orders" className={ITEM_CLASS}>
          <UserRound className="h-4 w-4" />
          My Profile
        </Link>
        <Link role="menuitem" href="/contact-us" className={ITEM_CLASS}>
          <CircleHelp className="h-4 w-4" />
          Help
        </Link>
      </div>
    </div>
  );
}

function ShopDropdown({ brands }: { brands: Brand[] }) {
  const { open, setOpen, ref } = useDropdown();
  const pathname = usePathname();
  const hasBrands = brands.length > 0;
  const isShopActive = pathname.startsWith("/shop");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => hasBrands && setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={!hasBrands}
        className={`nav-underline inline-flex items-center gap-1.5 text-[17px] font-semibold transition-colors duration-200 disabled:cursor-default disabled:opacity-60 ${
          isShopActive ? "text-white/95" : "text-white/90 hover:text-white"
        }`}
      >
        Shop
        <ChevronDown
          className={`h-4 w-4 opacity-70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        role="menu"
        className={`${PANEL_CLASS} left-0 top-full w-72 ${
          open && hasBrands ? PANEL_VISIBLE : PANEL_HIDDEN
        }`}
      >
        <Link
          role="menuitem"
          href="/shop"
          className={`${ITEM_CLASS} font-medium text-white`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-700/30 text-emerald-400">
            <Store className="h-3.5 w-3.5" />
          </span>
          All Products
        </Link>

        <Link
          role="menuitem"
          href="/custom-order"
          className={`${ITEM_CLASS} border-b border-white/8 font-medium text-emerald-400`}
        >
          
          Custom Order
        </Link>

        <p className="px-4 pb-1 pt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
          Shop by brand
        </p>

        <div className="max-h-72 overflow-y-auto pb-2">
          {brands.map((b) => (
            <Link
              key={b.id}
              role="menuitem"
              href={`/shop/brand/${slugify(b.name)}`}
              className={ITEM_CLASS}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [shopOpenMobile, setShopOpenMobile] = useState(false);
  const [profileOpenMobile, setProfileOpenMobile] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const { items, totalItems, subtotal, updateQuantity, removeFromCart } =
    useCart();

  useEffect(() => {
    const shouldLock = menuOpen || cartOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setCartOpen(false);
    setShopOpenMobile(false);
    setProfileOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    let active = true;

    async function loadBrands() {
      try {
        const res = await fetch("/api/brands", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch brands");

        const data = (await res.json()) as Brand[];
        if (active) setBrands(data);
      } catch {
        if (active) setBrands([]);
      } finally {
        if (active) setBrandsLoading(false);
      }
    }

    loadBrands();

    return () => {
      active = false;
    };
  }, []);

  const navMenuItems = useMemo(
    () => navLinks.map((link) => ({ href: link.href, label: link.label })),
    [],
  );

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="hidden h-[72px] items-center justify-between gap-6 md:flex">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logoo.png"
                alt="Agrona"
                width={120}
                height={56}
                className="h-16 w-auto"
              />
            </Link>

            <div className="flex items-center gap-8">
              {navMenuItems.map((link) => {
                if (link.href === "/shop") {
                  return <ShopDropdown key="shop" brands={brands} />;
                }

                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-underline text-[17px] font-semibold transition-colors duration-200 ${
                      active
                        ? "text-white/95"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <ProfileDropdown />

              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="flex items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <Image
                  src={assets.cartIcon}
                  alt=""
                  width={22}
                  height={22}
                  className="brightness-0 invert"
                />
                <span className="ml-[-10px] mt-[-2px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-600 text-[8px] font-semibold text-white">
                  {totalItems}
                </span>
              </button>

              <Link
                href="/contact-us"
                className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-6 py-2.5 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-white/25"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="flex h-[72px] items-center justify-between md:hidden">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logoo.png"
                alt="Agrona"
                width={96}
                height={44}
                className="h-11 w-auto"
              />
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="flex items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <Image
                  src={assets.cartIcon}
                  alt=""
                  width={22}
                  height={22}
                  className="brightness-0 invert"
                />
                <span className="ml-[-10px] mt-[-2px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-600 text-[8px] font-semibold text-white">
                  {totalItems}
                </span>
              </button>

              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className="flex flex-col items-end gap-[5px] p-2"
              >
                <span className="block h-px w-6 rounded bg-white transition-all duration-300" />
                <span className="block h-px w-3 rounded bg-white transition-all duration-300" />
                <span className="block h-px w-6 rounded bg-white transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[210] transition ${
          cartOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/45 transition-opacity duration-300 ${
            cartOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setCartOpen(false)}
        />

        <aside
          className={`fixed right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-white transition-transform duration-300 ease-out ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
            <div>
              <h4 className="text-[24px] font-semibold text-neutral-950">
                Your Cart
              </h4>
              <p className="text-xs text-neutral-500">{totalItems} item(s)</p>
            </div>

            <button
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              className="rounded-full bg-white p-2 text-neutral-500 transition hover:text-neutral-900"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path
                  d="M1 1l14 14M15 1L1 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-5">
              <div className="bg-white px-6 py-10 text-center">
                <p className="text-[15px] text-neutral-400">No items found.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl bg-[#f7f7f7] p-4"
                    >
                      <button
                        type="button"
                        onClick={() => router.push(`/shop/${item.slug}`)}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#F3F3F1]"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <button
                            type="button"
                            onClick={() => router.push(`/shop/${item.slug}`)}
                            className="block w-full truncate text-left text-sm font-medium text-neutral-950 hover:underline"
                          >
                            {item.name}
                          </button>
                          <p className="mt-1 text-sm text-neutral-500">
                            {formatNaira(item.price)}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-1">
                          <div className="inline-flex items-center rounded-full p-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.qty - 1)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-[#F7F7F7] text-neutral-700 transition hover:bg-white"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => {
                                const next = Number(e.target.value);
                                if (e.target.value === "") return;
                                if (Number.isNaN(next)) return;
                                updateQuantity(item.id, Math.max(1, next));
                              }}
                              onBlur={() => {
                                if (!item.qty || item.qty < 1) {
                                  updateQuantity(item.id, 1);
                                }
                              }}
                              inputMode="numeric"
                              className="h-8 w-14 rounded-full text-center text-sm text-neutral-950 outline-none [appearance:textfield] focus:border-neutral-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              aria-label={`Quantity for ${item.name}`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.qty + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-[#F7F7F7] text-neutral-700 transition hover:bg-white"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="inline-flex h-9 items-center gap-1 rounded-full bg-red-50 px-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-black/5 bg-white p-5">
                <div className="bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-base font-semibold text-neutral-950">
                      {formatNaira(subtotal)}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCartOpen(false);
                        router.push("/checkout");
                      }}
                      className="flex-1 rounded-full bg-emerald-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <div
        className={`fixed inset-0 z-[220] transition ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        } md:hidden`}
      >
        <div
          className={`fixed inset-0 bg-black/45 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          className={`fixed left-0 top-0 flex h-full w-full max-w-[380px] flex-col bg-[#171717] text-white transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Menu
            </p>

            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-2">
              {navMenuItems.map((link) => {
                if (link.href === "/shop") {
                  return (
                    <div key="shop" className={MOBILE_CARD_CLASS}>
                      <button
                        type="button"
                        onClick={() => setShopOpenMobile((prev) => !prev)}
                        className="flex w-full items-center justify-between px-4 py-4 text-[16px] font-medium text-white/90"
                      >
                        Shop
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            shopOpenMobile ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {shopOpenMobile ? (
                        <div className="border-t border-white/10 p-2">
                          <Link
                            href="/shop"
                            onClick={() => setMenuOpen(false)}
                            className={MOBILE_ITEM_CLASS}
                          >
                            <Store className="h-4 w-4 text-emerald-400" />
                            All Products
                          </Link>

                          <Link
                            href="/custom-order"
                            onClick={() => setMenuOpen(false)}
                            className={`${MOBILE_ITEM_CLASS} text-emerald-400`}
                          >
                            Custom Order
                          </Link>

                          <p className="px-3 pb-1 pt-3 text-[10px] uppercase tracking-[0.18em] text-white/40">
                            Shop by brand
                          </p>

                          {brandsLoading ? (
                            <p className="px-3 py-3 text-sm text-white/50">
                              Loading brands...
                            </p>
                          ) : (
                            brands.map((b) => (
                              <Link
                                key={b.id}
                                href={`/shop/brand/${slugify(b.name)}`}
                                onClick={() => setMenuOpen(false)}
                                className={MOBILE_ITEM_CLASS}
                              >
                                {b.name}
                              </Link>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-2xl px-4 py-4 text-[16px] font-medium transition ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/85 hover:bg-white/8 hover:text-white"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className={`mt-6 ${MOBILE_CARD_CLASS}`}>
              <button
                type="button"
                onClick={() => setProfileOpenMobile((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-4 text-[16px] font-medium text-white/90"
              >
                Account
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    profileOpenMobile ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpenMobile ? (
                <div className="border-t border-white/10 p-2">
                  <Link
                    href="/my-orders"
                    onClick={() => setMenuOpen(false)}
                    className={MOBILE_ITEM_CLASS}
                  >
                    <UserRound className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/contact-us"
                    onClick={() => setMenuOpen(false)}
                    className={MOBILE_ITEM_CLASS}
                  >
                    <CircleHelp className="h-4 w-4" />
                    Help
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="mt-6 p-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setCartOpen(true);
                }}
                className="inline-flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-neutral-950"
              >
                <span className="inline-flex items-center gap-2">
                  <Image src={assets.cartIcon} alt="" width={18} height={18} />
                  View Cart
                </span>
                <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-xs text-white">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 p-5">
            <Link
              href="/contact-us"
              onClick={() => setMenuOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Contact Us
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}