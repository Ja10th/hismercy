import Link from "next/link";
import Image from "next/image";
import { footerLinks, assets } from "@/data/content";

const socials = [
  { href: "https://web.facebook.com/", icon: assets.socialFacebook, label: "Facebook" },
  { href: "https://www.linkedin.com/", icon: assets.socialLinkedin, label: "LinkedIn" },
  { href: "https://x.com/", icon: assets.socialTwitter, label: "Twitter / X" },
  { href: "https://www.youtube.com/", icon: assets.socialYoutube, label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-white/75">
      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16  pb-16">
          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading} className="flex flex-col gap-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
                  {heading}
                </div>
                <div className="flex flex-col gap-2.5">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="footer-link-line text-[15px] text-white/70 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right block */}
          <div className="flex flex-col gap-8 lg:items-start">
            {/* Contact button */}
            <Link
              href="/contact-us"
              className="flex items-center gap-2.5 bg-accent text-neutral-900 px-7 py-3.5 rounded-full font-bold text-[14px] tracking-wide hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Image src={assets.footerButtonIcon} alt="" width={18} height={18} />
              CONTACT US
            </Link>

            {/* Social media */}
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
                Social Media
              </div>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center opacity-60 hover:opacity-100 hover:border-white/40 hover:bg-white/08 transition-all duration-200"
                  >
                    <Image
                      src={s.icon}
                      alt={s.label}
                      width={18}
                      height={18}
                      className="brightness-0 invert"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
                Address
              </div>
              <p className="text-[14px] text-white/50 leading-[1.7] max-w-[220px]">
                Ado-Ekiti, Ekiti State, Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="overflow-hidden border-t border-b border-white/[0.06] py-8">
        <div className="flex animate-marquee-slow whitespace-nowrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="font-serif text-[3rem] md:text-[4rem] text-white/15 pr-12 flex-shrink-0"
            >
              <span className="text-white/50">Mercy</span> Agric Services
            </span>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1280px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between gap-5 flex-wrap">
          <p className="text-[13px] text-white/40">
            Designed by{" "}
            <Link
              href="https://webflow.com/templates/designers/infiniflow"
              target="_blank"
              className="text-accent hover:opacity-80 transition-opacity"
            >
              Melhorar Studio
            </Link>{" "}
            —{" "}
            <Link href="/license" className="text-accent hover:opacity-80 transition-opacity">
              License
            </Link>
          </p>

          <Link
            href="mailto:hello@mercyagric.com"
            className="text-[14px] font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            hello@mercyagric.com
          </Link>

          <div className="flex gap-5">
            <Link
              href="/terms-and-condition"
              className="text-[13px] text-white/40 hover:text-white/75 transition-colors duration-200"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy-policy"
              className="text-[13px] text-white/40 hover:text-white/75 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}