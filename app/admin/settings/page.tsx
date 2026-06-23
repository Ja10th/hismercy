import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAppSettings, koboToNaira } from "@/lib/settings";
import type { ReactNode } from "react";
import {
  BellRing,
  Check,
  Globe2,
  Save,
  ShieldCheck,
  Settings2,
  Sparkles,
  Truck,
  UserRound,
  MapPin,
  Palette,
  Search,
  ShieldAlert,
  Activity,
  Monitor,
  Clock3,
  DollarSign,
  FileText,
  LayoutGrid,
  BadgeInfo,
  Phone,
} from "lucide-react";
import {
  saveContactSettings,
  saveDeliverySettings,
  saveFeatureSettings,
  saveGeneralSettings,
  saveNotificationSettings,
  saveSecuritySettings,
} from "./actions";

type SettingsPageProps = {
  searchParams?: Promise<{ saved?: string; tab?: string }>;
};

type TabId =
  | "general"
  | "contact"
  | "delivery"
  | "notifications"
  | "features"
  | "security";

const TABS = [
  { id: "general", label: "General", Icon: Settings2 },
  { id: "contact", label: "Contact", Icon: UserRound },
  { id: "delivery", label: "Delivery", Icon: Truck },
  { id: "notifications", label: "Alerts", Icon: BellRing },
  { id: "features", label: "Features", Icon: Globe2 },
  { id: "security", label: "Security", Icon: ShieldCheck },
] as const satisfies readonly {
  id: TabId;
  label: string;
  Icon: React.ElementType;
}[];

const SAVE_LABELS: Record<string, string> = {
  general: "General settings saved",
  contact: "Contact details saved",
  delivery: "Delivery rules saved",
  notifications: "Alert preferences saved",
  features: "Feature toggles saved",
  security: "Security settings saved",
};

function Toggle({
  name,
  defaultChecked,
}: {
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="h-full w-full rounded-full border border-neutral-200 bg-neutral-200 transition-colors peer-checked:border-emerald-600 peer-checked:bg-emerald-600" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-[120px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
    />
  );
}

function SaveButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-emerald-800"
    >
      <Save className="h-4 w-4" />
      {label}
    </button>
  );
}

function ToggleRow({
  name,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-950">{title}</p>
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      </div>
      <Toggle name={name} defaultChecked={defaultChecked} />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: ReactNode;
  subtext?: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
        <Icon className="h-4 w-4 text-neutral-500" />
        <span>{label}</span>
      </div>
      <div className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">
        {value}
      </div>
      {subtext ? (
        <p className="mt-1 text-xs leading-5 text-neutral-500">{subtext}</p>
      ) : null}
    </div>
  );
}

function SideNote({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-neutral-950">{title}</p>
      </div>
      <div className="mt-4 text-sm leading-6 text-neutral-600">{children}</div>
    </div>
  );
}

export default async function AdminSettingsPage({
  searchParams,
}: SettingsPageProps) {
  await requireAdmin();

  const settings = await getAppSettings();
  const params = searchParams ? await searchParams : {};
  const saved = params.saved;
  const activeTab: TabId = TABS.some((t) => t.id === params.tab)
    ? (params.tab as TabId)
    : "general";

  const tabHref = (id: TabId) =>
    saved ? `?tab=${id}&saved=${saved}` : `?tab=${id}`;

  return (
    <div className="relative min-h-screen bg-neutral-50">

      <div className="mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-2">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Settings
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Manage your site settings
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && SAVE_LABELS[saved] ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                {SAVE_LABELS[saved]}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
          <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-3">
            <div className="space-y-2 py-3">
              {TABS.map(({ id, label, Icon }) => {
                const isActive = id === activeTab;

                return (
                  <Link
                    key={id}
                    href={tabHref(id)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-neutral-100 text-black"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-black" : "text-neutral-400"
                      }`}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Tip
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-950/80">
                Group related settings together and keep the save action close
                to the inputs.
              </p>
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            {activeTab === "general" ? (
              <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-12">
                  <form action={saveGeneralSettings} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Site name
                        </span>
                        <Input
                          name="siteName"
                          defaultValue={settings.general.siteName}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Logo text
                        </span>
                        <Input
                          name="logoText"
                          defaultValue={settings.general.logoText}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Tagline
                        </span>
                        <Input
                          name="tagline"
                          defaultValue={settings.general.tagline}
                          placeholder="Short brand message"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Footer title
                        </span>
                        <Input
                          name="footerTitle"
                          defaultValue="Trusted farm support"
                          placeholder="Short footer title"
                        />
                      </label>

                      <label className="block space-y-2 md:col-span-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Footer text
                        </span>
                        <Textarea
                          name="footerText"
                          defaultValue={settings.general.footerText}
                          placeholder="Short footer message"
                        />
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <SaveButton label="Save Settings" />
                    </div>
                  </form>
                </section>
              </>
            ) : null}

            {activeTab === "contact" ? (
              <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-12">
                  <form action={saveContactSettings} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Support email
                        </span>
                        <Input
                          name="supportEmail"
                          type="email"
                          defaultValue={settings.contact.supportEmail}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Phone
                        </span>
                        <Input
                          name="phone"
                          defaultValue={settings.contact.phone}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          WhatsApp
                        </span>
                        <Input
                          name="whatsapp"
                          defaultValue={settings.contact.whatsapp}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Support note
                        </span>
                        <Input
                          name="supportNote"
                          defaultValue="We reply during business hours."
                          placeholder="Short support note"
                        />
                      </label>

                      <label className="block space-y-2 md:col-span-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Address
                        </span>
                        <Textarea
                          name="address"
                          defaultValue={settings.contact.address}
                          placeholder="Business address"
                        />
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <SaveButton label="Save Contact " />
                    </div>
                  </form>
                </section>
              </>
            ) : null}

            {activeTab === "delivery" ? (
              <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <form action={saveDeliverySettings} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Origin state
                        </span>
                        <Input
                          name="originState"
                          defaultValue={settings.delivery.originState}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Origin city
                        </span>
                        <Input
                          name="originCity"
                          defaultValue={settings.delivery.originCity}
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="mb-3 text-sm font-semibold text-neutral-950">
                          {settings.delivery.originCity}
                        </p>
                        <div className="space-y-3">
                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Fee per bag (₦)
                            </span>
                            <input
                              name="sameCityFeePerBag"
                              type="number"
                              min={0}
                              defaultValue={koboToNaira(
                                settings.delivery.zones.same_city.feePerBag,
                              )}
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>

                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Minimum bags
                            </span>
                            <input
                              name="sameCityMinBags"
                              type="number"
                              min={0}
                              defaultValue={
                                settings.delivery.zones.same_city.minBags
                              }
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>

                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Recommended max
                            </span>
                            <input
                              name="sameCityRecommendedMaxBags"
                              type="number"
                              min={0}
                              defaultValue={
                                settings.delivery.zones.same_city
                                  .recommendedMaxBags
                              }
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="mb-3 text-sm font-semibold text-neutral-950">
                          Other {settings.delivery.originState} cities
                        </p>
                        <div className="space-y-3">
                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Fee per bag (₦)
                            </span>
                            <input
                              name="sameStateFeePerBag"
                              type="number"
                              min={0}
                              defaultValue={koboToNaira(
                                settings.delivery.zones.same_state.feePerBag,
                              )}
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>

                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Minimum bags
                            </span>
                            <input
                              name="sameStateMinBags"
                              type="number"
                              min={0}
                              defaultValue={
                                settings.delivery.zones.same_state.minBags
                              }
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>

                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Recommended max
                            </span>
                            <input
                              name="sameStateRecommendedMaxBags"
                              type="number"
                              min={0}
                              defaultValue={
                                settings.delivery.zones.same_state
                                  .recommendedMaxBags
                              }
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="mb-3 text-sm font-semibold text-neutral-950">
                          Outside {settings.delivery.originState}
                        </p>

                        <div className="space-y-3">
                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Fee per bag (₦)
                            </span>
                            <input
                              name="outsideStateFeePerBag"
                              type="number"
                              min={0}
                              defaultValue={koboToNaira(
                                settings.delivery.zones.outside_state.feePerBag,
                              )}
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>

                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Minimum bags
                            </span>
                            <input
                              name="outsideStateMinBags"
                              type="number"
                              min={0}
                              defaultValue={
                                settings.delivery.zones.outside_state.minBags
                              }
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>

                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-neutral-600">
                              Recommended max
                            </span>
                            <input
                              name="outsideStateRecommendedMaxBags"
                              type="number"
                              min={0}
                              defaultValue={
                                settings.delivery.zones.outside_state
                                  .recommendedMaxBags
                              }
                              className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <SaveButton label="Save Delivery " />
                    </div>
                  </form>
                </section>
              </>
            ) : null}

            {activeTab === "notifications" ? (
              <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <form action={saveNotificationSettings} className="space-y-3">
                    {[
                      {
                        name: "orderAlerts",
                        title: "Order alerts",
                        description: "New order placed.",
                        checked: settings.notifications.orderAlerts,
                      },
                      {
                        name: "blogAlerts",
                        title: "Blog alerts",
                        description: "Blog post published.",
                        checked: settings.notifications.blogAlerts,
                      },
                      {
                        name: "customerAlerts",
                        title: "Customer alerts",
                        description: "New customer created.",
                        checked: settings.notifications.customerAlerts,
                      },
                      {
                        name: "productAlerts",
                        title: "Product alerts",
                        description: "Product added or updated.",
                        checked: settings.notifications.productAlerts,
                      },
                      {
                        name: "paymentAlerts",
                        title: "Payment alerts",
                        description: "Payment event received.",
                        checked: settings.notifications.paymentAlerts,
                      },
                    ].map((item) => (
                      <ToggleRow
                        key={item.name}
                        name={item.name}
                        title={item.title}
                        description={item.description}
                        defaultChecked={item.checked}
                      />
                    ))}

                    <div className="flex justify-end">
                      <SaveButton label="Save alerts" />
                    </div>
                  </form>
                </section>
              </>
            ) : null}

            {activeTab === "features" ? (
              <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <form action={saveFeatureSettings} className="space-y-3">
                    {[
                      {
                        name: "showAdminSearch",
                        title: "Admin search",
                        description: "Keep the admin search panel enabled.",
                        checked: settings.features.showAdminSearch,
                      },
                      {
                        name: "enablePublicBlog",
                        title: "Public blog",
                        description: "Let visitors read published posts.",
                        checked: settings.features.enablePublicBlog,
                      },
                      {
                        name: "allowGuestCheckout",
                        title: "Guest checkout",
                        description: "Let users checkout without an account.",
                        checked: settings.features.allowGuestCheckout,
                      },
                      {
                        name: "saveCustomerDetails",
                        title: "Save customer details",
                        description: "Remember customer details at checkout.",
                        checked: settings.features.saveCustomerDetails,
                      },
                      {
                        name: "lowStockAlerts",
                        title: "Low stock alerts",
                        description: "Alert admins when stock runs low.",
                        checked: settings.features.lowStockAlerts,
                      },
                    ].map((item) => (
                      <ToggleRow
                        key={item.name}
                        name={item.name}
                        title={item.title}
                        description={item.description}
                        defaultChecked={item.checked}
                      />
                    ))}

                    <div className="flex justify-end">
                      <SaveButton label="Save features" />
                    </div>
                  </form>
                </section>
              </>
            ) : null}

            {activeTab === "security" ? (
              <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <form action={saveSecuritySettings} className="space-y-4">
                    <ToggleRow
                      name="maintenanceMode"
                      title="Maintenance mode"
                      description="Temporarily hide the public site from visitors."
                      defaultChecked={settings.security.maintenanceMode}
                    />

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-neutral-700">
                        Admin session length (days)
                      </span>
                      <p className="text-xs text-neutral-500">
                        How long an admin stays signed in before
                        re-authentication.
                      </p>
                      <input
                        name="adminSessionDays"
                        type="number"
                        min={1}
                        defaultValue={settings.security.adminSessionDays}
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-emerald-300 focus:bg-white"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <ToggleRow
                        name="requireStrongPasswords"
                        title="Strong passwords"
                        description="Apply stricter password rules on admin updates."
                        defaultChecked={
                          settings.security.requireStrongPasswords
                        }
                      />

                      <ToggleRow
                        name="logWebhookEvents"
                        title="Webhook audit logging"
                        description="Record incoming payment events in the audit log."
                        defaultChecked={settings.security.logWebhookEvents}
                      />
                    </div>

                    <div className="flex justify-end">
                      <SaveButton label="Save security settings" />
                    </div>
                  </form>
                </section>
              </>
            ) : null}
          </main>

          <aside className="space-y-4">
            <SideNote icon={Monitor} title="Live preview">
              Keep the page visually consistent with your dashboard cards so the
              whole admin area feels like one system.
            </SideNote>

            <SideNote icon={BadgeInfo} title="Layout tip">
              Use the right rail for helpful context, summaries, and reminders
              so the main form does not feel empty.
            </SideNote>

            <div className="rounded-3xl border border-neutral-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Quick facts
              </p>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Sections</span>
                  <span className="font-medium text-neutral-950">
                    {TABS.length}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Current tab</span>
                  <span className="font-medium text-neutral-950 capitalize">
                    {activeTab}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Status</span>
                  <span className="font-medium text-emerald-700">Editable</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-neutral-950/10 text-[24rem] ">
        mercy
      </div>
    </div>
  );
}
