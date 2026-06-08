import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import CustomersTable from "./CustomersTable";

type CustomersPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

type CustomerStatusFilter = "all" | "subscribed" | "pending" | "not_subscribed";

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = (params.status as CustomerStatusFilter) ?? "all";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const perPage = 7;

  const [allCustomers, paidStats] = await Promise.all([
    prisma.customer.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { street: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { state: { contains: q, mode: "insensitive" } },
              { landmark: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        _count: { select: { orders: true } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 2,
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
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: {
        paymentStatus: { in: ["paid", "success"] },
      },
      _sum: { total: true },
      _count: { _all: true },
      _max: { createdAt: true },
    }),
  ]);

  const paidStatsMap = new Map(
    paidStats.map((row) => [
      row.customerId,
      {
        revenue: row._sum.total || 0,
        paidCount: row._count._all,
        lastPaidAt: row._max.createdAt,
      },
    ]),
  );

  const filteredCustomers = allCustomers.filter((customer) => {
    const stats = paidStatsMap.get(customer.id);
    const hasPaidRevenue = (stats?.revenue || 0) > 0;
    const hasOrders = customer._count.orders > 0;

    if (status === "subscribed") return hasPaidRevenue;
    if (status === "pending") return !hasPaidRevenue && hasOrders;
    if (status === "not_subscribed") return !hasPaidRevenue && !hasOrders;
    return true;
  });

  const totalCount = filteredCustomers.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));
  const currentPage = Math.min(page, pageCount);
  const customersPage = filteredCustomers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const rows = customersPage.map((customer) => {
    const stats = paidStatsMap.get(customer.id);
    const revenue = stats?.revenue || 0;
    const hasPaidRevenue = revenue > 0;

    return {
      ...customer,
      revenue,
      hasPaidRevenue,
    };
  });

  const allEmails = filteredCustomers
    .map((customer) => customer.email)
    .filter(Boolean);

  const paidCustomers = filteredCustomers.filter(
    (customer) => (paidStatsMap.get(customer.id)?.revenue || 0) > 0,
  );

  const basePercent =
    filteredCustomers.length === 0
      ? 0
      : Math.round((paidCustomers.length / filteredCustomers.length) * 100);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 pb-4 pt-8 sm:px-6 lg:px-2">
      <div className="mx-auto max-w-[1600px]">
        <CustomersTable
          customers={rows}
          query={q}
          status={status}
          totalCount={filteredCustomers.length}
          paidPercent={basePercent}
          currentPage={currentPage}
          pageCount={pageCount}
          allEmails={allEmails}
        />
      </div>
    </div>
  );
}