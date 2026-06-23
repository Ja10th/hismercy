import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About us" },
  { href: "/contact-us", label: "Contact" },
];

export default function NotFound() {
  return (
    <>
      <NavbarWrapper />
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-20">
        <div className="mx-auto w-full max-w-lg text-center">

          {/* The 404 */}
          <div className="relative inline-block">
            <p className="select-none text-[9rem] font-black leading-none tracking-tighter text-neutral-100 sm:text-[12rem]">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                <p className="text-sm font-semibold text-emerald-700">
                  Nothing grows here
                </p>
              </div>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
            This page does not exist.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            The link you followed may be broken, or the page may have been moved.
            Here are some places you can go instead.
          </p>

          {/* Nav links */}
          <nav className="mt-10">
            <ul className="divide-y divide-neutral-100 rounded-3xl border border-neutral-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center justify-between px-6 py-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {label}
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}