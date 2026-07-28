# Admin Password Reset Guide

If you've forgotten your admin password, you have **three options**:

---

## Option 1: Use the Reset Script (Recommended)

We've created a CLI script that resets the password directly in the database.

### Steps:

1. Open your terminal in the project root
2. Run:
   ```bash
   npx tsx scripts/reset-admin-password.ts mercyagric@gmail.com "YourNewPassword123"
   ```
   Replace `YourNewPassword123` with your desired new password (minimum 8 characters).

3. The script will:
   - Find the admin by email
   - Hash the new password with bcrypt
   - Update it in the database
   - Delete all active sessions (forces re-login everywhere)

4. You'll see output like:
   ```
   ✅ Found: Mercy Agric <mercyagric@gmail.com>
   🔐 Hashing new password...
   💾 Updating password in database...
   🗑️  Deleting all active sessions...
   ✅ Done. Deleted 2 session(s).
   
   🎉 Password reset successfully for mercyagric@gmail.com
      You can now log in with the new password.
   ```

---

## Option 2: Direct Database Query (If script fails)

If `tsx` or the script doesn't work, connect directly to your database:

### Using Prisma Studio:
```bash
npx prisma studio
```

Then:
1. Navigate to the `AdminUser` table
2. Find your admin user by email (`mercyagric@gmail.com`)
3. Generate a bcrypt hash for your new password at: https://bcrypt-generator.com (rounds: 12)
4. Copy the hash and paste it into the `passwordHash` field
5. Save
6. In the `AdminSession` table, delete all sessions for that user ID (optional but recommended)

### Using SQL:
Connect to your database and run:
```sql
-- Get a bcrypt hash from https://bcrypt-generator.com first
UPDATE "AdminUser"
SET "passwordHash" = '$2a$12$YOUR_GENERATED_HASH_HERE'
WHERE email = 'mercyagric@gmail.com';

-- Delete all sessions to force re-login
DELETE FROM "AdminSession"
WHERE "userId" = (SELECT id FROM "AdminUser" WHERE email = 'mercyagric@gmail.com');
```

---

## Option 3: Re-run the Seed (⚠️ Destructive)

**WARNING:** This will reset the database to initial state (you'll lose all orders, customers, products).

Only use this in development or if you have a backup.

```bash
npx prisma db push --force-reset
npx prisma db seed
```

The seed password is defined in `.env`:
```
ADMIN_SEED_EMAIL="mercyagric@gmail.com"
ADMIN_SEED_PASSWORD="password"
```

---

## For Production: Add Email-Based Password Reset (Future Enhancement)

For a production app, you should implement a proper "Forgot Password" flow:

1. **Forgot password page** at `/forgot-password`
2. User enters their email
3. Generate a secure, time-limited token (e.g., `crypto.randomBytes(32)`)
4. Store the token hash + expiry in a new `PasswordResetToken` table
5. Email the user a link: `/reset-password?token=...`
6. On that page, validate the token and let them set a new password
7. Delete the token after successful reset

This is more secure than CLI scripts and works for admins who don't have DB access.

---

## Current Admin Credentials (from .env)

```
Email: mercyagric@gmail.com
```

After running the reset script with `"MercyAdmin2025!"` as the new password:
```
Password: MercyAdmin2025!
```

**⚠️ SECURITY REMINDER:**
- Change the seed password in `.env` from `"password"` to something strong
- Store the real admin password in a password manager, not in `.env`
- The `.env` file should NEVER be committed to git with real credentials
