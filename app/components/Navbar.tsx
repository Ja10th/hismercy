"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { navLinks, assets } from "@/data/content";
import { useCart } from "./cart/CartProvider";
import { Minus, Plus, Trash2 } from "lucide-react";

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const {
    items,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    const shouldLock = menuOpen || cartOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[#171717]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="hidden h-[72px] items-center justify-between gap-6 md:flex">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logoo.png"
                alt="Agrona"
                width={120}
                height={56}
                className="h-16 w-auto "
              />
            </Link>

            <div className="flex items-center gap-8">
              {navLinks.map((link) => {
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

            <div className="flex items-center gap-4">
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
                className="h-11 w-auto "
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
                      className="flex gap-3  bg-[#f7f7f7] p-4 rounded-2xl"
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
                        <button
                          type="button"
                          onClick={() => router.push(`/shop/${item.slug}`)}
                          className="block w-full truncate text-left text-sm font-medium text-neutral-950 hover:underline"
                        >
                          {item.name}
                        </button>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="mt-1 text-sm text-neutral-500">
                            {formatNaira(item.price)}
                          </p>
                          <div className="inline-flex items-center rounded-full bg-[#f3f3f1] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.qty - 1)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="min-w-9 px-2 text-center text-sm font-medium text-neutral-950">
                              {item.qty}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.qty + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white"
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
                <div className=" bg-white p-4 ">
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
                      className="flex-1 rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
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
    </>
  );
}
