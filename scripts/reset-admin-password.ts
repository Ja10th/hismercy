#!/usr/bin/env tsx
//
// Emergency admin password reset script.
//
// Usage:
//   npx tsx scripts/reset-admin-password.ts <email> <new-password>
//
// Example:
//   npx tsx scripts/reset-admin-password.ts admin@example.com MyNewPassword123
//
// This script:
//   1. Finds the admin by email
//   2. Hashes the new password with bcrypt (cost 12, same as the app)
//   3. Updates the passwordHash in the DB
//   4. Deletes all active sessions (forces re-login)
//

import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function resetPassword(email: string, newPassword: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !newPassword) {
    console.error("❌ Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>");
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error("❌ Password must be at least 8 characters.");
    process.exit(1);
  }

  console.log(`🔍 Looking for admin with email: ${normalizedEmail}`);

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!admin) {
    console.error(`❌ No admin found with email: ${normalizedEmail}`);
    process.exit(1);
  }

  if (admin.role !== "admin") {
    console.error(`❌ User exists but role is "${admin.role}" (expected "admin"). Cannot reset.`);
    process.exit(1);
  }

  console.log(`✅ Found: ${admin.name || "(no name)"} <${admin.email}>`);
  console.log("🔐 Hashing new password...");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  console.log("💾 Updating password in database...");

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  console.log("🗑️  Deleting all active sessions (forces re-login everywhere)...");

  const { count } = await prisma.adminSession.deleteMany({
    where: { userId: admin.id },
  });

  console.log(`✅ Done. Deleted ${count} session(s).`);
  console.log(`\n🎉 Password reset successfully for ${admin.email}`);
  console.log(`   You can now log in with the new password.`);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("❌ Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>");
  console.error("\nExample:");
  console.error('  npx tsx scripts/reset-admin-password.ts admin@example.com "MyNewPassword123"');
  process.exit(1);
}

resetPassword(email, newPassword)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed to reset password:", error);
    process.exit(1);
  });
