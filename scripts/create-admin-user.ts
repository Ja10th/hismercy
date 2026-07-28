#!/usr/bin/env tsx
//
// Creates a new admin user OR upgrades an existing user's role.
//
// Usage:
//   npx tsx scripts/create-admin-user.ts <name> <email> <password> [role]
//
// role defaults to "admin". Use "developer" for full access including audit log.
//
// Examples:
//   npx tsx scripts/create-admin-user.ts "Mercy Admin" "admin@mercyagric.com" "StrongPass123" admin
//

import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function run(name: string, email: string, password: string, role: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!["admin", "developer"].includes(role)) {
    console.error(`❌ Invalid role "${role}". Must be "admin" or "developer".`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ Password must be at least 8 characters.");
    process.exit(1);
  }

  console.log(`\n👤 Creating/updating: ${normalizedEmail} (role: ${role})`);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where: { email: normalizedEmail },
    update: { name, passwordHash, role },
    create: { name, email: normalizedEmail, passwordHash, role },
  });

  console.log(`✅ User saved: ${user.name} <${user.email}> [${user.role}]`);
  console.log(`\nLogin at /login with:`);
  console.log(`  Email:    ${user.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Access:   ${role === "developer" ? "Full (including Audit Log)" : "Full except Audit Log"}\n`);
}

const [,, name, email, password, role = "admin"] = process.argv;

if (!name || !email || !password) {
  console.error("❌ Usage: npx tsx scripts/create-admin-user.ts <name> <email> <password> [role]");
  console.error("\nExamples:");
  console.error('  npx tsx scripts/create-admin-user.ts "Mercy Admin" admin@example.com "Pass123" admin');
  console.error('  npx tsx scripts/create-admin-user.ts "Developer" dev@example.com "DevPass456" developer');
  process.exit(1);
}

run(name, email, password, role)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
