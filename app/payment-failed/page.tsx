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
      <main className="h-[700px] md:h-[800px] bg-neutral-50 px-5 pt-32 md:pt-40 pb-16">
        <div className="mx-auto max-w-lg">
          {/* Status mark */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-100 bg-red-50 ring-8 ring-red-50 ring-border-red-100">
              <AlertCircle
                className="h-10 w-10 text-red-500"
                strokeWidth={1.5}
              />
            </div>

            <h1 className="mt-4 mb-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              We could not confirm your payment.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
              No money has been taken from your account. Your cart is still
              saved, you can try again right away.
            </p>
          </div>

          {/* Reasons card */}
          <div className="mt-10 rounded-3xl ">
            <div className="mt-6 rounded-2xl border text-center border-amber-100 bg-amber-50 p-4 text-xs text-amber-700">
              If money was deducted from your account and you still see this
              page, please contact us immediately with your order details.
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
      </main>
      <Footer />
    </>
  );
}
