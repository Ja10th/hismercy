// app/contact/page.tsx
"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ImWhatsapp } from "react-icons/im";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { contactSchema } from "@/lib/contact-schema";

type ContactValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

const SUPPORT_EMAIL = "mercyagriculturalservicesltd@gmail.com";
const WHATSAPP_NUMBER = "2348000000000";
const PHONE = "+234 800 000 0000";
const ADDRESS = "Ado-Ekiti, Ekiti State, Nigeria";

const subjectOptions = [
  "Order enquiry",
  "Delivery question",
  "Product availability",
  "Pricing and bulk orders",
  "Payment issue",
  "Other",
];

function emptyForm(): ContactValues {
  return {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };
}

function zodErrorsToRecord<T extends string>(
  error: z.ZodError,
): Partial<Record<T, string>> {
  const flattened = error.flatten().fieldErrors;
  const output: Partial<Record<T, string>> = {};

  for (const [key, value] of Object.entries(flattened)) {
    if (Array.isArray(value) && value[0]) {
      output[key as T] = value[0];
    }
  }

  return output;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactValues>(emptyForm());
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactValues, string>>
  >({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const inputClass =
    "h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white";

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setMessage("");

    const parsed = contactSchema.safeParse(form);

    if (!parsed.success) {
      setErrors(zodErrorsToRecord<keyof ContactValues>(parsed.error));
      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await res.json()) as
        | { ok: true; message: string }
        | {
            error: string;
            fieldErrors?: Partial<Record<keyof ContactValues, string[]>>;
          };

      if (!res.ok) {
        if ("fieldErrors" in data && data.fieldErrors) {
          const nextErrors: Partial<Record<keyof ContactValues, string>> = {};
          for (const [key, value] of Object.entries(data.fieldErrors)) {
            if (value?.[0]) {
              nextErrors[key as keyof ContactValues] = value[0];
            }
          }
          setErrors(nextErrors);
        }
        throw new Error("error" in data ? data.error : "Something went wrong.");
      }

      const successData = data as { ok: true; message: string };
      setMessage(successData.message);
      setStatus("success");
      setForm(emptyForm());
    } catch (err) {
      setStatus("error");
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Failed to send your message.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        <section className="border-b border-neutral-100 bg-white px-6 pt-32 pb-12 text-center md:pt-40 md:pb-16">
          <h1 className="mt-3 text-[clamp(2.4rem,6vw,5rem)] font-semibold tracking-tight text-neutral-950 ">
            We are here to <span className="text-emerald-600">help</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-500 md:text-lg">
            Questions about an order, pricing for a bulk purchase, or anything
            else? Send us a message and we will get back to you quickly.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:p-8">
              {status === "success" ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-emerald-50 to-white px-6 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="h-8 w-8" strokeWidth={1.7} />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                    Message received
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
                    Thanks for reaching out.
                  </h2>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-neutral-600">
                    {message ||
                      "We will get back to you within one business day."}
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-8 inline-flex h-11 items-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-emerald-800"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                      Send us a message
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                      Fill in the form below and we will respond as soon as
                      possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          Full name <span className="text-red-500">*</span>
                        </span>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Your name"
                          autoComplete="name"
                        />
                        {errors.name ? (
                          <p className="text-xs text-red-600">{errors.name}</p>
                        ) : null}
                      </label>

                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          Email address <span className="text-red-500">*</span>
                        </span>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                        {errors.email ? (
                          <p className="text-xs text-red-600">{errors.email}</p>
                        ) : null}
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          Phone number
                        </span>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="08012345678"
                          autoComplete="tel"
                        />
                        {errors.phone ? (
                          <p className="text-xs text-red-600">{errors.phone}</p>
                        ) : null}
                      </label>

                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          Subject <span className="text-red-500">*</span>
                        </span>
                        <div className="relative">
                          <select
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            className="h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 pr-10 text-sm outline-none transition focus:border-emerald-300 focus:bg-white"
                          >
                            <option value="">Select a subject</option>
                            {subjectOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                            ▾
                          </span>
                        </div>
                        {errors.subject ? (
                          <p className="text-xs text-red-600">
                            {errors.subject}
                          </p>
                        ) : null}
                      </label>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-700">
                        Message <span className="text-red-500">*</span>
                      </span>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
                        placeholder="Tell us how we can help..."
                      />
                      {errors.message ? (
                        <p className="text-xs text-red-600">{errors.message}</p>
                      ) : null}
                    </label>

                    {status === "error" && message ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {message}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {status === "loading" ? "Sending…" : "Send message"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="space-y-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 transition hover:bg-emerald-100"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600">
                  <ImWhatsapp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Chat on WhatsApp
                  </p>
                  <p className="text-xs text-emerald-700">
                    Fastest way to reach us
                  </p>
                </div>
              </a>

              <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Contact details
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                      <Mail className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">
                        Email
                      </p>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-sm font-medium text-neutral-900 hover:text-emerald-700 hover:underline"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                      <Phone className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">
                        Phone
                      </p>
                      <a
                        href={`tel:${PHONE.replace(/\s/g, "")}`}
                        className="text-sm font-medium text-neutral-900 hover:text-emerald-700 hover:underline"
                      >
                        {PHONE}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">
                        Address
                      </p>
                      <p className="text-sm font-medium text-neutral-900">
                        {ADDRESS}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Business hours
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  {[
                    { day: "Monday – Friday", hours: "8:00 am – 5:00 pm" },
                    { day: "Saturday", hours: "9:00 am – 3:00 pm" },
                    { day: "Sunday", hours: "Closed" },
                  ].map(({ day, hours }) => (
                    <div
                      key={day}
                      className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5"
                    >
                      <span className="text-neutral-600">{day}</span>
                      <span
                        className={
                          hours === "Closed"
                            ? "font-medium text-neutral-400"
                            : "font-medium text-neutral-900"
                        }
                      >
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-neutral-400">
                  Response times may vary on public holidays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {hasErrors && status === "error" ? null : null}
      </main>
      <Footer />
    </>
  );
}
