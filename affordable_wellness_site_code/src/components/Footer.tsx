import affordableWellnessLogo from "@/assets/affordable-wellness-logo.png";
import hipaaBadge from "@/assets/hipaa-compliant-badge.png";
import legitScript from "@/assets/icon/legitscript.png";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/contactInfo";
import { Link } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";

const CONTACT_EMAIL = "support@affordablewellness.com";

type FooterLink =
  | { label: string; type: "home-section"; hash: string; search?: string }
  | { label: string; type: "route"; to: string }
  | { label: string; type: "external"; href: string }
  | { label: string; type: "mailto"; href: string };

const footerColumns: Record<string, FooterLink[]> = {
  Treatment: [
    {
      label: "Compounded Semaglutide",
      type: "home-section",
      hash: "pricing",
      search: "?med=semaglutide",
    },
    {
      label: "Compounded Tirzepatide",
      type: "home-section",
      hash: "pricing",
      search: "?med=tirzepatide",
    },
    { label: "Pricing", type: "home-section", hash: "pricing" },
    { label: "What's Included", type: "home-section", hash: "pricing" },
    { label: "How It Works", type: "home-section", hash: "how-it-works" },
  ],
  Company: [
    { label: "About Us", type: "home-section", hash: "faq" },
    { label: "Why We Cost Less", type: "home-section", hash: "why-affordable" },
    { label: "Shipping Information", type: "home-section", hash: "how-it-works" },
    { label: "HIPAA Notice", type: "route", to: "/hipaa" },
  ],
  Support: [
    { label: "FAQ", type: "home-section", hash: "faq" },
    { label: "Contact Us", type: "mailto", href: `mailto:${CONTACT_EMAIL}` },
    {
      label: "Patient Portal",
      type: "external",
      href: "https://member.affordablewellness.com/",
    },
  ],
};

const DISCLAIMER =
  "Affordable Wellness.com provides access to compounded medications through licensed prescribing doctors and 503A compounding pharmacies. Compounded medications are not FDA-approved finished drug products. Individual treatment eligibility is determined by a licensed prescribing doctor following a medical review. Results vary. Affordable Wellness does not guarantee treatment approval, specific outcomes, or weight loss results. This site does not provide medical advice — consult your healthcare provider for personal medical decisions.";

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className =
    "text-sm text-white/60 hover:text-white transition-colors";

  if (link.type === "home-section") {
    return (
      <Link
        to={{
          pathname: "/",
          hash: link.hash,
          search: link.search,
        }}
        className={className}
      >
        {link.label}
      </Link>
    );
  }

  if (link.type === "route") {
    return (
      <Link to={link.to} className={className}>
        {link.label}
      </Link>
    );
  }

  if (link.type === "mailto") {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {link.label}
    </a>
  );
}

const Footer = () => {
  return (
    <footer className="bg-[#243247] text-white">
      <PageContainer
        variant="hero"
        className="flex flex-col items-start gap-16 lg:gap-[120px] max-lg:gap-12 p-10 lg:p-20 max-lg:p-6 min-h-0 lg:min-h-[830px]"
      >
        {/* Top row — logo + badges */}
        <div className="w-full flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 max-lg:gap-8">
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex w-fit">
              <img
                src={affordableWellnessLogo}
                alt="Affordable Wellness"
                className="h-10 w-auto max-w-[140px] object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-base max-lg:text-sm leading-[1.5] text-white/70">
              Your health is priceless. Your treatment shouldn&apos;t be.
            </p>
          </div>

          {/* Badges — Figma 124×56 container feel, gap 16px */}
          <div className="flex items-center gap-4 h-14 shrink-0">
            <img
              src={hipaaBadge}
              alt="HIPAA Compliant"
              className="h-14 w-14 rounded-full object-cover shrink-0"
            />
            <a
              href="https://www.legitscript.com/websites/?checker_keywords=affordablewellness.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img
                src={legitScript}
                alt="LegitScript Certified"
                className="h-14 w-14 object-contain"
              />
            </a>
          </div>
        </div>

        {/* Navigation columns */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold text-white mb-5">Connect</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <span className="block text-white/50 mb-0.5">Email</span>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-white hover:text-white/80 transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <span className="block text-white/50 mb-0.5">Phone</span>
                <a
                  href={`tel:${SITE_PHONE_TEL}`}
                  className="font-semibold text-white hover:text-white/80 transition-colors"
                >
                  {SITE_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <span className="block text-white/50 mb-0.5">Hours</span>
                <span className="text-white/70">Mon–Fri, 9am–6pm EST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal — two dashed borders */}
        <div className="w-full flex flex-col border-t border-dashed border-white/25 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-dashed border-white/25">
            <p className="text-sm text-white/50">
              © 2026 Affordable Wellness. All Rights Reserved.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <Link
                to="/privacypolicy"
                className="hover:text-white transition-colors"
              >
                Privacy policy
              </Link>
              <Link
                to="/termsofservice"
                className="hover:text-white transition-colors"
              >
                Terms of use
              </Link>
              <Link
                to="/telehealth-consent"
                className="hover:text-white transition-colors"
              >
                Telehealth Consent
              </Link>
            </div>
          </div>

          <p className="text-xs leading-[1.6] text-white/40 pt-8 max-w-[1280px]">
            {DISCLAIMER}
          </p>
        </div>
      </PageContainer>
    </footer>
  );
};

export default Footer;
