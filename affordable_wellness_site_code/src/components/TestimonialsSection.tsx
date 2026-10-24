import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import PageContainer from "@/components/layout/PageContainer";

const testimonials = [
  {
    title: "Very happy!",
    quote:
      "This was the first time I saw exactly where every dollar was going before I paid anything. That receipt thing they do? That's what got me.",
    name: "Linda W.",
    duration: "7 months on plan",
  },
  {
    title: "Awesome experience!",
    quote:
      "I almost didn't sign up because the price felt too low. But they literally show you the cost breakdown line by line.",
    name: "Angela T.",
    duration: "5 months on plan",
  },
  {
    title: "Same since day one!",
    quote:
      "My old provider kept raising prices as my dose increased. Here, the price has stayed the same since day one.",
    name: "David H.",
    duration: "12 months on plan",
  },
  {
    title: "Outstanding experience!",
    quote:
      "I appreciate the transparent pricing and found Affordable Wellness to be the most affordable option for Semaglutide.",
    name: "Robert C.",
    duration: "1 year on plan",
  },
];

const starPath =
  "M10 1.5L12.3 7.2H18.4L13.5 10.8L15.8 16.5L10 13.2L4.2 16.5L6.5 10.8L1.6 7.2H7.7L10 1.5Z";

function TrustpilotHeaderStar() {
  return (
    <svg
      width="19"
      height="18"
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 rounded-[2px]"
      aria-hidden
    >
      <rect width="18.46" height="18.44" rx="2" fill="#00B67A" />
      <path
        d="M9.23 3.2L10.4 6.8H14.1L11.2 8.9L12.4 12.5L9.23 10.4L6.06 12.5L7.26 8.9L4.36 6.8H8.06L9.23 3.2Z"
        fill="white"
      />
    </svg>
  );
}

function TrustpilotWordmark() {
  return (
    <div className="flex items-center gap-1.5 h-[21px] shrink-0">
      <svg
        width="20"
        height="19"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M14 2.5L17.2 10.8H26L18.9 16.2L22.1 24.5L14 19.1L5.9 24.5L9.1 16.2L2 10.8H10.8L14 2.5Z"
          fill="#00B67A"
        />
        <path
          d="M14 8.5L15.8 13.2H20.8L16.7 16.2L18.5 20.9L14 17.9L9.5 20.9L11.3 16.2L7.2 13.2H12.2L14 8.5Z"
          fill="#005128"
        />
      </svg>
      <span className="text-[#191919] font-semibold text-sm leading-none tracking-tight">
        Trustpilot
      </span>
    </div>
  );
}

function TrustpilotHeaderRow() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap h-[22px]">
      <TrustpilotWordmark />
      <div className="flex items-center gap-0.5 h-[18px]">
        {[...Array(5)].map((_, i) => (
          <TrustpilotHeaderStar key={i} />
        ))}
      </div>
      <span className="text-base font-bold leading-[22px] tracking-[-0.02em] text-[#121212] whitespace-nowrap">
        5.0 | based on 12K+ reviews
      </span>
    </div>
  );
}

function CardStarRating() {
  return (
    <div className="flex items-start gap-0.5 h-5">
      {[...Array(4)].map((_, i) => (
        <svg
          key={i}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
        >
          <path d={starPath} fill="#2D476F" transform="scale(1)" />
        </svg>
      ))}
      <div className="relative w-5 h-5 shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="absolute inset-0"
          aria-hidden
        >
          <path
            d={starPath}
            fill="none"
            stroke="#2D476F"
            strokeWidth="1.2"
          />
        </svg>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="absolute inset-0"
          style={{ clipPath: "inset(0 50% 0 0)" }}
          aria-hidden
        >
          <path d={starPath} fill="#2D476F" />
        </svg>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M4.67 1.75V3.5M9.33 1.75V3.5M2.33 5.83H11.67M3.5 2.33H10.5C11.144 2.33 11.67 2.856 11.67 3.5V11.67C11.67 12.314 11.144 12.83 10.5 12.83H3.5C2.856 12.83 2.33 12.314 2.33 11.67V3.5C2.33 2.856 2.856 2.33 3.5 2.33Z"
        stroke="#363636"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d={
          direction === "left"
            ? "M12.5 5L7.5 10L12.5 15"
            : "M7.5 5L12.5 10L7.5 15"
        }
        stroke="#2D476F"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "left" ? 0.5 : 1}
      />
    </svg>
  );
}

const TestimonialsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-[#F2F0EE] flex flex-col items-center py-12 lg:py-16">
      <PageContainer
        variant="hero"
        className="flex flex-col items-center gap-16 w-full"
      >
        {/* Frame 2147225763 — gap 24px */}
        <div className="flex flex-col items-center gap-6 w-full max-w-[1280px]">
          <TrustpilotHeaderRow />

          {/* Frame 96 — gap 16px */}
          <div className="flex flex-col items-center gap-4 text-center w-full">
            <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] font-medium leading-[1.2] tracking-[-0.02em] text-[#121212] w-full">
              What patients are saying
            </h2>
            <p className="text-lg leading-[1.5] text-[#121212] max-w-[652px]">
              Wellness isn&apos;t complicated — it&apos;s real, and it&apos;s
              possible.
            </p>
          </div>
        </div>

        {/* Frame 2147228256 — gap 32px */}
        <div className="w-full max-w-[1280px] flex flex-col gap-8">
          <div className="relative">
            <div className="overflow-hidden w-full" ref={emblaRef}>
              {/* Frame 101 — gap 14px */}
              <div className="flex gap-3.5">
                {testimonials.map((item) => (
                  <article
                    key={item.name}
                    className="shrink-0 w-[343px] h-[304px] bg-white rounded-[20px] p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                    style={{ flex: "0 0 343px" }}
                  >
                    <div className="flex flex-col gap-5">
                      <CardStarRating />
                      <div className="flex flex-col gap-3">
                        <h3 className="text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-[#1F2936]">
                          {item.title}
                        </h3>
                        <p className="text-base leading-[1.5] text-[#121212]">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-dashed border-[#E5E5E5]">
                      <span className="text-base font-semibold leading-[22px] text-[#121212]">
                        {item.name}
                      </span>
                      <span className="flex items-center gap-1 text-[13px] font-medium leading-[18px] text-[#363636]">
                        <CalendarIcon />
                        {item.duration}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div
              className="pointer-events-none absolute right-0 top-0 w-[100px] h-[304px] z-10"
              style={{
                background:
                  "linear-gradient(270deg, #F2F0EE 0%, rgba(242, 240, 238, 0) 100%)",
              }}
              aria-hidden
            />
          </div>

          {/* Nav — Figma Container 1280×40 */}
          <div className="flex items-center justify-between h-10">
            <div className="bg-white rounded-full px-6 h-10 flex items-center w-[116px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-[68px] h-[5px] bg-[#D9D9D9] rounded-full relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#2D476F] rounded-full transition-all duration-300"
                  style={{
                    width: `${((activeIndex + 1) / testimonials.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={activeIndex === 0}
                className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] disabled:opacity-40"
                aria-label="Previous slide"
              >
                <NavArrow direction="left" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={activeIndex === testimonials.length - 1}
                className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] disabled:opacity-40"
                aria-label="Next slide"
              >
                <NavArrow direction="right" />
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default TestimonialsSection;
