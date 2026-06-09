import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LAST_UPDATED = "1 June 2025";
const COMPANY = "Mercy Agricultural Servicesultural Services";
const EMAIL = "support@mercyagric.com";
const ADDRESS = "Ado-Ekiti, Ekiti State, Nigeria";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "data-we-collect", title: "Data we collect" },
  { id: "how-we-use-it", title: "How we use it" },
  { id: "payments", title: "Payment processing" },
  { id: "sharing", title: "Sharing your data" },
  { id: "retention", title: "Data retention" },
  { id: "your-rights", title: "Your rights" },
  { id: "cookies", title: "Cookies" },
  { id: "contact", title: "Contact us" },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* Hero header */}
        <div className="border-b border-neutral-100 bg-neutral-50 px-6 pt-32 md:pt-40 pb-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-14 lg:flex lg:gap-16">

          {/* Sticky TOC */}
          <aside className="hidden shrink-0 lg:block lg:w-52">
            <nav className="sticky top-32">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Contents
              </p>
              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <article className="min-w-0 flex-1 space-y-12 text-sm leading-7 text-neutral-600">

            <section id="introduction" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Introduction</h2>
              <p>
                {COMPANY} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the Mercy Agricultural Services website and e-commerce platform. This Privacy Policy explains how we collect, use, and protect information about you when you visit our website or place an order with us.
              </p>
              <p className="mt-4">
                By using our platform, you agree to the collection and use of information in accordance with this policy. We take your privacy seriously and handle all personal data with care and in accordance with applicable Nigerian data protection law, including the Nigeria Data Protection Act 2023 (NDPA).
              </p>
            </section>

            <section id="data-we-collect" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Data we collect</h2>
              <p>
                We collect the minimum information necessary to process and fulfil your order. This includes:
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    title: "Identity and contact details",
                    detail: "Your full name, email address, and phone number, provided when you place an order.",
                  },
                  {
                    title: "Delivery address",
                    detail: "Your street address, city, state, and nearest landmark, used to calculate delivery costs and arrange dispatch.",
                  },
                  {
                    title: "Order information",
                    detail: "The products you purchase, quantities, and any special notes you provide with your order.",
                  },
                  {
                    title: "Payment reference",
                    detail: "A transaction reference number from Paystack. We do not store your card number, bank account, or any payment credentials on our systems.",
                  },
                  {
                    title: "Technical data",
                    detail: "IP address and browser information collected automatically when you visit our website, used for security and to prevent abuse.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                    <p className="font-semibold text-neutral-900">{item.title}</p>
                    <p className="mt-1 text-neutral-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="how-we-use-it" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">How we use it</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Processing and fulfilling your orders",
                  "Contacting you to confirm delivery details or resolve issues with your order",
                  "Calculating accurate delivery fees based on your location",
                  "Maintaining a record of your past orders for customer service purposes",
                  "Preventing fraud and protecting the security of our platform",
                  "Complying with legal obligations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We do not use your data for advertising, we do not sell your data to third parties, and we do not use it for any purpose unrelated to your orders and the operation of our business.
              </p>
            </section>

            <section id="payments" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Payment processing</h2>
              <p>
                All payments are processed by Paystack, a licensed payment service provider. When you pay, you are redirected to Paystack&rsquo;s secure payment page. Mercy Agricultural Services never sees or stores your card number, PIN, or banking credentials.
              </p>
              <p className="mt-4">
                Paystack&rsquo;s handling of your payment data is governed by their own Privacy Policy, available at{" "}
                <a
                  href="https://paystack.com/privacy"
                  className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  paystack.com/privacy
                </a>
                .
              </p>
              <p className="mt-4">
                We retain the Paystack transaction reference (a unique code, not your payment details) to reconcile payments against orders and to assist you if a dispute arises.
              </p>
            </section>

            <section id="sharing" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Sharing your data</h2>
              <p>
                We do not sell, rent, or trade your personal information. We may share limited data with:
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span><strong className="text-neutral-900">Delivery partners</strong> — your name, address, and phone number may be shared with a logistics company to complete your delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span><strong className="text-neutral-900">Legal authorities</strong> — when required by Nigerian law or a valid court order.</span>
                </li>
              </ul>
              <p className="mt-4">
                We require any third party receiving your data to protect it to the same standard we do and to use it only for the stated purpose.
              </p>
            </section>

            <section id="retention" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Data retention</h2>
              <p>
                We retain your order records for a minimum of five years to comply with Nigerian commercial and tax record-keeping requirements. After this period, records are reviewed and securely deleted.
              </p>
              <p className="mt-4">
                If you request deletion of your account and data (see &ldquo;Your rights&rdquo; below), we will delete your personal data within 30 days, except where we are legally required to retain certain records.
              </p>
            </section>

            <section id="your-rights" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Your rights</h2>
              <p>
                Under the Nigeria Data Protection Act 2023, you have the right to:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Access the personal data we hold about you",
                  "Correct inaccurate or incomplete data",
                  "Request deletion of your data, subject to our legal retention obligations",
                  "Withdraw consent where processing is based on consent",
                  "Complain to the Nigeria Data Protection Commission (NDPC) if you believe your rights have been violated",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                To exercise any of these rights, contact us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800">
                  {EMAIL}
                </a>
                .
              </p>
            </section>

            <section id="cookies" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Cookies</h2>
              <p>
                Our website uses a small number of cookies that are strictly necessary for it to function. This includes a session cookie that keeps your cart active while you shop and a preference cookie that saves your checkout details if you opt in.
              </p>
              <p className="mt-4">
                We do not use advertising cookies, tracking cookies, or any third-party analytics that profile your browsing behaviour.
              </p>
            </section>

            <section id="contact" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Contact us</h2>
              <p>
                If you have questions about this policy or want to exercise your data rights, contact us:
              </p>
              <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 space-y-1">
                <p className="font-medium text-neutral-900">{COMPANY}</p>
                <p className="text-neutral-600">{ADDRESS}</p>
                <a href={`mailto:${EMAIL}`} className="block text-emerald-700 hover:underline">
                  {EMAIL}
                </a>
              </div>
              <p className="mt-4 text-xs text-neutral-400">
                We aim to respond to all privacy requests within 14 working days.
              </p>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}