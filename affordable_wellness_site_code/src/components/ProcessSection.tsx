import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, CheckCircle2, PlusCircle } from "lucide-react";
import affordableWellnessLogo from "@/assets/affordable-wellness-logo.png";
import doctorImage from "@/assets/how-it-works-doctor-cutout.png";
import deliveryBoxImage from "@/assets/delivery-box.png";
import semaglutideBottle from "@/assets/semaglutide-bottle.png";
import emilyPhoto from "@/assets/intake-emily.png";
import PageContainer from "@/components/layout/PageContainer";

const mono = { fontFamily: "'DM Mono', monospace" } as const;

const refillsCardGradient =
  "linear-gradient(180deg, #BCD3E9 0%, #D5E9FB 100%), linear-gradient(180deg, #EEE9D8 0%, #F2FFA4 100%)" as const;
const limeGradient =
  "linear-gradient(180deg, #EEE9D8 0%, #F2FFA4 100%)" as const;

function LimeIconCircle({ size = 32 }: { size?: number }) {
  return (
    <span
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: limeGradient }}
    >
      <img
        src="/favicon.png"
        alt=""
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        className="object-contain"
        aria-hidden
      />
    </span>
  );
}

const steps = [
  {
    step: "1. Intake",
    title: "Complete your intake",
    bg: "#E0E6EF",
    radius: "16px",
    visual: "intake" as const,
  },
  {
    step: "2. doctor consult",
    title: "Get prescribed by a U.S. licensed doctor",
    bg: "#F2F0EE",
    radius: "20px",
    visual: "doctor" as const,
  },
  {
    step: "3. Delivery",
    title: "Get your medication",
    bg: "#F1F2D9",
    radius: "16px",
    visual: "delivery" as const,
  },
  {
    step: "4. Refills",
    title: "Lose weight in less time",
    bg: "#E0E6EF",
    radius: "16px",
    visual: "refills" as const,
  },
];

function IntakeVisual() {
  return (
    <div className="relative w-[360px] h-[393px] mx-auto">
      <div className="absolute left-[calc(50%+6px)] top-[calc(50%-83px)] -translate-x-1/2 w-[340px] h-[167px] bg-white rounded-xl p-4 flex items-center justify-between gap-[25px]">
        <div className="flex flex-col justify-between w-[172px] h-[135px]">
          <p className="text-xl font-medium text-[#121212] tracking-[-0.2px] leading-[1.2]">
            Emily, 24 yrs
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1 px-2 py-2 rounded-md bg-[#E8EEF5] h-8">
              <CheckCircle2 className="w-4 h-4 text-[#363636] shrink-0" />
              <span className="text-xs font-medium text-[#363636] tracking-[-0.2px] leading-4">
                Personal Details
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-2 rounded-md bg-[#F3F2F2] h-8">
              <PlusCircle className="w-[15px] h-[15px] text-[#121212]/20 shrink-0" />
              <span className="text-xs font-medium text-[#363636] tracking-[-0.2px] leading-4">
                Medical History
              </span>
            </div>
          </div>
        </div>
        <div className="w-[136px] h-[135px] rounded-lg overflow-hidden shrink-0">
          <img
            src={emilyPhoto}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden
          />
        </div>
      </div>

      {/* Goal pills — Figma 166×48, gap 12, p 16, radius 12 */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[288px] flex gap-3">
        <div className="w-[166px] h-12 rounded-xl p-4 flex items-center gap-3 bg-white">
          <span className="w-4 h-4 rounded bg-[#363636] flex items-center justify-center shrink-0">
            <span className="w-[5px] h-[5px] rounded-full bg-white" />
          </span>
          <span className="text-sm font-medium text-[#121212] tracking-[-0.01em] leading-[1.2]">
            Lose weight
          </span>
        </div>
        <div className="w-[166px] h-12 rounded-xl p-4 flex items-center gap-3 bg-[#C8D5E4]">
          <span className="w-4 h-4 rounded bg-[#F7F5F5] shrink-0" />
          <span className="text-sm font-medium text-[#5A5A5A] tracking-[-0.01em] leading-[1.2]">
            Affordable meds
          </span>
        </div>
      </div>
    </div>
  );
}

function DoctorVisual() {
  return (
    <div className="relative w-[360px] h-[393px] mx-auto">
      <img
        src={doctorImage}
        alt="U.S. licensed doctor"
        className="absolute left-1/2 -translate-x-1/2 bottom-[72px] z-0 w-[300px] h-auto max-h-[320px] object-contain pointer-events-none"
      />
      {/* Name card — Figma 176×124, p 20, gap 24, top 222 */}
      <div className="absolute left-0 top-[222px] z-10 w-[176px] h-[124px] bg-white rounded-xl p-5 flex flex-col justify-between">
        <img
          src={affordableWellnessLogo}
          alt="Affordable Wellness"
          className="h-6 w-auto max-w-[132px] object-contain object-left"
        />
        <div>
          <p className="text-base font-semibold text-[#121212] leading-[1.2] tracking-[-0.02em]">
            Dr. Mark
          </p>
          <p className="text-[11px] text-[#4B4B4B] leading-[1.2] mt-1">
            Internal Medicine • Clinical Advisor
          </p>
        </div>
      </div>
      {/* Gradient bar — Figma 376.5×61, top 330, left -8 */}
      <div
        className="absolute top-[330px] left-[-8px] w-[376.5px] h-[61px] pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(238, 233, 228, 0) 0%, #EEE9E4 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}

function DeliveryVisual() {
  return (
    <div className="relative w-[360px] h-[393px] mx-auto">
      {/* Box — Figma ~353×192, top 150, left 34 */}
      <img
        src={deliveryBoxImage}
        alt="Affordable Wellness delivery package"
        className="absolute left-[34px] top-[150px] w-[353px] h-[192px] object-contain"
      />
      {/* Replace the legacy one-line box wordmark with the current exact logo. */}
      <div className="absolute left-[96px] top-[231px] z-[2] flex h-[46px] w-[230px] items-center justify-center">
        <img
          src={affordableWellnessLogo}
          alt="Affordable Wellness"
          className="h-[42px] w-auto object-contain brightness-0 invert"
        />
      </div>
      {/* Shipped badge — Figma 182×56, top 69, left 2 */}
      <div className="absolute left-[2px] top-[69px] z-10 h-14 py-3 pl-3 pr-4 rounded-full bg-white flex items-center gap-2 shadow-sm w-fit">
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-[#D4F7E7] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#2D476F]" />
          </span>
          <LimeIconCircle size={32} />
        </div>
        <span className="text-lg font-medium text-[#363636] leading-[1.2]">
          Shipped
        </span>
      </div>
    </div>
  );
}

function RefillsVisual() {
  return (
    <div className="relative w-[360px] h-[393px] mx-auto">
      {/* Inner frame — Figma 216×272, gap 8, top 61, left 72 */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[61px] w-[216px] h-[272px] flex flex-col gap-2">
        <div
          className="relative flex-1 rounded-lg overflow-hidden min-h-0"
          style={{ background: refillsCardGradient }}
        >
          {/* In Stock — single line, Figma proportions */}
          <span
            className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 h-[19px] px-2 py-0.5 rounded-full whitespace-nowrap text-[10px] font-medium leading-none tracking-[-0.01em] text-[#2D476F]"
            style={{
              background:
                "linear-gradient(180deg, #BCD3E9 0%, #D5E9FB 100%)",
            }}
          >
            <span className="w-1 h-1 rounded-full bg-[#2D476F] shrink-0" />
            In Stock
          </span>
          <img
            src={semaglutideBottle}
            alt="Semaglutide medication"
            className="absolute left-1/2 top-[42px] -translate-x-1/2 w-[73px] h-[120px] object-contain"
          />
          {/* Product row — Figma 216×67, p 16, radius 8 */}
          <div className="absolute left-0 right-0 bottom-0 h-[67px] rounded-lg p-4 flex items-center justify-between bg-white">
            <div>
              <p className="text-sm font-medium text-[#121212] leading-[1.2]">
                Semaglutide Rx
              </p>
              <p className="text-xs text-[#5A5A5A] leading-[1.2]">
                Monthly Plan
              </p>
            </div>
            <span className="w-8 h-6 rounded-full border border-[#E5E5E5] flex items-center justify-center shrink-0">
              <ArrowRight className="w-3 h-3 text-[#121212]" />
            </span>
          </div>
        </div>

        <div className="bg-[#363636] rounded-lg px-3 flex items-center gap-2 h-14 shrink-0 w-full">
          <LimeIconCircle size={28} />
          <span className="text-sm font-medium text-white tracking-[-0.01em] leading-[1.2]">
            Refills ships in 5 days
          </span>
        </div>
      </div>
    </div>
  );
}

const visuals = {
  intake: IntakeVisual,
  doctor: DoctorVisual,
  delivery: DeliveryVisual,
  refills: RefillsVisual,
};

const ProcessSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const onResize = () => emblaApi.reInit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [emblaApi]);

  return (
    <section
      id="how-it-works"
      className="bg-white flex flex-col items-center pt-10 pb-10 md:pt-16 md:pb-12"
    >
      <PageContainer
        variant="hero"
        className="flex flex-col items-center gap-10 md:gap-12 w-full"
      >
        {/* Header — Figma 846×136, gap 20px */}
        <div className="flex flex-col items-center gap-5 max-w-[846px] text-center">
          <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] font-medium leading-[1.2] tracking-[-0.02em] text-[#121212] max-w-[775px]">
            Expert-reviewed care, fully online
          </h2>
          <p className="text-lg leading-[1.5] text-[#121212] max-w-[628px]">
            Four steps from intake to treatment — no office visits, no
            insurance paperwork, no complicated membership layers.
          </p>
        </div>

        {/* Carousel block — Figma 1280×592, gap 32px */}
        <div className="w-full max-w-[1280px] flex flex-col gap-8">
          <div className="overflow-hidden w-full" ref={emblaRef}>
            <div className="flex gap-4">
              {steps.map((step) => {
                const Visual = visuals[step.visual];
                return (
                  <article
                    key={step.step}
                    className="shrink-0 grow-0 basis-[min(100%,424px)] flex flex-col justify-between p-6 sm:p-8 h-[480px] sm:h-[520px] w-[min(100%,424px)]"
                    style={{
                      background: step.bg,
                      borderRadius: step.radius,
                    }}
                  >
                    <header className="flex flex-col gap-3">
                      <span
                        className="text-sm uppercase tracking-[0.02em] text-[#5A5A5A] leading-[1.2]"
                        style={mono}
                      >
                        {step.step}
                      </span>
                      <h3 className="text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-[#363636] max-w-[372px]">
                        {step.title}
                      </h3>
                    </header>
                    <div className="relative flex-1 mt-5 min-h-0 w-full flex items-center justify-center">
                      <Visual />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Nav — Figma 1280×40 */}
          <div className="flex items-center justify-between w-full h-10">
            <div className="bg-[#F3F2F2] rounded-full px-6 h-10 flex items-center w-[116px]">
              <div className="w-[68px] h-[5px] bg-[#D9D9D9] rounded-full relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#2D476F] rounded-full transition-all duration-300"
                  style={{
                    width: `${((activeIndex + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="w-10 h-10 rounded-full bg-[#F3F2F2] flex items-center justify-center disabled:opacity-40"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-5 h-5 text-[#2D476F] opacity-50" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="w-10 h-10 rounded-full bg-[#F3F2F2] flex items-center justify-center disabled:opacity-40"
                aria-label="Next slide"
              >
                <ArrowRight className="w-5 h-5 text-[#2D476F]" />
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default ProcessSection;
