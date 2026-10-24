import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import switcherImage from "@/assets/switcher-injector.png";
import PageContainer from "@/components/layout/PageContainer";

const steps = [
  {
    number: "1",
    title: "Tell us what you're on",
    description:
      "Share your current medication, dose, and what you're paying. Takes two minutes.",
  },
  {
    number: "2",
    title: "Doctor reviews your case",
    description:
      "A prescribing doctor evaluates whether we are appropriate for your ongoing care.",
  },
  {
    number: "3",
    title: "Switch to flat-rate pricing",
    description:
      "If approved, your next refill ships at one flat monthly price — same at every dose, every month.",
  },
];

const SwitchSection = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const funnelSearch = mergeAffiliateIntoSearch(search);

  return (
    <section className="bg-white flex flex-col items-center py-10 md:py-16">
      <PageContainer
        variant="hero"
        className="flex flex-col items-center gap-10 md:gap-12 w-full"
      >
        {/* Header — Figma 1280×124, two columns */}
        <div className="w-full max-w-[1280px] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] font-medium leading-[1.2] tracking-[-0.02em] text-[#121212] max-w-[847px] lg:flex-1">
            Already on GLP-1? Switch to Affordable Wellness.
          </h2>
          <p className="text-lg leading-[1.5] text-[#121212] max-w-[413px] lg:pb-1">
            Switch to flat rate pricing that won&apos;t go up as your dose
            increases. See if you can save with Affordable Wellness
          </p>
        </div>

        {/* Bordered card — Figma 1280×553 */}
        <div className="w-full max-w-[1280px] border border-[#E5E5E5] rounded-3xl p-2 pb-8 flex flex-col gap-10">
          <div className="w-full h-[200px] sm:h-[280px] md:h-[361px] rounded-2xl bg-[#E0E6EF] overflow-hidden flex items-center justify-center px-6 py-5 sm:px-10 sm:py-6">
            <img
              src={switcherImage}
              alt="GLP-1 injector pen"
              className="w-full h-full object-contain object-center"
            />
          </div>

          <div className="flex flex-col lg:flex-row items-stretch px-4 gap-0">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex gap-4 flex-1 py-0 ${
                  index < steps.length - 1
                    ? "lg:border-r border-[#EFEFEF] lg:pr-8 lg:mr-8"
                    : ""
                } ${index > 0 ? "border-t lg:border-t-0 border-[#EFEFEF] pt-8 lg:pt-0" : ""}`}
              >
                <div className="w-9 h-9 rounded bg-[#E9E8E8] flex items-center justify-center shrink-0">
                  <span className="text-lg font-medium text-[#363636] capitalize leading-[1.3]">
                    {step.number}
                  </span>
                </div>
                <div className="flex flex-col gap-3 pt-1 min-w-0">
                  <h3 className="text-xl font-semibold leading-[1.2] tracking-[-0.01em] text-[#363636]">
                    {step.title}
                  </h3>
                  <p className="text-base leading-[1.5] text-[#363636]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/questionnaire" + funnelSearch)}
            className="inline-flex items-center justify-center gap-3 h-12 px-6 rounded-full bg-[#2D476F] text-white font-semibold text-base hover:bg-[#243247] transition-colors"
          >
            Start Intake
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-[#EFEFEF] bg-white text-[#121212] font-semibold text-base hover:bg-[#FAFAFA] transition-colors"
          >
            See Pricing
          </a>
        </div>
      </PageContainer>
    </section>
  );
};

export default SwitchSection;
