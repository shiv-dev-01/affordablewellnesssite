import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import semaglutideBottle from "@/assets/semaglutide-bottle.png";
import tirzepatideBottle from "@/assets/tirzepatide-bottle.png";
import FeaturesBar from "@/components/FeaturesBar";
import PageContainer from "@/components/layout/PageContainer";

const Hero = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const funnelSearch = mergeAffiliateIntoSearch(search);

  const goToQuestionnaire = () => navigate("/questionnaire" + funnelSearch);

  const ProductCard = ({
    name,
    bgClass,
    badge,
    medicationKey,
    image,
    imageWidth = "182px",
    imageHeight = "298px",
    imageLeft = "66px",
    imageTop = "52px",
  }: {
    name: string;
    bgClass: string;
    badge: string;
    medicationKey: "semaglutide" | "tirzepatide";
    image: string;
    imageWidth?: string;
    imageHeight?: string;
    imageLeft?: string;
    imageTop?: string;
  }) => (
    <div
      onClick={goToQuestionnaire}
      data-medication={medicationKey}
      className={`flex w-full lg:w-[628px] h-[260px] sm:h-[300px] lg:h-[324px] rounded-2xl ${bgClass} overflow-hidden cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow justify-between`}
    >
      {/* Desktop keeps original p-6 / 50% / sizes; mobile uses tighter spacing */}
      <div className="flex flex-col justify-between p-4 max-lg:w-[55%] sm:p-6 w-[50%] lg:w-[314px] min-w-0 shrink-0">
        <div className="flex flex-col gap-4 max-lg:gap-2.5">
          <div className="flex flex-col gap-2 max-lg:gap-1.5">
            <h3 className="text-[22px] sm:text-[26px] lg:text-[28px] max-lg:text-[20px] sm:max-lg:text-[26px] font-medium leading-[1.2] text-[#121212] capitalize">
              {name}
            </h3>
            <p className="text-sm max-lg:text-xs sm:max-lg:text-sm font-normal leading-[1.4] text-[#363636]">
              Lose weight with a doctor in your corner
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-2 px-3 max-lg:px-2.5 py-1 rounded-full bg-[#D4F7E7] text-xs max-lg:text-[11px] sm:max-lg:text-xs font-medium text-[#2D476F]">
              <span className="w-1 h-1 rounded-full bg-[#2D476F]" />
              In Stock
            </span>
            <span className="inline-flex items-center px-3 max-lg:px-2.5 py-1 rounded-full bg-[#F5FB98] text-xs max-lg:text-[11px] sm:max-lg:text-xs font-medium text-[#363636]">
              {badge}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToQuestionnaire();
          }}
          className="self-start inline-flex items-center justify-center h-12 max-lg:h-10 sm:max-lg:h-12 px-6 max-lg:px-4 sm:max-lg:px-6 rounded-full bg-white text-base max-lg:text-sm sm:max-lg:text-base font-semibold text-[#121212] tracking-[-0.01em] hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Get Started
        </button>
      </div>

      <div className="relative w-[50%] max-lg:w-[45%] sm:max-lg:w-[50%] lg:w-[314px] h-full shrink-0 overflow-hidden">
        {/* Desktop: original absolute size/position. Mobile only: smaller bottle. */}
        <img
          src={image}
          alt={name}
          className="absolute object-contain object-center pointer-events-none max-lg:!left-1/2 max-lg:!-translate-x-1/2 max-lg:!top-auto max-lg:!bottom-[8%] max-lg:!w-auto max-lg:!h-[72%] max-lg:!max-w-[min(110px,70%)] sm:max-lg:!h-[78%] sm:max-lg:!max-w-[130px]"
          style={{
            left: imageLeft,
            top: imageTop,
            width: imageWidth,
            height: imageHeight,
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Figma Hero Section — 1440×856, padding 0 (72px nav offset + 784px content) */}
      <section className="bg-white pt-[72px] min-h-0 lg:h-[856px] flex flex-col max-lg:overflow-x-clip">
        <PageContainer
          variant="hero"
          className="flex flex-col items-start lg:py-16 max-lg:py-8 flex-1 lg:h-[784px] lg:max-h-[784px]"
        >
          <div className="flex flex-col lg:flex-row items-start gap-6 max-lg:gap-8 w-full h-full">
            <div className="w-full lg:w-[628px] lg:shrink-0 flex flex-col justify-between gap-8 max-lg:gap-6 lg:min-h-[656px]">
              <div className="flex flex-col gap-10 max-lg:gap-6">
                <div
                  className="inline-flex items-center gap-2 pl-1 pr-3.5 py-1 rounded-3xl w-fit max-lg:flex-wrap max-lg:max-w-full"
                  style={{
                    background:
                      "linear-gradient(270deg, #F0FCA7 0%, #EDECDA 100%)",
                  }}
                >
                  <span className="inline-flex items-center justify-center px-[9px] py-2 rounded-2xl bg-white text-sm max-lg:text-xs font-bold text-[#243247] tracking-[-0.02em] leading-[1.5]">
                    80% Savings
                  </span>
                  <span className="text-sm max-lg:text-xs font-medium text-black tracking-[-0.01em] leading-[1.5] pr-1">
                    Most Affordable GLP-1 Provider
                  </span>
                </div>

                <h1 className="figma-h1 max-w-[628px]">
                  GLP-1 treatment without the pricing games
                </h1>

                <button
                  type="button"
                  onClick={goToQuestionnaire}
                  className="figma-btn-primary w-full lg:w-[268px] h-14 py-3 px-8 max-lg:px-6 gap-3 rounded-[48px] text-lg max-lg:text-base tracking-[-0.02em] whitespace-nowrap shrink-0"
                >
                  Get Started
                  <ArrowRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
              </div>

              <p className="figma-body max-w-[411px]">
                Flat-rate compounded semaglutide and tirzepatide plans with full
                pricing transparency, unlimited doctor messaging, and no
                dose-based price hikes.
              </p>
            </div>

            <div className="w-full lg:w-[628px] lg:shrink-0 flex flex-col gap-2 max-lg:gap-4 max-lg:pt-6 lg:pt-0">
              <ProductCard
                name="Semaglutide"
                bgClass="bg-cream"
                badge="Flat Monthly Price"
                medicationKey="semaglutide"
                image={semaglutideBottle}
              />
              <ProductCard
                name="Tirzepatide"
                bgClass="bg-blue-card"
                badge="No dose based hike"
                medicationKey="tirzepatide"
                image={tirzepatideBottle}
              />
            </div>
          </div>
        </PageContainer>
      </section>
      <FeaturesBar />
    </>
  );
};

export default Hero;
