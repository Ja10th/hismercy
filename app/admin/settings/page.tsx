import { requireAdmin } from "@/lib/admin-auth";
import { getAppSettings, koboToNaira } from "@/lib/settings";
import {
  BellRing,
  Globe2,
  ShieldCheck,
  Settings2,
  Truck,
  UserRound,
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
  searchParams?: Promise<{ saved?: string }>;
};

// ── CSS-only toggle switch ────────────────────────────────────────────────────
// Works in server components — no client JS needed.
function Toggle({
  name,
  defaultChecked,
}: {
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="relative inline-block h-6 w-11 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="block h-full w-full rounded-full border border-neutral-200 bg-neutral-200 transition-colors peer-checked:border-emerald-500 peer-checked:bg-emerald-500" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

// ── Saved badge ───────────────────────────────────────────────────────────────
function SaveBadge({ saved }: { saved?: string }) {
  if (!saved) return null;

  const labels: Record<string, string> = {
    general: "General settings saved",
    contact: "Contact settings saved",
    delivery: "Delivery settings saved",
    notifications: "Notification settings saved",
    features: "Feature settings saved",
    security: "Security settings saved",
  };

  return (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      {labels[saved] ?? "Settings saved"}
    </span>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({
  Icon,
  title,
  description,
  id,
}: {
  Icon: React.ElementType;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div id={id} className="mb-6 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
        <Icon className="h-4 w-4 text-neutral-600" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
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
      className="min-h-[110px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
    />
  );
}

function SaveButton({ label }: { label: string }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-2xl bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        {label}
      </button>
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
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
      <div>
        <p className="text-sm font-medium text-neutral-950">{title}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <Toggle name={name} defaultChecked={defaultChecked} />
    </div>
  );
}

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  await requireAdmin();

  const settings = await getAppSettings();
  const params = searchParams ? await searchParams : {};
  const saved = params.saved;

  const navItems = [
    { id: "general", label: "General", Icon: Settings2 },
    { id: "contact", label: "Contact", Icon: UserRound },
    { id: "delivery", label: "Delivery", Icon: Truck },
    { id: "notifications", label: "Alerts", Icon: BellRing },
    { id: "features", label: "Features", Icon: Globe2 },
    { id: "security", label: "Security", Icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Sticky section nav ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-2">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {navItems.map(({ id, label, Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-2">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
            Settings
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Manage site details, delivery rules, alerts, and feature toggles.
          </p>
          <div className="mt-3">
            <SaveBadge saved={saved} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">

          {/* ── General ─────────────────────────────────────────────────── */}
          <section className="scroll-mt-16 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <SectionHeader
              id="general"
              Icon={Settings2}
              title="General"
              description="Site name, tagline, and footer copy."
            />
            <form action={saveGeneralSettings} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">Site name</span>
                <Input name="siteName" defaultValue={settings.general.siteName} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">Tagline</span>
                <Input name="tagline" defaultValue={settings.general.tagline} placeholder="Short brand message" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">Logo text</span>
                <Input name="logoText" defaultValue={settings.general.logoText} placeholder="Mercy Agricultural Services" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">Footer text</span>
                <Textarea name="footerText" defaultValue={settings.general.footerText} />
              </label>
              <SaveButton label="Save general" />
            </form>
          </section>

          {/* ── Contact ─────────────────────────────────────────────────── */}
          <section className="scroll-mt-16 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <SectionHeader
              id="contact"
              Icon={UserRound}
              title="Contact"
              description="Support email, phone, WhatsApp, and address."
            />
            <form action={saveContactSettings} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">Support email</span>
                <Input name="supportEmail" type="email" defaultValue={settings.contact.supportEmail} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">Phone</span>
                <Input name="phone" defaultValue={settings.contact.phone} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">WhatsApp</span>
                <Input name="whatsapp" defaultValue={settings.contact.whatsapp} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-700">Address</span>
                <Textarea name="address" defaultValue={settings.contact.address} />
              </label>
              <SaveButton label="Save contact" />
            </form>
          </section>

          {/* ── Delivery ─────────────────────────────────────────────────── */}
          <section className="scroll-mt-16 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] xl:col-span-2">
            <SectionHeader
              id="delivery"
              Icon={Truck}
              title="Delivery"
              description="Origin location, pickup toggle, and per-zone fee rules."
            />
            <form action={saveDeliverySettings} className="space-y-5">
              {/* Origin */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-700">Origin state</span>
                  <Input name="originState" defaultValue={settings.delivery.originState} />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-700">Origin city</span>
                  <Input name="originCity" defaultValue={settings.delivery.originCity} />
                </label>
              </div>

              <ToggleRow
                name="pickupEnabled"
                title="Pickup enabled"
                description="Allow customers to choose pickup at your location."
                defaultChecked={settings.delivery.pickupEnabled}
              />

              {/* Zone grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Same city */}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-neutral-950">
                    {settings.delivery.originCity}
                  </p>
                  <div className="space-y-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Fee per bag (₦)</span>
                      <input
                        name="sameCityFeePerBag"
                        type="number"
                        min={0}
                        defaultValue={koboToNaira(settings.delivery.zones.same_city.feePerBag)}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Minimum bags</span>
                      <input
                        name="sameCityMinBags"
                        type="number"
                        min={0}
                        defaultValue={settings.delivery.zones.same_city.minBags}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Recommended max</span>
                      <input
                        name="sameCityRecommendedMaxBags"
                        type="number"
                        min={0}
                        defaultValue={settings.delivery.zones.same_city.recommendedMaxBags}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                  </div>
                </div>

                {/* Same state */}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-neutral-950">
                    Other {settings.delivery.originState} cities
                  </p>
                  <div className="space-y-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Fee per bag (₦)</span>
                      <input
                        name="sameStateFeePerBag"
                        type="number"
                        min={0}
                        defaultValue={koboToNaira(settings.delivery.zones.same_state.feePerBag)}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Minimum bags</span>
                      <input
                        name="sameStateMinBags"
                        type="number"
                        min={0}
                        defaultValue={settings.delivery.zones.same_state.minBags}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Recommended max</span>
                      <input
                        name="sameStateRecommendedMaxBags"
                        type="number"
                        min={0}
                        defaultValue={settings.delivery.zones.same_state.recommendedMaxBags}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                  </div>
                </div>

                {/* Outside state */}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-950">
                      Outside {settings.delivery.originState}
                    </p>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600">
                      <input
                        name="outsideStateQuoteAfterReview"
                        type="checkbox"
                        defaultChecked={settings.delivery.zones.outside_state.quoteAfterReview}
                        className="peer sr-only"
                      />
                      <span className="relative block h-5 w-9 rounded-full border border-neutral-200 bg-neutral-200 transition-colors peer-checked:border-emerald-500 peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
                      Quote on review
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Fee per bag (₦)</span>
                      <input
                        name="outsideStateFeePerBag"
                        type="number"
                        min={0}
                        defaultValue={koboToNaira(settings.delivery.zones.outside_state.feePerBag)}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Minimum bags</span>
                      <input
                        name="outsideStateMinBags"
                        type="number"
                        min={0}
                        defaultValue={settings.delivery.zones.outside_state.minBags}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-600">Recommended max</span>
                      <input
                        name="outsideStateRecommendedMaxBags"
                        type="number"
                        min={0}
                        defaultValue={settings.delivery.zones.outside_state.recommendedMaxBags}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <SaveButton label="Save delivery" />
            </form>
          </section>

          {/* ── Notifications ────────────────────────────────────────────── */}
          <section className="scroll-mt-16 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <SectionHeader
              id="notifications"
              Icon={BellRing}
              title="Notifications"
              description="Choose which events send alerts to admins."
            />
            <form action={saveNotificationSettings} className="space-y-3">
              {[
                { name: "orderAlerts", title: "Order alerts", description: "New order placed.", checked: settings.notifications.orderAlerts },
                { name: "blogAlerts", title: "Blog alerts", description: "Blog post published.", checked: settings.notifications.blogAlerts },
                { name: "customerAlerts", title: "Customer alerts", description: "New customer created.", checked: settings.notifications.customerAlerts },
                { name: "productAlerts", title: "Product alerts", description: "Product added or updated.", checked: settings.notifications.productAlerts },
                { name: "paymentAlerts", title: "Payment alerts", description: "Payment event received.", checked: settings.notifications.paymentAlerts },
              ].map((item) => (
                <ToggleRow key={item.name} {...item} defaultChecked={item.checked} />
              ))}
              <SaveButton label="Save notifications" />
            </form>
          </section>

          {/* ── Features ─────────────────────────────────────────────────── */}
          <section className="scroll-mt-16 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <SectionHeader
              id="features"
              Icon={Globe2}
              title="Features"
              description="Enable or disable site features without deploying."
            />
            <form action={saveFeatureSettings} className="space-y-3">
              {[
                { name: "showAdminSearch", title: "Admin search", description: "Keep the admin search panel enabled.", checked: settings.features.showAdminSearch },
                { name: "enablePublicBlog", title: "Public blog", description: "Let visitors read published posts.", checked: settings.features.enablePublicBlog },
                { name: "allowGuestCheckout", title: "Guest checkout", description: "Let users checkout without an account.", checked: settings.features.allowGuestCheckout },
                { name: "saveCustomerDetails", title: "Save customer details", description: "Remember customer details at checkout.", checked: settings.features.saveCustomerDetails },
                { name: "lowStockAlerts", title: "Low stock alerts", description: "Alert admins when stock runs low.", checked: settings.features.lowStockAlerts },
              ].map((item) => (
                <ToggleRow key={item.name} {...item} defaultChecked={item.checked} />
              ))}
              <SaveButton label="Save features" />
            </form>
          </section>

          {/* ── Security ─────────────────────────────────────────────────── */}
          <section className="scroll-mt-16 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <SectionHeader
              id="security"
              Icon={ShieldCheck}
              title="Security"
              description="Access control, session rules, and audit logging."
            />
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
                  How long an admin stays signed in before re-authentication.
                </p>
                <input
                  name="adminSessionDays"
                  type="number"
                  min={1}
                  defaultValue={settings.security.adminSessionDays}
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-emerald-300 focus:bg-white"
                />
              </label>

              <ToggleRow
                name="requireStrongPasswords"
                title="Strong passwords"
                description="Apply stricter password rules on admin account updates."
                defaultChecked={settings.security.requireStrongPasswords}
              />

              <ToggleRow
                name="logWebhookEvents"
                title="Webhook audit logging"
                description="Record every incoming payment event in the audit log."
                defaultChecked={settings.security.logWebhookEvents}
              />

              <SaveButton label="Save security" />
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}