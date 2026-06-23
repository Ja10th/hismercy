import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AlertCircle } from "lucide-react";

const reasons = [
  "Insufficient funds on the card or account",
  "Card details entered incorrectly",
  "Transaction declined by your bank",
  "Session expired before payment completed",
];

export default function PaymentFailedPage() {
  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden bg-red-950 pb-14 md:pb-28 pt-28 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
          aria-hidden
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-emerald-400" />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span className="select-none text-[24vw] md:text-[22vw] font-black uppercase leading-none tracking-tighter text-red-900/20">
            OOps
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
          <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            Payment Failed
          </h1>
        </div>
      </section>
      <div className="mx-auto max-w-lg pt-10 pb-20 px-10 md:px-0">
        {/* Reasons card */}
        <div className="mt-10 rounded-3xl ">
          <p className="mt-3 text-[16px] md:text-base lg:text-[20px] text-center leading-relaxed text-neutral-500">
            No money has been taken from your account. Your cart is still saved,
            you can try again right away.
          </p>
          <div className="mt-6 rounded-2xl border text-center border-amber-100 bg-amber-50 p-4 text-xs text-amber-700">
            If money was deducted from your account and you still see this page,
            please contact us immediately with your order details.
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-medium text-white transition hover:bg-emerald-800 sm:w-auto"
          >
            Try again
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 sm:w-auto"
          >
            Contact support
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
