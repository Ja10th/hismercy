"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  nairaToKobo,
  upsertAppSetting,
  type AppSettings,
} from "@/lib/settings";
import { logAudit } from "@/lib/audit";

function getString(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(getString(formData, key, String(fallback)));
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : fallback;
}

function refreshAll() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/checkout");
  revalidatePath("/contact-us");
  revalidatePath("/about");
}

export async function saveGeneralSettings(formData: FormData) {
  await requireAdmin();

  const value: AppSettings["general"] = {
    siteName: getString(formData, "siteName", "Mercy Agricultural Services"),
    tagline: getString(formData, "tagline", ""),
    logoText: getString(formData, "logoText", "Mercy Agric"),
    footerText: getString(formData, "footerText", ""),
  };

  await upsertAppSetting("general", value);
  await logAudit({ category: "settings", action: "Updated general settings", href: "/admin/settings" });
  refreshAll();
  redirect("/admin/settings?saved=general");
}

export async function saveContactSettings(formData: FormData) {
  await requireAdmin();

  const value: AppSettings["contact"] = {
    supportEmail: getString(formData, "supportEmail", ""),
    phone: getString(formData, "phone", ""),
    whatsapp: getString(formData, "whatsapp", ""),
    address: getString(formData, "address", ""),
  };

  await upsertAppSetting("contact", value);
  await logAudit({ category: "settings", action: "Updated contact settings", href: "/admin/settings" });
  refreshAll();
  redirect("/admin/settings?saved=contact");
}

export async function saveDeliverySettings(formData: FormData) {
  await requireAdmin();

  const value: AppSettings["delivery"] = {
    originState: getString(formData, "originState", "Ekiti"),
    originCity: getString(formData, "originCity", "Ado-Ekiti"),
    pickupEnabled: getBoolean(formData, "pickupEnabled"),
    zones: {
      same_city: {
        feePerBag: nairaToKobo(getString(formData, "sameCityFeePerBag", "300")),
        minBags: getNumber(formData, "sameCityMinBags", 15),
        recommendedMaxBags: getNumber(
          formData,
          "sameCityRecommendedMaxBags",
          20,
        ),
      },
      same_state: {
        feePerBag: nairaToKobo(getString(formData, "sameStateFeePerBag", "300")),
        minBags: getNumber(formData, "sameStateMinBags", 200),
        recommendedMaxBags: getNumber(
          formData,
          "sameStateRecommendedMaxBags",
          500,
        ),
      },
      outside_state: {
        feePerBag: nairaToKobo(
          getString(formData, "outsideStateFeePerBag", "500"),
        ),
        minBags: getNumber(formData, "outsideStateMinBags", 300),
        recommendedMaxBags: getNumber(
          formData,
          "outsideStateRecommendedMaxBags",
          600,
        ),
        quoteAfterReview: getBoolean(formData, "outsideStateQuoteAfterReview"),
      },
    },
  };

  await upsertAppSetting("delivery", value);
  await logAudit({ category: "settings", action: "Updated delivery settings", href: "/admin/settings" });
  refreshAll();
  redirect("/admin/settings?saved=delivery");
}

export async function saveNotificationSettings(formData: FormData) {
  await requireAdmin();

  const value: AppSettings["notifications"] = {
    orderAlerts: getBoolean(formData, "orderAlerts"),
    blogAlerts: getBoolean(formData, "blogAlerts"),
    customerAlerts: getBoolean(formData, "customerAlerts"),
    productAlerts: getBoolean(formData, "productAlerts"),
    paymentAlerts: getBoolean(formData, "paymentAlerts"),
  };

  await upsertAppSetting("notifications", value);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=notifications");
}

export async function saveFeatureSettings(formData: FormData) {
  await requireAdmin();

  const value: AppSettings["features"] = {
    showAdminSearch: getBoolean(formData, "showAdminSearch"),
    enablePublicBlog: getBoolean(formData, "enablePublicBlog"),
    allowGuestCheckout: getBoolean(formData, "allowGuestCheckout"),
    saveCustomerDetails: getBoolean(formData, "saveCustomerDetails"),
    lowStockAlerts: getBoolean(formData, "lowStockAlerts"),
  };

  await upsertAppSetting("features", value);
  refreshAll();
  redirect("/admin/settings?saved=features");
}

export async function saveSecuritySettings(formData: FormData) {
  await requireAdmin();

  const value: AppSettings["security"] = {
    maintenanceMode: getBoolean(formData, "maintenanceMode"),
    adminSessionDays: getNumber(formData, "adminSessionDays", 7),
    requireStrongPasswords: getBoolean(formData, "requireStrongPasswords"),
    logWebhookEvents: getBoolean(formData, "logWebhookEvents"),
  };

  await upsertAppSetting("security", value);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=security");
}