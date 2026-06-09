import "server-only";

import { prisma } from "@/lib/prisma";

export type ZoneSettings = {
  feePerBag: number; // kobo
  minBags: number;
  recommendedMaxBags: number;
  quoteAfterReview?: boolean;
};

export type GeneralSettings = {
  siteName: string;
  tagline: string;
  logoText: string;
  footerText: string;
};

export type ContactSettings = {
  supportEmail: string;
  phone: string;
  whatsapp: string;
  address: string;
};

export type DeliverySettings = {
  originState: string;
  originCity: string;
  pickupEnabled: boolean;
  zones: {
    same_city: ZoneSettings;
    same_state: ZoneSettings;
    outside_state: ZoneSettings;
  };
};

export type NotificationSettings = {
  orderAlerts: boolean;
  blogAlerts: boolean;
  customerAlerts: boolean;
  productAlerts: boolean;
  paymentAlerts: boolean;
};

export type FeatureSettings = {
  showAdminSearch: boolean;
  enablePublicBlog: boolean;
  allowGuestCheckout: boolean;
  saveCustomerDetails: boolean;
  lowStockAlerts: boolean;
};

export type SecuritySettings = {
  maintenanceMode: boolean;
  adminSessionDays: number;
  requireStrongPasswords: boolean;
  logWebhookEvents: boolean;
};

export type AppSettings = {
  general: GeneralSettings;
  contact: ContactSettings;
  delivery: DeliverySettings;
  notifications: NotificationSettings;
  features: FeatureSettings;
  security: SecuritySettings;
};

export type PublicAppSettings = Pick<
  AppSettings,
  "general" | "contact" | "delivery" | "features"
>;

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    siteName: "Mercy Agricultural Services",
    tagline: "Trusted feed, supplies, and farm support.",
    logoText: "Mercy Agricultural Services",
    footerText: "Supplying farmers with reliable products and support.",
  },
  contact: {
    supportEmail: "support@example.com",
    phone: "08000000000",
    whatsapp: "2348000000000",
    address: "Ado-Ekiti, Ekiti State, Nigeria",
  },
  delivery: {
    originState: "Ekiti",
    originCity: "Ado-Ekiti",
    pickupEnabled: true,
    zones: {
      same_city: {
        feePerBag: 30000,
        minBags: 15,
        recommendedMaxBags: 20,
      },
      same_state: {
        feePerBag: 30000,
        minBags: 200,
        recommendedMaxBags: 500,
      },
      outside_state: {
        feePerBag: 50000,
        minBags: 300,
        recommendedMaxBags: 600,
        quoteAfterReview: true,
      },
    },
  },
  notifications: {
    orderAlerts: true,
    blogAlerts: true,
    customerAlerts: true,
    productAlerts: true,
    paymentAlerts: true,
  },
  features: {
    showAdminSearch: true,
    enablePublicBlog: true,
    allowGuestCheckout: true,
    saveCustomerDetails: true,
    lowStockAlerts: true,
  },
  security: {
    maintenanceMode: false,
    adminSessionDays: 7,
    requireStrongPasswords: true,
    logWebhookEvents: true,
  },
};

const SECTION_META: Record<
  keyof AppSettings,
  { category: string; label: string; description: string; isPublic: boolean }
> = {
  general: {
    category: "site",
    label: "General",
    description: "Branding and homepage text.",
    isPublic: true,
  },
  contact: {
    category: "site",
    label: "Contact",
    description: "Public contact details.",
    isPublic: true,
  },
  delivery: {
    category: "commerce",
    label: "Delivery",
    description: "Delivery zones and bag rules.",
    isPublic: true,
  },
  notifications: {
    category: "admin",
    label: "Notifications",
    description: "Admin alert preferences.",
    isPublic: false,
  },
  features: {
    category: "site",
    label: "Features",
    description: "Public feature toggles.",
    isPublic: true,
  },
  security: {
    category: "admin",
    label: "Security",
    description: "Admin security preferences.",
    isPublic: false,
  },
};

function cloneDefaults(): AppSettings {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as AppSettings;
}

function isSettingsKey(value: string): value is keyof AppSettings {
  return value in DEFAULT_SETTINGS;
}

export async function getAppSettings(): Promise<AppSettings> {
  const rows = await prisma.appSetting.findMany();

  const settings = cloneDefaults();

  for (const row of rows) {
    if (!isSettingsKey(row.key)) continue;

    if (row.key === "general") {
      settings.general = {
        ...settings.general,
        ...(row.value as Partial<GeneralSettings>),
      };
    }

    if (row.key === "contact") {
      settings.contact = {
        ...settings.contact,
        ...(row.value as Partial<ContactSettings>),
      };
    }

    if (row.key === "delivery") {
      settings.delivery = {
        ...settings.delivery,
        ...(row.value as Partial<DeliverySettings>),
        zones: {
          ...settings.delivery.zones,
          ...((row.value as Partial<DeliverySettings>)?.zones ?? {}),
        },
      };
    }

    if (row.key === "notifications") {
      settings.notifications = {
        ...settings.notifications,
        ...(row.value as Partial<NotificationSettings>),
      };
    }

    if (row.key === "features") {
      settings.features = {
        ...settings.features,
        ...(row.value as Partial<FeatureSettings>),
      };
    }

    if (row.key === "security") {
      settings.security = {
        ...settings.security,
        ...(row.value as Partial<SecuritySettings>),
      };
    }
  }

  return settings;
}

export async function getPublicSettings(): Promise<PublicAppSettings> {
  const settings = await getAppSettings();

  return {
    general: settings.general,
    contact: settings.contact,
    delivery: settings.delivery,
    features: settings.features,
  };
}

type SectionMetaInput = {
  label?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
};

export async function upsertAppSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
  meta?: SectionMetaInput,
) {
  const defaults = SECTION_META[key];

  return prisma.appSetting.upsert({
    where: { key },
    update: {
      category: meta?.category ?? defaults.category,
      label: meta?.label ?? defaults.label,
      description: meta?.description ?? defaults.description,
      value: value as never,
      isPublic: meta?.isPublic ?? defaults.isPublic,
    },
    create: {
      key,
      category: meta?.category ?? defaults.category,
      label: meta?.label ?? defaults.label,
      description: meta?.description ?? defaults.description,
      value: value as never,
      isPublic: meta?.isPublic ?? defaults.isPublic,
    },
  });
}

export function nairaToKobo(value: string | number) {
  const raw = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.round(raw * 100));
}

export function koboToNaira(value: number) {
  return Math.round(value / 100);
}

export function defaultSettings() {
  return cloneDefaults();
}