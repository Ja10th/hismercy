"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navLinks, assets } from "@/data/content";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const shouldLock = menuOpen || cartOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#171717] border-b border-white/10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="hidden md:flex items-center justify-between h-[72px] gap-6">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/hismercylogo.png"
                alt="Agrona"
                width={120}
                height={56}
                className="h-14 w-auto brightness-0 invert"
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
                      active ? "text-white/95" : "text-white/90 hover:text-white"
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
                className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Image
                  src={assets.cartIcon}
                  alt=""
                  width={22}
                  height={22}
                  className="brightness-0 invert"
                />
                <span className="ml-[-10] text-[8px] mt-[-2] z-20 font-semibold bg-green-600 text-white w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  0
                </span>
              </button>

              <Link
                href="/contact-us"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 bg-white/15 hover:bg-white/25 text-white border border-white/30"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center justify-between h-[72px]">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/hismercylogo.png"
                alt="Agrona"
                width={96}
                height={44}
                className="h-11 w-auto brightness-0 invert"
              />
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Image
                  src={assets.cartIcon}
                  alt=""
                  width={22}
                  height={22}
                  className="brightness-0 invert"
                />
                <span className="ml-[-10] text-[8px] mt-[-2] z-20 font-semibold bg-green-600 text-white w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  0
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
        className={`fixed inset-0 z-[200] md:hidden transition ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />

        <div
          className={`absolute inset-y-0 left-0 h-full w-full bg-[#171717] shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 h-[72px] border-b border-white/10">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <Image
                src="/hismercylogo.png"
                alt="Agrona"
                width={96}
                height={44}
                className="h-11 w-auto brightness-0 invert"
              />
            </Link>

            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path
                  d="M1 1l14 14M15 1L1 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="px-4 sm:px-6 py-6 flex flex-col">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-4 text-[18px] border-b border-white/10 transition-colors ${
                    active ? "text-white" : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/contact-us"
              onClick={() => setMenuOpen(false)}
              className="mt-6 text-center bg-white text-neutral-900 py-4 rounded-full text-[15px] font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[210] transition ${
          cartOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            cartOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setCartOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-[380px] bg-white p-5 sm:p-6 flex flex-col gap-4 shadow-2xl transition-transform duration-300 ease-out ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[18px] font-semibold">Your Cart</h4>
            <button
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-800 transition-colors"
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

          <p className="text-neutral-400 text-[15px] text-center mt-12">
            No items found.
          </p>
        </div>
      </div>
    </>
  );
}