import {
  Stethoscope,
  ShieldCheck,
  MessageCircle,
  RefreshCw,
  Laptop,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import PageContainer from "@/components/layout/PageContainer";

const benefits = [
  {
    icon: Stethoscope,
    title: "Licensed clinician review",
    description:
      "A provider reviews your intake before treatment — included in your plan.",
  },
  {
    icon: ShieldCheck,
    title: "Compounded GLP-1 medication",
    description:
      "Prepared by licensed US compounding pharmacies, shipped to your door.",
  },
  {
    icon: MessageCircle,
    title: "Unlimited clinician messaging",
    description:
      "Message your care team anytime during treatment at no extra charge.",
  },
  {
    icon: RefreshCw,
    title: "On-time medication refills",
    description:
      "Refills ship on schedule — same price even when your dose increases.",
  },
  {
    icon: Laptop,
    title: "Patient portal access",
    description:
      "Manage prescriptions, refills, and messages without platform add-ons.",
  },
  {
    icon: Users,
    title: "US-based care support",
    description:
      "Real support for orders and refills — not upsells you didn't ask for.",
  },
];

const ValuePropositionSection = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const funnelSearch = mergeAffiliateIntoSearch(search);

  return (
    <section className="bg-[#F2F0EE] py-10 md:py-16">
      <PageContainer variant="hero">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="flex flex-col justify-between gap-8 w-full lg:max-w-[479px] lg:min-h-[570px] shrink-0">
            <div className="space-y-5">
              <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] font-medium leading-[1.2] tracking-[-0.02em] text-[#121212]">
                We cut costs,
                <br />
                not care
              </h2>
              <p className="text-lg leading-[1.5] text-[#121212] max-w-[411px]">
                Every plan includes the essentials that make treatment feel
                supported — without the expensive extras that inflate your bill.
              </p>
              <Link
                to={{ pathname: "/", hash: "why-affordable" }}
                className="inline-flex text-base font-semibold text-[#2D476F] underline underline-offset-4 hover:text-[#243247] transition-colors"
              >
                Why we cost less
              </Link>
            </div>
            <button
              type="button"
              onClick={() => navigate("/questionnaire" + funnelSearch)}
              className="inline-flex items-center justify-center gap-3 h-12 px-6 rounded-full bg-[#2D476F] text-white font-semibold text-base hover:bg-[#243247] transition-colors w-fit"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full lg:flex-1 lg:max-w-[737px]">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-6 min-h-[220px] sm:min-h-[240px] lg:min-h-[281px] transition-colors duration-200 hover:bg-[#F5FB98]"
              >
                <Icon
                  className="w-9 h-9 text-[#363636]"
                  strokeWidth={2}
                />
                <div className="flex flex-col gap-2">
                  <p className="text-lg sm:text-xl font-medium leading-[1.4] tracking-[-0.01em] text-[#363636]">
                    {title}
                  </p>
                  <p className="text-sm sm:text-base leading-[1.5] text-[#6E6E6E]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default ValuePropositionSection;
