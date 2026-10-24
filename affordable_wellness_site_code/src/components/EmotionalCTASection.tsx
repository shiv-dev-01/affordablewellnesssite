import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import affordableWellnessLogo from "@/assets/affordable-wellness-logo.png";
import ctaBackground from "@/assets/cta-background.png";
import PageContainer from "@/components/layout/PageContainer";

const EmotionalCTASection = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const funnelSearch = mergeAffiliateIntoSearch(search);

  const headlineClass =
    "font-normal leading-[1.2] tracking-[-0.03em] text-white text-[32px] sm:text-[44px] lg:text-[56px] xl:text-[72px]";

  return (
    <section
      className="relative w-full min-h-[600px] lg:h-[820px] flex items-stretch overflow-hidden"
      style={{
        background: `radial-gradient(50% 50% at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%), url(${ctaBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <PageContainer
        variant="hero"
        className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-4 lg:gap-2 py-16 lg:py-24 w-full h-full"
      >
        {/* Left — top aligned */}
        <div className="w-full lg:w-[400.5px] lg:min-h-[628px] shrink-0 flex flex-col">
          <h2 className={`${headlineClass} max-w-[400.5px]`}>
            Your health
            <br />
            is priceless.
          </h2>
        </div>

        {/* Center card */}
        <div className="w-full max-w-[300px] lg:w-[300px] mx-auto lg:mx-0 shrink-0 lg:min-h-[628px]">
          <div className="relative rounded-[20px] overflow-hidden border border-white/30 bg-white/10 backdrop-blur-sm w-full h-[400px] lg:h-[628px]">
            <img
              src={ctaBackground}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
              aria-hidden
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
              }}
              aria-hidden
            />

            <div className="relative z-10 flex flex-col justify-between h-full p-4">
              <div className="flex items-center gap-3 w-[269px] max-w-full min-h-[54px] rounded-xl bg-black/25 backdrop-blur-md px-3 py-2 border border-white/15">
                <img
                  src={affordableWellnessLogo}
                  alt="Affordable Wellness"
                  className="h-8 w-auto max-w-[140px] object-contain object-left brightness-0 invert shrink-0"
                />
              </div>

              <div className="flex flex-col gap-2.5 items-start w-full pb-2 pl-1">
                <span className="inline-flex w-fit rounded-full bg-black/30 backdrop-blur-md border border-white/20 px-5 py-2.5 text-xs font-medium text-white">
                  Every dollar, explained.
                </span>
                <span className="inline-flex w-fit rounded-full bg-black/30 backdrop-blur-md border border-white/20 px-5 py-2.5 text-xs font-medium text-white">
                  Same price. Every dose.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — left-aligned near center card */}
        <div className="w-full lg:w-[400.5px] lg:min-h-[628px] shrink-0 flex flex-col lg:pt-[250px] gap-8 lg:gap-10 lg:items-start lg:text-left">
          <h2 className={`${headlineClass} max-w-[400.5px]`}>
            Your treatment
            <br />
            shouldn&apos;t be.
          </h2>
          <button
            type="button"
            onClick={() => navigate("/questionnaire" + funnelSearch)}
            className="inline-flex items-center justify-center gap-3 w-[191px] h-14 py-3 px-8 rounded-[48px] bg-white hover:bg-white/90 text-[#121212] font-semibold text-base transition-colors whitespace-nowrap shrink-0"
          >
            Get Started
            <ArrowRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </PageContainer>
    </section>
  );
};

export default EmotionalCTASection;
