import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { prisma } from "@/lib/prisma";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react";

type TrackOrderPageProps = {
  searchParams?: Promise<{
    email?: string;
    orderCode?: string;
  }>;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pending";
    case "on_the_way":
      return "On the way";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function statusStepIndex(status: string) {
  switch (status) {
    case "pending":
      return 0;
    case "on_the_way":
      return 1;
    case "delivered":
      return 2;
    case "completed":
      return 3;
    default:
      return 0;
  }
}

export default async function TrackOrderPage({
  searchParams,
}: TrackOrderPageProps) {
  const params = searchParams ? await searchParams : {};
  const email = typeof params.email === "string" ? params.email.trim() : "";
  const orderCode =
    typeof params.orderCode === "string" ? params.orderCode.trim() : "";

  const order =
    email && orderCode
      ? await prisma.order.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
            orderCode: { equals: orderCode, mode: "insensitive" },
          },
          include: {
            customer: true,
            items: {
              orderBy: { createdAt: "asc" },
            },
            history: {
              orderBy: { createdAt: "asc" },
            },
          },
        })
      : null;

  const currentStep = order ? statusStepIndex(order.status) : 0;

  const steps = [
    {
      key: "pending",
      label: "Order placed",
      icon: Clock3,
    },
    {
      key: "on_the_way",
      label: "On the way",
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: Package,
    },
    {
      key: "completed",
      label: "Completed",
      icon: CheckCircle2,
    },
  ] as const;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 px-4 pt-28 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700">
              <Search className="h-4 w-4" />
              Track your order
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Check your order status
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
              Enter the email used at checkout and your order code. You will see
              the live status here when the admin updates it.
            </p>
          </div>

          <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <form action="/track-order" method="get" className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      name="email"
                      defaultValue={email}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Order code
                  </label>
                  <input
                    name="orderCode"
                    defaultValue={orderCode}
                    placeholder="ORD-XXXXXXX"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Track order
                </button>
              </form>

              <div className="mt-5 rounded-[22px] border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                Use the same email you entered during checkout. The order code
                was shown after payment.
              </div>
            </div>

            <div className="space-y-5">
              {!email || !orderCode ? (
                <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500">
                  Enter your email and order code to see your order status.
                </div>
              ) : !order ? (
                <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500">
                  No order was found for that email and order code.
                </div>
              ) : (
                <>
                  <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-neutral-400">
                          {order.orderCode}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                          {statusLabel(order.status)}
                        </h2>
                        <p className="mt-2 text-sm text-neutral-500">
                          Payment:{" "}
                          <span
                            className={
                              order.paymentStatus === "paid" ||
                              order.paymentStatus === "success"
                                ? "font-medium text-emerald-600"
                                : "font-medium text-amber-600"
                            }
                          >
                            {order.paymentStatus === "paid" ||
                            order.paymentStatus === "success"
                              ? "Paid"
                              : "Pending"}
                          </span>
                        </p>
                      </div>

                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-right">
                        <p className="text-xs text-neutral-500">Total</p>
                        <p className="text-xl font-semibold text-neutral-950">
                          {formatNaira(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-4">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        const active = index <= currentStep;
                        return (
                          <div
                            key={step.key}
                            className={[
                              "rounded-2xl border p-4",
                              active
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-neutral-200 bg-neutral-50",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "flex h-10 w-10 items-center justify-center rounded-full",
                                active ? "bg-emerald-700 text-white" : "bg-white text-neutral-400",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <p className="mt-3 text-sm font-medium text-neutral-950">
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        Order items
                      </h3>

                      <div className="mt-4 space-y-3">
                        {order.items.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                            No items found.
                          </div>
                        ) : (
                          order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium text-neutral-950">
                                  {item.name}
                                </p>
                                <p className="mt-1 text-sm text-neutral-500">
                                  Qty {item.qty}
                                </p>
                              </div>
                              <p className="shrink-0 text-sm font-medium text-neutral-950">
                                {formatNaira(item.price * item.qty)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                        <h3 className="text-lg font-semibold text-neutral-950">
                          Delivery
                        </h3>

                        <div className="mt-4 space-y-3 text-sm text-neutral-600">
                          <p className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-neutral-400" />
                            {order.street}, {order.city}, {order.state}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-950">
                              Method:
                            </span>{" "}
                            {order.deliveryMethod}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-950">
                              Email:
                            </span>{" "}
                            {order.email}
                          </p>
                          <p>
                            <span className="font-medium text-neutral-950">
                              Phone:
                            </span>{" "}
                            {order.phone}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                        <h3 className="text-lg font-semibold text-neutral-950">
                          Timeline
                        </h3>

                        <div className="mt-4 space-y-3">
                          {order.history.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                              No status updates yet.
                            </div>
                          ) : (
                            order.history.map((entry) => (
                              <div
                                key={entry.id}
                                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                              >
                                <p className="font-medium text-neutral-950">
                                  {statusLabel(entry.status)}
                                </p>
                                {entry.note ? (
                                  <p className="mt-1 text-sm text-neutral-500">
                                    {entry.note}
                                  </p>
                                ) : null}
                                <p className="mt-2 text-xs text-neutral-400">
                                  {formatDateTime(entry.createdAt)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}