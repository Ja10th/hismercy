import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart } from "lucide-react";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderCode: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customers
      </Link>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <h1 className="text-3xl font-semibold text-neutral-950">{customer.fullName}</h1>

        <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
          <p className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-neutral-400" />
            {customer.email}
          </p>
          <p className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-neutral-400" />
            {customer.phone}
          </p>
          <p className="inline-flex items-center gap-2 sm:col-span-2">
            <MapPin className="h-4 w-4 text-neutral-400" />
            {customer.street}, {customer.city}, {customer.state}
          </p>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          {customer._count.orders} order{customer._count.orders === 1 ? "" : "s"}
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-neutral-500" />
          <h2 className="text-lg font-semibold">Recent orders</h2>
        </div>

        <div className="mt-4 space-y-3">
          {customer.orders.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          ) : (
            customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.orderCode}`}
                className="block rounded-2xl border border-neutral-200 px-4 py-3 transition hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-neutral-950">{order.orderCode}</p>
                    <p className="text-sm text-neutral-500">
                      {order.status} · {order.paymentStatus}
                    </p>
                  </div>
                  <p className="font-semibold text-neutral-950">
                    {formatNaira(order.total)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}