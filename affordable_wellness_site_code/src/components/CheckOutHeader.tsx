import { Lock, Phone } from "lucide-react";
import affordableWellnessLogo from "../assets/affordable-wellness-logo.png";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/contactInfo";

export const CHECKOUT_PHONE_DISPLAY = SITE_PHONE_DISPLAY;
export const CHECKOUT_PHONE_TEL = SITE_PHONE_TEL;

const CheckOutHeader = () => {
  return (
    <header className="border-b border-border bg-card" role="banner">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 max-md:gap-2 px-4 max-md:px-3 py-4 max-md:py-3 md:px-6">
        <a
          href="/"
          className="flex items-center gap-2 min-w-0 shrink"
          aria-label="Affordable Wellness home"
        >
          <img
            src={affordableWellnessLogo}
            alt="Affordable Wellness"
            className="h-8 w-auto object-contain md:h-9 max-md:h-7 max-md:max-w-[120px]"
          />
        </a>

        <div className="flex items-center gap-3 max-md:gap-1.5 md:gap-6 shrink-0">
          <a
            href={`tel:${CHECKOUT_PHONE_TEL}`}
            className="-mx-2 max-md:-mx-1 -my-2 flex items-center gap-2 max-md:gap-1.5 rounded-full px-2 max-md:px-1.5 py-2 text-right text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">
              <span className="hidden md:inline">Questions? Call us </span>
              <span className="font-semibold text-primary">
                {CHECKOUT_PHONE_DISPLAY}
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2 max-md:gap-1.5 rounded-full bg-blue-card px-3 max-md:px-2 py-1.5">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
            <span className="text-xs max-md:text-[10px] font-semibold tracking-wide text-primary whitespace-nowrap">
              SECURE <span className="font-normal">PAYMENT</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CheckOutHeader;
