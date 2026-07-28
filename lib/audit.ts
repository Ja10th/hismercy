import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentAdminSession } from "@/lib/admin-auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditCategory =
  | "order"
  | "product"
  | "brand"
  | "blog"
  | "customer"
  | "settings"
  | "auth"
  | "payment"
  | "system";

type AuditInput = {
  category: AuditCategory;
  action: string; // past-tense: "Updated order status", "Deleted product"
  target?: string; // the entity being acted on (order code, product name, etc.)
  href?: string; // optional link back to the entity
  meta?: Record<string, unknown>; // snapshot of changes
  actor?: string; // optional override (if not from current session)
};

// ─── Log helper ───────────────────────────────────────────────────────────────

export async function logAudit(input: AuditInput) {
  try {
    // Fetch actor from current session if not explicitly provided
    let actor = input.actor;

    if (!actor) {
      const session = await getCurrentAdminSession();
      actor = session?.user.name || session?.user.email || "system";
    }

    await prisma.auditLog.create({
      data: {
        actor,
        category: input.category,
        action: input.action,
        target: input.target || null,
        href: input.href || null,
        meta: input.meta ? JSON.parse(JSON.stringify(input.meta)) : null,
      },
    });
  } catch (error) {
    // Log audit failures to console but don't throw — we don't want failed
    // audits to break the actual operation.
    console.error("[audit] failed to log audit entry:", error);
  }
}
