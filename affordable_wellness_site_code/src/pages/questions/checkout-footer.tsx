import { Link } from "react-router-dom";
import hipaaBadge from "@/assets/hipaa-compliant-badge.png";
import legitScript from "@/assets/icon/legitscript.png";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/contactInfo";

const CONTACT_EMAIL = "support@affordablewellness.com";

const CheckoutFooter = () => {
  return (
    <footer className="w-full mt-auto" role="contentinfo">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col justify-center items-center py-4 gap-4">
          <div className="w-full h-px bg-slate-300/70 max-w-7xl mx-auto" />
          <div className="text-slate-800 text-xs mb-6 w-full">
            <p className="text-justify">
              *All medical services, including clinical evaluations, treatment
              planning, and prescribing decisions, are provided exclusively by
              licensed independent medical providers. Affordable Wellness provides the
              technology platform and administrative coordination services.
              Affordable Wellness does not provide medical services, does not employ
              healthcare providers, and does not practice medicine.
            </p>
            <br />
            <p className="text-justify">
              *Affordable Wellness is committed to making its website accessible to all
              users, including individuals with disabilities. If you
              experience difficulty accessing any content on this website,
              please contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-2 hover:text-black"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              or{" "}
              <a
                href={`tel:${SITE_PHONE_TEL}`}
                className="underline underline-offset-2 hover:text-black"
              >
                {SITE_PHONE_DISPLAY}
              </a>
              .
            </p>
          </div>

          <div className="w-full flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-6">
            <nav
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-800"
              aria-label="Legal"
            >
              <Link
                to="/privacypolicy"
                className="hover:text-black transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/termsofservice"
                className="hover:text-black transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/telehealth-consent"
                className="hover:text-black transition-colors"
              >
                Telehealth Consent
              </Link>
            </nav>

            <div className="flex items-center gap-4 shrink-0">
              <img
                src={hipaaBadge}
                alt="HIPAA Compliant"
                className="h-12 w-12 rounded-full object-cover"
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
                  className="h-12 w-12 object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CheckoutFooter;
