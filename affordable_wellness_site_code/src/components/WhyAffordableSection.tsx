import {
  ArrowRight,
  Asterisk,
  Server,
  TrendingUp,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import heroPortrait from "@/assets/why-affordable-hero.png";
import avatarOne from "@/assets/why-affordable-avatar-1.png";
import avatarTwo from "@/assets/why-affordable-avatar-2.png";
import PageContainer from "@/components/layout/PageContainer";

const reasons = [
  {
    icon: User,
    title: "No middlemen markup",
    description:
      "No PBMs, no inflated supply chains between you and your medication.",
  },
  {
    icon: Asterisk,
    title: "No lifestyle program padding",
    description:
      "You pay for treatment and care. Not add-ons you didn't ask for.",
  },
  {
    icon: TrendingUp,
    title: "No dose-based price games",
    description:
      "A higher dose shouldn't mean a higher bill. Here it doesn't.",
  },
  {
    icon: Server,
    title: "Online-first efficiency",
    description:
      "No office. No waiting rooms. Lower overhead, lower price. Simple.",
  },
];

const WhyAffordableSection = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const funnelSearch = mergeAffiliateIntoSearch(search);

  return (
    <section id="why-affordable" className="bg-white py-10 md:py-16">
      <PageContainer variant="hero">
        <div className="flex flex-col gap-12 md:gap-16 max-w-[1280px] mx-auto">
          {/* Centered header — matches Figma screenshot */}
          <div className="flex flex-col items-center gap-5 text-center max-w-[846px] mx-auto">
            <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] font-medium leading-[1.2] tracking-[-0.02em] text-[#121212]">
              Why are we affordable?
            </h2>
            <p className="text-lg leading-[1.5] text-[#121212] max-w-[463px]">
              Affordable because the model is simpler. We include the essentials,
              not the expensive extras.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 items-stretch">
            {/* Left portrait — bathrobe woman from design */}
            <div className="w-full lg:w-[413px] lg:shrink-0">
              <img
                src={heroPortrait}
                alt="Affordable wellness member"
                className="w-full h-full min-h-[360px] lg:min-h-[468px] object-cover rounded-[20px]"
              />
            </div>

            {/* Right bordered grid */}
            <div className="flex-1 min-w-0 border border-[#E5E5E5] rounded-[20px] overflow-hidden flex flex-col lg:max-w-[847px] lg:min-h-[468px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 flex-1">
                {reasons.map((reason, index) => {
                  const Icon = reason.icon;
                  const borderClass =
                    index === 0
                      ? "border-b sm:border-r border-[#E5E5E5]"
                      : index === 1
                        ? "border-b border-[#E5E5E5]"
                        : index === 2
                          ? "sm:border-r border-[#E5E5E5]"
                          : "";

                  return (
                    <div
                      key={reason.title}
                      className={`flex gap-4 p-8 ${borderClass}`}
                    >
                      <div className="w-9 h-9 rounded bg-[#F1F2D9] flex items-center justify-center shrink-0">
                        <Icon
                          className="w-5 h-5 text-[#363636]"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-3 pt-1.5 min-w-0">
                        <h3 className="text-xl font-semibold leading-[1.2] tracking-[-0.01em] text-[#363636]">
                          {reason.title}
                        </h3>
                        <p className="text-base leading-[1.5] text-[#363636] min-h-[72px]">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer — avatars + 50k+ + CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 border-t border-[#E5E5E5] min-h-[112px]">
                <div className="flex items-center">
                  <img
                    src={avatarOne}
                    alt=""
                    className="w-[52px] h-11 object-cover object-center rounded-lg border-2 border-white -scale-x-100"
                    aria-hidden
                  />
                  <div className="w-[52px] h-11 rounded-lg border-2 border-white -ml-1.5 overflow-hidden bg-[#E3E2E0]">
                    <img
                      src={avatarTwo}
                      alt=""
                      className="w-full h-full object-cover object-center"
                      aria-hidden
                    />
                  </div>
                  <div className="w-[52px] h-11 rounded-lg border-2 border-white bg-[#363636] flex items-center justify-center -ml-1.5">
                    <span className="text-sm font-semibold leading-[1.2] tracking-[-0.01em] text-white capitalize">
                      50k+
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/questionnaire" + funnelSearch)}
                  className="inline-flex items-center justify-center gap-3 h-12 px-6 rounded-full bg-[#2D476F] text-white font-semibold text-base hover:bg-[#243247] transition-colors shrink-0"
                >
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default WhyAffordableSection;
