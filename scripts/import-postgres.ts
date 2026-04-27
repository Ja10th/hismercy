import { prisma } from "../lib/prisma";
import { readFile } from "fs/promises";

type Backup = {
  brands: any[];
  products: any[];
  productImages: any[];
  orders: any[];
  orderItems: any[];
};

function toDate(value: string) {
  return new Date(value);
}

async function main() {
  const raw = await readFile("prisma/backup.json", "utf8");
  const backup = JSON.parse(raw) as Backup;

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
    await tx.productImage.deleteMany();
    await tx.product.deleteMany();
    await tx.brand.deleteMany();

    await tx.brand.createMany({
      data: backup.brands.map((brand) => ({
        ...brand,
        createdAt: toDate(brand.createdAt),
        updatedAt: toDate(brand.updatedAt),
      })),
    });

    await tx.product.createMany({
      data: backup.products.map((product) => ({
        ...product,
        createdAt: toDate(product.createdAt),
        updatedAt: toDate(product.updatedAt),
      })),
    });

    await tx.productImage.createMany({
      data: backup.productImages.map((image) => ({
        ...image,
        createdAt: toDate(image.createdAt),
      })),
    });

    await tx.order.createMany({
      data: backup.orders.map((order) => ({
        ...order,
        createdAt: toDate(order.createdAt),
        updatedAt: toDate(order.updatedAt),
      })),
    });

    await tx.orderItem.createMany({
      data: backup.orderItems.map((item) => ({
        ...item,
        createdAt: toDate(item.createdAt),
      })),
    });
  });

  console.log("Data imported into Prisma Postgres");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });