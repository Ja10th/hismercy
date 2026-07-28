import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LAST_UPDATED = "1 June 2025";
const COMPANY = "Mercy Agricultural Services";
const EMAIL = "mercyagriculturalservicesltd@gmail.com";

const sections = [
  { id: "acceptance", title: "Acceptance of terms" },
  { id: "products", title: "Products and availability" },
  { id: "ordering", title: "Placing an order" },
  { id: "pricing", title: "Pricing and payment" },
  { id: "delivery", title: "Delivery" },
  { id: "cancellations", title: "Cancellations and returns" },
  { id: "liability", title: "Limitation of liability" },
  { id: "conduct", title: "Acceptable use" },
  { id: "changes", title: "Changes to these terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        <div className="border-b border-neutral-100 bg-neutral-50 px-6 pt-32 md:pt-40 pb-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-14 lg:flex lg:gap-16">

          <aside className="hidden shrink-0 lg:block lg:w-52">
            <nav className="sticky top-32   ">
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

          <article className="min-w-0 flex-1 space-y-12 text-sm leading-7 text-neutral-600">

            <section id="acceptance" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Acceptance of terms</h2>
              <p>
                By accessing the Mercy Agricultural Services website or placing an order, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use our platform.
              </p>
              <p className="mt-4">
                These terms apply to all visitors, customers, and users of our website. We reserve the right to update them at any time, and continued use of our platform after changes are published constitutes acceptance of the updated terms.
              </p>
            </section>

            <section id="products" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Products and availability</h2>
              <p>
                All products listed on our website are subject to availability. We make every effort to keep stock information accurate, but availability can change. If an item you order is no longer available after you have paid, we will contact you immediately and arrange a full refund.
              </p>
              <p className="mt-4">
                Product images are for illustration purposes. Actual bags and packaging may vary slightly from images shown on the website.
              </p>
              <p className="mt-4">
                All prices are displayed in Nigerian Naira (₦) and are inclusive of applicable taxes.
              </p>
            </section>

            <section id="ordering" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Placing an order</h2>
              <p>
                When you place an order through our website, you are making an offer to purchase the selected products at the listed price. Your order is not confirmed until payment is successfully processed and you receive a confirmation.
              </p>
              <p className="mt-4">
                We reserve the right to refuse or cancel any order at our discretion, including if we suspect fraudulent activity, if a pricing error has occurred, or if the order cannot be fulfilled for any operational reason. In any such case, any payment made will be refunded in full.
              </p>
              <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="font-semibold text-neutral-900">Minimum order quantities</p>
                <p className="mt-1">
                  Delivery orders are subject to minimum bag quantities depending on your location. These minimums are shown during checkout before you complete your order. Pickup orders have no minimum requirement.
                </p>
              </div>
            </section>

            <section id="pricing" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Pricing and payment</h2>
              <p>
                Product prices are as stated at the time of checkout. Delivery fees are calculated based on your delivery address and the quantity of bags ordered, and are shown clearly before you confirm your order.
              </p>
              <p className="mt-4">
                Payment is processed securely through Paystack. We accept card payments and bank transfers through the Paystack gateway. Your payment is only charged when you complete the payment step — no funds are held or pre-authorised before that point.
              </p>
              <p className="mt-4">
                If a payment fails, no charge is made to your account. You can retry your order from the checkout page. If you believe a charge was made but your order was not confirmed, contact us immediately at{" "}
                <a href={`mailto:${EMAIL}`} className="text-emerald-700 underline underline-offset-2">
                  {EMAIL}
                </a>
                .
              </p>
            </section>

            <section id="delivery" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Delivery</h2>
              <p>
                We deliver to addresses across Nigeria. Delivery fees vary by location and are calculated per bag ordered:
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { zone: "Ado-Ekiti (same city)", detail: "Standard per-bag rate, minimum order applies" },
                  { zone: "Other cities in Ekiti State", detail: "Standard per-bag rate, higher minimum order applies" },
                  { zone: "Outside Ekiti State", detail: "Per-bag rate applies, quote may be reviewed for large orders" },
                  { zone: "Pickup", detail: "No delivery fee. Collect from our location in Ado-Ekiti" },
                ].map((z) => (
                  <div key={z.zone} className="flex gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-semibold text-neutral-900">{z.zone}</p>
                      <p className="mt-0.5 text-neutral-600">{z.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                Delivery timelines are estimates and may be affected by location, road conditions, or operational factors. We will contact you to confirm a delivery schedule after your order is placed. We are not liable for delays outside our reasonable control.
              </p>
            </section>

            <section id="cancellations" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Cancellations and returns</h2>
              <p>
                You may cancel your order before it is dispatched by contacting us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-emerald-700 underline underline-offset-2">
                  {EMAIL}
                </a>
                . If the order has already been dispatched, cancellation may not be possible.
              </p>
              <p className="mt-4">
                Due to the perishable and agricultural nature of our products, we do not accept returns of goods that have been dispatched and delivered in good condition. If your order arrives damaged or materially different from what was described, contact us within 48 hours of delivery with photographs of the issue. We will assess each case individually and arrange a replacement or refund where appropriate.
              </p>
              <p className="mt-4">
                Refunds are processed back through the original payment method within 7–14 working days.
              </p>
            </section>

            <section id="liability" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Limitation of liability</h2>
              <p>
                {COMPANY} makes no warranties beyond those expressly stated on the product listing. To the fullest extent permitted by Nigerian law, we exclude liability for any indirect, incidental, or consequential losses arising from your use of our website or the products you purchase.
              </p>
              <p className="mt-4">
                Our total liability to you in connection with any order will not exceed the total amount you paid for that order.
              </p>
              <p className="mt-4">
                Nothing in these terms limits our liability for death or personal injury caused by our negligence, or for fraud or fraudulent misrepresentation.
              </p>
            </section>

            <section id="conduct" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Acceptable use</h2>
              <p>
                You agree not to use this website to place fraudulent or fictitious orders, attempt to access systems or data beyond what is needed to browse and purchase, disrupt or interfere with the website's operation, or misuse any information obtained from the platform.
              </p>
              <p className="mt-4">
                We reserve the right to block access to any user we believe is misusing the platform, without prior notice.
              </p>
            </section>

            <section id="changes" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Changes to these terms</h2>
              <p>
                We may revise these terms at any time. The &ldquo;Last updated&rdquo; date at the top of this page indicates when they were last changed. We encourage you to review this page periodically. Orders placed before a change are governed by the terms in effect at the time of the order.
              </p>
            </section>

            <section id="contact" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Contact</h2>
              <p>
                Questions about these terms? Reach us at:
              </p>
              <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 space-y-1">
                <p className="font-medium text-neutral-900">{COMPANY}</p>
                <p className="text-neutral-600">Ado-Ekiti, Ekiti State, Nigeria</p>
                <a href={`mailto:${EMAIL}`} className="block text-emerald-700 hover:underline">
                  {EMAIL}
                </a>
              </div>
            </section>

          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}