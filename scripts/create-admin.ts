import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = String(process.env.ADMIN_SEED_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_SEED_PASSWORD || "");
  const name = String(process.env.ADMIN_SEED_NAME || "Admin").trim();

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "admin",
    },
    create: {
      email,
      name,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });