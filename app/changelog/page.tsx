import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Tag = "New" | "Improved" | "Fixed" | "Security";

type Entry = {
  tag: Tag;
  text: string;
};

type Release = {
  version: string;
  date: string;
  summary: string;
  entries: Entry[];
};

const tagStyles: Record<Tag, string> = {
  New: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Improved: "bg-blue-50 text-blue-700 border-blue-200",
  Fixed: "bg-amber-50 text-amber-700 border-amber-200",
  Security: "bg-red-50 text-red-700 border-red-200",
};

const releases: Release[] = [
  {
    version: "1.4.0",
    date: "June 2025",
    summary: "Legal pages, redesigned status pages, and audit log dashboard.",
    entries: [
      {
        tag: "New",
        text: "Payment audit log admin page with status filters, search, and pagination.",
      },
      {
        tag: "New",
        text: "Privacy policy, terms & conditions, and license pages.",
      },
      {
        tag: "New",
        text: "Redesigned order success page with receipt-style layout and next-steps list.",
      },
      {
        tag: "New",
        text: "Payment failed page with common failure reasons and recovery paths.",
      },
      {
        tag: "New",
        text: "404 not found page with on-brand agricultural copy.",
      },
      {
        tag: "Fixed",
        text: "Cart not clearing after successful payment on the order success page.",
      },
    ],
  },
  {
    version: "1.3.0",
    date: "May 2025",
    summary:
      "Admin panel redesign — settings tab navigation, profile page overhaul.",
    entries: [
      {
        tag: "New",
        text: "Settings page now shows one section at a time with a sticky tab nav bar.",
      },
      {
        tag: "New",
        text: "Profile page redesigned with initials avatar, account stats, and separate edit views.",
      },
      {
        tag: "Improved",
        text: "All admin checkbox toggles replaced with CSS-only toggle switches.",
      },
      {
        tag: "Improved",
        text: "Delivery settings now show three zone cards side by side for easier comparison.",
      },
      {
        tag: "Fixed",
        text: "Settings changes now persist correctly after save and redirect.",
      },
    ],
  },
  {
    version: "1.2.0",
    date: "April 2025",
    summary: "Security hardening across the payment flow.",
    entries: [
      {
        tag: "Security",
        text: "Fixed race condition between Paystack webhook and callback redirect that could confirm a payment twice.",
      },
      {
        tag: "Security",
        text: "Added rate limiting (5 requests per minute per IP) on the checkout endpoint.",
      },
      {
        tag: "Security",
        text: "Callback page now writes to PaymentAuditLog on both success and failure paths.",
      },
      {
        tag: "Security",
        text: "Callback verification now wrapped in try/catch — network errors produce a clean failure redirect instead of a 500.",
      },
      {
        tag: "New",
        text: "PaymentAuditLog records all payment events with deduplication keys, timestamps, and error messages.",
      },
      {
        tag: "Improved",
        text: "Webhook handler logs an explicit message when an order was already paid on arrival.",
      },
    ],
  },
  {
    version: "1.1.0",
    date: "March 2025",
    summary:
      "Dynamic delivery configuration — admin changes now take effect immediately.",
    entries: [
      {
        tag: "New",
        text: "Delivery fees, minimum bag counts, and origin city/state are now configurable from the admin settings panel.",
      },
      {
        tag: "Improved",
        text: "Checkout API route now reads live delivery rates from the database instead of hardcoded constants.",
      },
      {
        tag: "Improved",
        text: "getDeliveryZone accepts optional origin parameters so zone routing responds to admin-configured origin.",
      },
      {
        tag: "Fixed",
        text: "Changing delivery settings in the admin panel previously had no effect on fee calculations until redeployment.",
      },
      {
        tag: "New",
        text: "Admin settings page with General, Contact, Delivery, Notifications, Features, and Security sections.",
      },
      {
        tag: "New",
        text: "Admin profile page with account details and password change.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "February 2025",
    summary: "Initial platform launch.",
    entries: [
      {
        tag: "New",
        text: "Public shop with product listings, images, and stock status.",
      },
      { tag: "New", text: "Cart with persistent state and quantity controls." },
      {
        tag: "New",
        text: "Checkout flow with full address collection, delivery method selection, and Paystack payment.",
      },
      {
        tag: "New",
        text: "Delivery zone routing across Ado-Ekiti, other Ekiti cities, and outside Ekiti.",
      },
      {
        tag: "New",
        text: "Paystack webhook handler with HMAC signature verification.",
      },
      {
        tag: "New",
        text: "Admin dashboard with order management, product management, and customer records.",
      },
      {
        tag: "New",
        text: "Saved checkout details via localStorage for returning customers.",
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-emerald-950 pb-14 md:pb-28 pt-28 md:pt-36">
          {/* Horizontal field lines */}
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-8 opacity-[0.07]"
            aria-hidden
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-px w-full bg-emerald-400" />
            ))}
          </div>

          {/* Large faint background word */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden
          >
            <span className="select-none text-[24vw] md:text-[22vw] font-black uppercase leading-none tracking-tighter text-emerald-900/20 ">
              RECORD
            </span>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10">
            <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              Changelog
            </h1>

            {/* <p className="mx-auto mt-6 max-w-xl text-[16px] lg:text-[20px] md:text-base  leading-relaxed text-white/55 ">
             Insights, tips, and stories to help your business grow, make
                better decisions, and stay ahead.
            </p> */}
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-6 py-14 lg:flex lg:gap-16">
          {/* Sticky version list */}
          <aside className="hidden shrink-0 lg:block lg:w-44">
            <nav className="sticky top-32">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Versions
              </p>
              <ul className="space-y-1">
                {releases.map((r) => (
                  <li key={r.version}>
                    <a
                      href={`#v${r.version}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
                    >
                      <span className="font-mono font-medium">{r.version}</span>
                      <span className="text-xs text-neutral-400">
                        {r.date.split(" ")[1]}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Timeline */}
          <div className="min-w-0 flex-1">
            <div className="relative space-y-12">
              {/* Vertical line */}
              <div className="absolute left-0 top-2 hidden h-full w-px bg-neutral-100 sm:block" />

              {releases.map((release) => (
                <section
                  key={release.version}
                  id={`v${release.version}`}
                  className="scroll-mt-8 sm:pl-8"
                >
                  {/* Version dot */}
                  <div className="absolute -left-1.5 mt-1.5 hidden h-3 w-3 rounded-full border-2 border-emerald-500 bg-white sm:block" />

                  {/* Version header */}
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-xl font-bold text-neutral-950">
                      v{release.version}
                    </span>
                    <span className="text-sm text-neutral-400">
                      {release.date}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-neutral-500">
                    {release.summary}
                  </p>

                  {/* Entries */}
                  <ul className="mt-5 space-y-3">
                    {release.entries.map((entry, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tagStyles[entry.tag]}`}
                        >
                          {entry.tag}
                        </span>
                        <p className="text-sm leading-6 text-neutral-600">
                          {entry.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
