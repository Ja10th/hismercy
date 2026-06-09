import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LAST_UPDATED = "1 June 2026";
const COMPANY = "Mercy Agricultural Servicesultural Services";
const EMAIL = "support@mercyagric.com";

const sections = [
  { id: "ownership", title: "Ownership" },
  { id: "permitted-use", title: "Permitted use" },
  { id: "restrictions", title: "Restrictions" },
  { id: "trademarks", title: "Trademarks" },
  { id: "user-content", title: "Your content" },
  { id: "third-party", title: "Third-party content" },
  { id: "dmca", title: "Copyright complaints" },
  { id: "contact", title: "Contact" },
];

export default function LicensePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen  bg-white">

        <div className="border-b border-neutral-100 bg-neutral-50 px-6 pt-32 md:pt-40 pb-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
            License &amp; Intellectual Property
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-14 lg:flex lg:gap-16">

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

          <article className="min-w-0 flex-1 space-y-12 text-sm leading-7 text-neutral-600">

            <section id="ownership" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Ownership</h2>
              <p>
                This website and all of its contents — including but not limited to text, product descriptions, photographs, graphics, logos, icons, and the design and layout of the site — are the property of {COMPANY} or our licensors and are protected under Nigerian copyright law and applicable international treaties.
              </p>
              <p className="mt-4">
                All rights not expressly granted in these terms are reserved. No content from this website may be reproduced, distributed, modified, or used in any form without our prior written permission, except as expressly permitted below.
              </p>
            </section>

            <section id="permitted-use" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Permitted use</h2>
              <p>
                We grant you a limited, non-exclusive, non-transferable licence to access and use this website for the sole purpose of browsing our product catalogue and placing orders for personal or business use.
              </p>
              <p className="mt-4">You may:</p>
              <ul className="mt-3 space-y-2">
                {[
                  "View and print pages from this site for your personal reference",
                  "Share links to pages on this website",
                  "Quote brief excerpts for the purposes of review or commentary, provided the source is clearly attributed",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section id="restrictions" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Restrictions</h2>
              <p>You may not, without our prior written consent:</p>
              <ul className="mt-3 space-y-2">
                {[
                  "Copy, reproduce, or republish substantial portions of this website's content on any other platform or publication",
                  "Use our product descriptions, images, or written content for commercial purposes outside of linking to us",
                  "Scrape, crawl, or extract data from this website in bulk using automated tools",
                  "Frame or embed this website within another website in a way that misrepresents its origin or our brand",
                  "Imply endorsement or affiliation with Mercy Agricultural Services without our explicit written permission",
                  "Modify, adapt, translate, or create derivative works based on any part of this website's content",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section id="trademarks" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Trademarks</h2>
              <p>
                &ldquo;Mercy Agricultural Services,&rdquo; &ldquo;Mercy Agricultural Servicesultural Services,&rdquo; and associated logos are trademarks of {COMPANY}. You may not use these names or marks in any way that could cause confusion, suggest our endorsement, or misrepresent your relationship with us.
              </p>
              <p className="mt-4">
                Third-party names, logos, and trademarks appearing on this website belong to their respective owners and are used solely for identification purposes.
              </p>
            </section>

            <section id="user-content" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Your content</h2>
              <p>
                If you submit any content to us — such as order notes, feedback, or messages — you grant us a non-exclusive, royalty-free licence to use that content for the purpose of fulfilling your order, improving our service, and communicating with you.
              </p>
              <p className="mt-4">
                We will not publish, share, or attribute your personal communications without your consent.
              </p>
            </section>

            <section id="third-party" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Third-party content</h2>
              <p>
                Our website may contain links to third-party websites or display content from third-party providers (such as payment processors). We do not own or control this third-party content and are not responsible for it. Following an external link means leaving our website and being subject to that site&rsquo;s own terms and policies.
              </p>
              <p className="mt-4">
                Where we use licensed photography, icons, or typefaces, appropriate licences have been obtained for their use on this platform.
              </p>
            </section>

            <section id="dmca" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Copyright complaints</h2>
              <p>
                If you believe that any content on this website infringes your copyright or other intellectual property rights, please contact us in writing with:
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "A description of the copyrighted work you believe has been infringed",
                  "The URL or location on our site where the allegedly infringing content appears",
                  "Your contact information",
                  "A statement that you have a good-faith belief the use is not authorised",
                  "A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorised to act on their behalf",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We will respond to valid notices promptly. Send copyright complaints to{" "}
                <a href={`mailto:${EMAIL}`} className="text-emerald-700 underline underline-offset-2">
                  {EMAIL}
                </a>
                .
              </p>
            </section>

            <section id="contact" className="scroll-mt-8">
              <h2 className="mb-4 text-xl font-semibold text-neutral-950">Contact</h2>
              <p>
                For licensing enquiries or permissions requests, contact:
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