import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-600">
          Payment failed
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
          We could not confirm your payment.
        </h1>
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          Please try again or contact support.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/checkout"
            className="inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Back to checkout
          </Link>
        </div>
      </div>
    </main>
  );
}