import { prisma } from "@/lib/prisma";

type NotificationType =
  | "order"
  | "blog"
  | "product"
  | "customer"
  | "brand"
  | "system";

export async function createAdminNotification(input: {
  title: string;
  description: string;
  href?: string;
  type?: NotificationType;
}) {
  return prisma.adminNotification.create({
    data: {
      title: input.title,
      description: input.description,
      href: input.href,
      type: input.type ?? "system",
    },
  });
}