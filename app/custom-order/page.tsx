"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  User,
  Weight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  productType: string;
  quantity: string;
  deliveryLocation: string;
  message: string;
};

type FieldName = keyof FormState;

type ErrorState = Partial<Record<FieldName, string>> & { form?: string };

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  productType: "",
  quantity: "",
  deliveryLocation: "",
  message: "",
};

const PRODUCT_OPTIONS = [
  "Maize",
  "Soya Beans",
  "Wheat Offal",
  "Poultry Feed",
  "Cattle Feed",
  "Fish Feed",
  "Branded Feed (custom brand)",
  "Mixed / Multiple items",
  "Other",
];

// ─── Field helpers ────────────────────────────────────────────────────────────

function validate(form: FormState): ErrorState {
  const errors: ErrorState = {};

  if (!form.fullName.trim() || form.fullName.trim().length < 2)
    errors.fullName = "Please enter your full name.";

  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Please enter a valid email address.";

  if (!form.phone.trim() || form.phone.trim().length < 7)
    errors.phone = "Please enter a valid phone number.";

  if (!form.productType.trim())
    errors.productType = "Please select or describe the product type.";

  if (!form.quantity.trim())
    errors.quantity = "Please specify the quantity or volume you need.";

  if (!form.deliveryLocation.trim())
    errors.deliveryLocation = "Please provide your delivery location.";

  return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomOrderPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ErrorState>({});
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    fullName: false,
    email: false,
    phone: false,
    productType: false,
    quantity: false,
    deliveryLocation: false,
    message: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [useCustomProduct, setUseCustomProduct] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);

    // Live-validate touched fields only
    if (touched[name as FieldName]) {
      const nextErrors = validate(next);
      setErrors((current) => ({ ...current, [name]: nextErrors[name as FieldName] }));
    }
  };

  const handleBlur = (name: FieldName) => {
    setTouched((current) => ({ ...current, [name]: true }));
    const nextErrors = validate(form);
    setErrors((current) => ({ ...current, [name]: nextErrors[name] }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    // Mark all touched + validate
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      productType: true,
      quantity: true,
      deliveryLocation: true,
      message: true,
    });

    const allErrors = validate(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setErrors({ form: data.error ?? "Something went wrong. Please try again." });
        return;
      }

      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: FieldName) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  // ─── Success screen ───────────────────────────────────────────────────────

  if (success) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 pb-20 pt-28">
          <div className="w-full max-w-md rounded-[28px] border border-neutral-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-neutral-950">
              Request sent!
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-neutral-500">
              We&apos;ve received your custom order request and will get back to
              you shortly via email or phone.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/shop"
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Browse the shop
              </Link>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="inline-flex w-full items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Submit another request
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-emerald-950 pb-14 pt-28 md:pb-24 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
          aria-hidden
        >
          {[0, 1].map((i) => (
            <div key={i} className="h-px w-full bg-emerald-400" />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span className="select-none text-[20vw] font-black uppercase leading-none tracking-tighter text-emerald-900/20">
            CUSTOM
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
       
          <h1 className="mt-5 text-[clamp(2.2rem,5.5vw,4.2rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            Order exactly what you need
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/65">
            Can&apos;t find the exact product, volume, or mix you&apos;re
            looking for? Fill in the form below and we&apos;ll reach out with a
            tailored quote.
          </p>
        </div>
      </section>

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px]">

            {/* ── Form ── */}
            <div>
              <Link
                href="/shop"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to shop
              </Link>

              <h2 className="text-2xl font-semibold text-neutral-950">
                Tell us about your order
              </h2>
              <p className="mt-2 text-[15px] text-neutral-500">
                All fields marked with <span className="text-red-500">*</span> are required.
              </p>

              {errors.form ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errors.form}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">

                {/* Full name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="cf-fullName"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <User className="h-4 w-4 text-neutral-400" />
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cf-fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("fullName")}
                    autoComplete="name"
                    placeholder="Your full name"
                    aria-invalid={Boolean(showError("fullName"))}
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 ${
                      showError("fullName")
                        ? "border-red-300 bg-red-50/40"
                        : "border-neutral-200"
                    }`}
                  />
                  {showError("fullName") ? (
                    <p className="text-xs text-red-600">{showError("fullName")}</p>
                  ) : null}
                </div>

                {/* Email + Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="cf-email"
                      className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                    >
                      <Mail className="h-4 w-4 text-neutral-400" />
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cf-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(showError("email"))}
                      className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 ${
                        showError("email")
                          ? "border-red-300 bg-red-50/40"
                          : "border-neutral-200"
                      }`}
                    />
                    {showError("email") ? (
                      <p className="text-xs text-red-600">{showError("email")}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="cf-phone"
                      className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                    >
                      <Phone className="h-4 w-4 text-neutral-400" />
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cf-phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur("phone")}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="08012345678"
                      aria-invalid={Boolean(showError("phone"))}
                      className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 ${
                        showError("phone")
                          ? "border-red-300 bg-red-50/40"
                          : "border-neutral-200"
                      }`}
                    />
                    {showError("phone") ? (
                      <p className="text-xs text-red-600">{showError("phone")}</p>
                    ) : null}
                  </div>
                </div>

                {/* Product type */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="cf-productType"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <Package className="h-4 w-4 text-neutral-400" />
                    Product / feed type <span className="text-red-500">*</span>
                  </label>

                  {!useCustomProduct ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          id="cf-productType"
                          name="productType"
                          value={form.productType}
                          onChange={handleChange}
                          onBlur={() => handleBlur("productType")}
                          aria-invalid={Boolean(showError("productType"))}
                          className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 ${
                            showError("productType")
                              ? "border-red-300 bg-red-50/40"
                              : "border-neutral-200"
                          } ${!form.productType ? "text-neutral-400" : "text-neutral-900"}`}
                        >
                          <option value="">Select product type…</option>
                          {PRODUCT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomProduct(true);
                          setForm((f) => ({ ...f, productType: "" }));
                        }}
                        className="shrink-0 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        Custom…
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        id="cf-productType"
                        name="productType"
                        value={form.productType}
                        onChange={handleChange}
                        onBlur={() => handleBlur("productType")}
                        placeholder="Describe the product or feed type"
                        aria-invalid={Boolean(showError("productType"))}
                        className={`h-12 flex-1 rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 ${
                          showError("productType")
                            ? "border-red-300 bg-red-50/40"
                            : "border-neutral-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomProduct(false);
                          setForm((f) => ({ ...f, productType: "" }));
                        }}
                        className="shrink-0 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-500 transition hover:bg-neutral-50"
                      >
                        Pick from list
                      </button>
                    </div>
                  )}
                  {showError("productType") ? (
                    <p className="text-xs text-red-600">{showError("productType")}</p>
                  ) : null}
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="cf-quantity"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <Weight className="h-4 w-4 text-neutral-400" />
                    Quantity / volume <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cf-quantity"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    onBlur={() => handleBlur("quantity")}
                    placeholder="e.g. 50 bags, 2 tonnes, 500 kg"
                    aria-invalid={Boolean(showError("quantity"))}
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 ${
                      showError("quantity")
                        ? "border-red-300 bg-red-50/40"
                        : "border-neutral-200"
                    }`}
                  />
                  {showError("quantity") ? (
                    <p className="text-xs text-red-600">{showError("quantity")}</p>
                  ) : null}
                </div>

                {/* Delivery location */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="cf-deliveryLocation"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    Delivery location <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cf-deliveryLocation"
                    name="deliveryLocation"
                    value={form.deliveryLocation}
                    onChange={handleChange}
                    onBlur={() => handleBlur("deliveryLocation")}
                    placeholder="City, State — or full address"
                    aria-invalid={Boolean(showError("deliveryLocation"))}
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 ${
                      showError("deliveryLocation")
                        ? "border-red-300 bg-red-50/40"
                        : "border-neutral-200"
                    }`}
                  />
                  {showError("deliveryLocation") ? (
                    <p className="text-xs text-red-600">
                      {showError("deliveryLocation")}
                    </p>
                  ) : null}
                </div>

                {/* Additional notes */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="cf-message"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <MessageSquare className="h-4 w-4 text-neutral-400" />
                    Additional notes
                    <span className="text-xs font-normal text-neutral-400">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur("message")}
                    rows={4}
                    placeholder="Any special requirements, preferred brands, packaging, delivery timeline…"
                    className="min-h-[110px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-8 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeOpacity="0.25"
                        />
                        <path
                          d="M22 12a10 10 0 0 0-10-10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Sending request…
                    </>
                  ) : (
                    "Send custom order request"
                  )}
                </button>
              </form>
            </div>

            {/* ── Info sidebar ── */}
            <div className="space-y-5 lg:pt-14">
              {[
                {
                  icon: Package,
                  title: "Flexible volumes",
                  body: "Whether you need a few bags or several tonnes, we handle orders of all sizes. Just let us know what you need.",
                },
                {
                  icon: MessageSquare,
                  title: "Quick follow-up",
                  body: "Our team reviews every custom request and responds within 1 business day with availability and pricing.",
                },
                {
                  icon: MapPin,
                  title: "Nationwide delivery",
                  body: "We deliver across Nigeria. Delivery fees and timelines will be discussed when we follow up on your request.",
                },
                {
                  icon: Phone,
                  title: "Prefer a call?",
                  body: "You can also reach us directly via WhatsApp or phone. Fill the form and we'll call you back, or contact us from the Contact page.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-[20px] border border-neutral-100 bg-neutral-50 p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">{body}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-[20px] border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
                <p className="font-semibold">Already know what you want?</p>
                <p className="mt-1 text-emerald-700">
                  Browse our{" "}
                  <Link
                    href="/shop"
                    className="font-semibold underline underline-offset-2 hover:text-emerald-900"
                  >
                    regular shop
                  </Link>{" "}
                  for standard products you can add to cart and checkout
                  instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
