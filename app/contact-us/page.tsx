"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, MapPin, Phone, MessageSquare, Send, Clock } from "lucide-react";
import { useState, type FormEvent } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

const WHATSAPP_NUMBER = "2348000000000"; // replace with real number
const SUPPORT_EMAIL = "support@mercyagric.com";
const ADDRESS = "Ado-Ekiti, Ekiti State, Nigeria";
const PHONE = "+234 800 000 0000"; // replace with real number

const subjects = [
  "Order enquiry",
  "Delivery question",
  "Product availability",
  "Pricing and bulk orders",
  "Payment issue",
  "Other",
];

function emptyForm(): FormState {
  return { name: "", email: "", phone: "", subject: "", message: "" };
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Something went wrong");
      }

      setStatus("success");
      setForm(emptyForm());
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to send message.",
      );
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">

        {/* Header */}
        <div className="border-b border-neutral-100 bg-white px-6 pt-32 md:pt-40 pb-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Get in touch
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
            We are here to help.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Questions about an order, pricing for a bulk purchase, or anything else — send us a message and we will get back to you.
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

            {/* ── Contact form ── */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">

              {status === "success" ? (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <Send className="h-7 w-7 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-neutral-950">
                    Message sent
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-neutral-500">
                    Thank you for reaching out. We will get back to you within one business day.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-8 inline-flex h-10 items-center rounded-full border border-neutral-200 px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Send us a message
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Fill in the form and we will respond within one business day.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          Full name <span className="text-red-500">*</span>
                        </span>
                        <input
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          Email address <span className="text-red-500">*</span>
                        </span>
                        <input
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={inputClass}
                        />
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
                          placeholder="08012345678"
                          className={inputClass}
                        />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          Subject <span className="text-red-500">*</span>
                        </span>
                        <div className="relative">
                          <select
                            name="subject"
                            required
                            value={form.subject}
                            onChange={handleChange}
                            className="h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-10 text-sm outline-none transition focus:border-emerald-300 focus:bg-white"
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                            ▾
                          </span>
                        </div>
                      </label>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-neutral-700">
                        Message <span className="text-red-500">*</span>
                      </span>
                      <textarea
                        name="message"
                        required
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help…"
                        rows={5}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-white"
                      />
                    </label>

                    {status === "error" && errorMsg ? (
                      <p className="text-xs text-red-600">{errorMsg}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {status === "loading" ? "Sending…" : "Send message"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* ── Contact info sidebar ── */}
            <div className="space-y-4">

              {/* WhatsApp — prominent for Nigerian users */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 transition hover:bg-emerald-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600">
                  <MessageSquare className="h-5 w-5 text-white" />
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

              {/* Info cards */}
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
                      <p className="text-xs font-medium text-neutral-500">Email</p>
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
                      <p className="text-xs font-medium text-neutral-500">Phone</p>
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
                      <p className="text-xs font-medium text-neutral-500">Address</p>
                      <p className="text-sm font-medium text-neutral-900">{ADDRESS}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours */}
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
        </div>
      </main>
      <Footer />
    </>
  );
}