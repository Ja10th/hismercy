import { prisma } from "../lib/prisma";
import { writeFile } from "fs/promises";

async function main() {
  const [brands, products, productImages, orders, orderItems] = await Promise.all([
    prisma.brand.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.productImage.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.orderItem.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  await writeFile(
    "prisma/backup.json",
    JSON.stringify(
      { brands, products, productImages, orders, orderItems },
      null,
      2
    )
  );

  console.log("Backup written to prisma/backup.json");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });