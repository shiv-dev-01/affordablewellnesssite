import { useEffect, useRef, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import awChartCalloutBadge from "@/assets/aw-chart-callout-badgeaw-chart-callout-badge.png";

const X_LABELS = ["Month 1", "Month 3", "Month 6", "Month 12", "Month 18"];

const PLOT_HEIGHT = 380;
/** Headroom above $900 tick so label + axis title aren't clipped */
const PLOT_TOP_PAD = 36;
const TICK_PRICES_ASC = [0, 200, 300, 500, 700, 900] as const;
const Y_LABELS = ["$900", "$700", "$500", "$300", "$200", "$0"];
const TICK_SEGMENT = PLOT_HEIGHT / (TICK_PRICES_ASC.length - 1);

const AW_PRICE = 200;
const CHART_DATA = [
  { otherPrice: 165 },
  { otherPrice: 275 },
  { otherPrice: 425 },
  { otherPrice: 550 },
  { otherPrice: 825 },
];

const AW_BAR_GRADIENT =
  "linear-gradient(208.49deg, rgba(45, 71, 111, 0) -75.21%, #2D476F 93.95%)";
const OTHER_BAR_GRADIENT =
  "linear-gradient(360deg, #F0FCA7 50%, #EDECDA 97.37%)";
const AW_BRAND_NAVY = "#2D476F";
const OTHER_BRAND_LIME = "#F5FB98";
const LEGEND_OTHER_GRADIENT =
  "linear-gradient(180deg, #EDECDA 0%, #F0FCA7 100%)";

const CHART_FRAME_WIDTH = 1050;
const Y_TITLE_COL_WIDTH = 56;
const Y_PRICE_COL_WIDTH = 52;
const Y_AXIS_GUTTER = Y_TITLE_COL_WIDTH + Y_PRICE_COL_WIDTH;
const X_AXIS_GAP = 31;

const AW_BADGE_WIDTH = 145;
const AW_BADGE_HEIGHT = 68;

const CALLOUT_BADGE_RIGHT_INSET = 56;
const CALLOUT_GAP_FROM_BARS = 32;

const OTHER_BADGE_HEIGHT = 44;
const OTHER_BADGE_PADDING = "10px 20px";

const BAR_WIDTH = 62;

/** Approximate full chart block height (plot + pad + x-axis + labels) for scale wrapper */
const CHART_FRAME_HEIGHT = PLOT_HEIGHT + PLOT_TOP_PAD + X_AXIS_GAP + 28;

const mono = { fontFamily: "'DM Mono', monospace" } as const;

const BAR_AREA_RIGHT =
  CALLOUT_BADGE_RIGHT_INSET + AW_BADGE_WIDTH + CALLOUT_GAP_FROM_BARS;

function priceToHeight(price: number): number {
  for (let i = 0; i < TICK_PRICES_ASC.length - 1; i++) {
    const lo = TICK_PRICES_ASC[i];
    const hi = TICK_PRICES_ASC[i + 1];
    if (price >= lo && price <= hi) {
      const t = (price - lo) / (hi - lo);
      return i * TICK_SEGMENT + t * TICK_SEGMENT;
    }
  }
  return price <= 0 ? 0 : PLOT_HEIGHT;
}

function labelIndexToBottomY(labelIndex: number): number {
  return (Y_LABELS.length - 1 - labelIndex) * TICK_SEGMENT;
}

/** $900 at top (0), $0 at bottom (PLOT_HEIGHT) */
function labelIndexToTopY(labelIndex: number): number {
  return labelIndex * TICK_SEGMENT;
}

function CalloutRow({
  children,
  rowHeight,
  badgeRightInset = 0,
}: {
  children: React.ReactNode;
  rowHeight: number;
  badgeRightInset?: number;
}) {
  return (
    <div
      className="flex flex-row items-center pointer-events-none z-[2] w-full"
      style={{ height: `${rowHeight}px` }}
    >
      <div className="flex-1 border-t border-dashed border-[#B8B8B8]" />
      <div
        className="shrink-0 flex justify-start"
        style={{
          marginRight: `${badgeRightInset}px`,
          width: `${AW_BADGE_WIDTH}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const CostComparisonSection = () => {
  const awBarHeight = priceToHeight(AW_PRICE);
  const month18Height = priceToHeight(CHART_DATA[4].otherPrice);
  const scaleWrapRef = useRef<HTMLDivElement>(null);
  const [chartScale, setChartScale] = useState(1);

  useEffect(() => {
    const el = scaleWrapRef.current;
    if (!el) return;

    const updateScale = () => {
      const available = el.clientWidth;
      if (available <= 0) return;
      setChartScale(Math.min(1, available / CHART_FRAME_WIDTH));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="bg-white py-12 md:py-16">
      <PageContainer variant="hero">
        <div className="flex flex-col items-center gap-12 md:gap-16">
          <div className="flex flex-col items-center gap-5 max-w-[846px] text-center">
            <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] max-sm:text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-[#121212]">
              Your health shouldn&apos;t cost your wealth.
            </h2>
            <p className="text-lg max-sm:text-base leading-[1.5] text-[#121212] max-w-[400px] max-sm:px-1">
              With most providers, your price goes up every time your dose does.
              Ours doesn&apos;t.
            </p>
          </div>

          <div
            className="w-full shrink-0 pt-2 pl-1"
            style={{ maxWidth: `${CHART_FRAME_WIDTH}px` }}
          >
            <div ref={scaleWrapRef} className="w-full overflow-hidden">
              <div
                style={{
                  height: `${CHART_FRAME_HEIGHT * chartScale}px`,
                  width: "100%",
                }}
              >
                <div
                  className="relative flex"
                  style={{
                    width: `${CHART_FRAME_WIDTH}px`,
                    transform: `scale(${chartScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  {/* Y-axis — Figma: title left of prices, values left-aligned */}
                  <div
                    className="relative shrink-0 flex overflow-visible"
                    style={{ width: `${Y_AXIS_GUTTER}px` }}
                  >
                    {/* Rotated axis title beside upper price ticks */}
                    <div
                      className="relative shrink-0 overflow-visible"
                      style={{
                        width: `${Y_TITLE_COL_WIDTH}px`,
                        height: `${PLOT_HEIGHT + PLOT_TOP_PAD}px`,
                        paddingTop: `${PLOT_TOP_PAD}px`,
                      }}
                    >
                      <p
                        className="absolute text-[11px] font-medium uppercase tracking-[-0.03em] text-[#7C7C7C]/70 whitespace-nowrap"
                        style={{
                          ...mono,
                          left: "-2px",
                          top: `${labelIndexToTopY(2) + TICK_SEGMENT * 0.55}px`,
                          transform: "rotate(-90deg)",
                          transformOrigin: "top left",
                        }}
                      >
                        Price per dose (USD)
                      </p>
                    </div>

                    {/* Price values — one left-aligned column */}
                    <div
                      className="relative shrink-0 overflow-visible"
                      style={{
                        width: `${Y_PRICE_COL_WIDTH}px`,
                        height: `${PLOT_HEIGHT + PLOT_TOP_PAD}px`,
                        paddingTop: `${PLOT_TOP_PAD}px`,
                      }}
                    >
                      <div
                        className="relative"
                        style={{ height: `${PLOT_HEIGHT}px` }}
                      >
                        {Y_LABELS.map((label, i) => (
                          <span
                            key={label}
                            className="absolute left-0 block text-[13px] text-[#7C7C7C] leading-none tabular-nums"
                            style={{
                              ...mono,
                              top: `${labelIndexToTopY(i)}px`,
                              transform: "translateY(-50%)",
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Plot + x-axis */}
                  <div className="relative flex-1 min-w-0">
                    <div
                      className="relative overflow-visible"
                      style={{
                        height: `${PLOT_HEIGHT + PLOT_TOP_PAD}px`,
                        paddingTop: `${PLOT_TOP_PAD}px`,
                      }}
                    >
                      {/* Grid lines — skip $200 (callout dashed line) */}
                      {Y_LABELS.map((label, i) => {
                        if (label === "$200") return null;
                        return (
                          <div
                            key={`grid-${label}`}
                            className="absolute left-0 right-0 border-t border-dashed border-[#E0E0E0]"
                            style={{ bottom: `${labelIndexToBottomY(i)}px` }}
                          />
                        );
                      })}

                      {/* Bars */}
                      <div
                        className="absolute bottom-0 left-0 flex items-end justify-between"
                        style={{ right: `${BAR_AREA_RIGHT}px` }}
                      >
                        {CHART_DATA.map((point, i) => (
                          <div
                            key={i}
                            className="flex flex-1 items-end justify-center max-w-[128px]"
                          >
                            <div
                              style={{
                                width: `${BAR_WIDTH}px`,
                                height: awBarHeight,
                                background: AW_BAR_GRADIENT,
                              }}
                            />
                            <div
                              style={{
                                width: `${BAR_WIDTH}px`,
                                height: priceToHeight(point.otherPrice),
                                background: OTHER_BAR_GRADIENT,
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* $200 dashed line — inside plot, aligned to blue bar tops */}
                      <div
                        className="absolute left-0 right-0"
                        style={{
                          bottom: `${awBarHeight - AW_BADGE_HEIGHT / 2}px`,
                        }}
                      >
                        <CalloutRow
                          rowHeight={AW_BADGE_HEIGHT}
                          badgeRightInset={CALLOUT_BADGE_RIGHT_INSET}
                        >
                          <img
                            src={awChartCalloutBadge}
                            alt="Affordable Wellness"
                            width={AW_BADGE_WIDTH}
                            height={AW_BADGE_HEIGHT}
                            className="block shrink-0 rounded-xl"
                            draggable={false}
                          />
                        </CalloutRow>
                      </div>

                      {/* Other Brands dashed line */}
                      <div
                        className="absolute left-0 right-0"
                        style={{
                          bottom: `${month18Height - OTHER_BADGE_HEIGHT / 2}px`,
                        }}
                      >
                        <CalloutRow
                          rowHeight={OTHER_BADGE_HEIGHT}
                          badgeRightInset={CALLOUT_BADGE_RIGHT_INSET}
                        >
                          <div
                            className="flex items-center justify-center shrink-0 rounded-xl"
                            style={{
                              background: OTHER_BRAND_LIME,
                              height: `${OTHER_BADGE_HEIGHT}px`,
                              padding: OTHER_BADGE_PADDING,
                            }}
                          >
                            <span className="text-[15px] font-medium leading-none text-[#121212] whitespace-nowrap">
                              Other Brands
                            </span>
                          </div>
                        </CalloutRow>
                      </div>
                    </div>

                    <div
                      className="flex justify-between"
                      style={{
                        marginTop: `${X_AXIS_GAP}px`,
                        paddingRight: `${BAR_AREA_RIGHT}px`,
                      }}
                    >
                      {X_LABELS.map((label) => (
                        <div
                          key={label}
                          className="flex-1 text-center max-w-[128px]"
                        >
                          <span
                            className="text-sm text-[#7C7C7C] whitespace-nowrap capitalize"
                            style={mono}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 shrink-0 rounded-[1px]"
                  style={{ background: AW_BRAND_NAVY }}
                />
                <span className="text-base font-medium">
                  <span className="text-[#121212]">Affordable </span>
                  <span className="text-[#2D476F]">Wellness</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 shrink-0 rounded-[1px]"
                  style={{ background: LEGEND_OTHER_GRADIENT }}
                />
                <span className="text-base font-medium text-[#121212]">
                  Other Brands
                </span>
              </div>
            </div>
          </div>

          <p className="text-base leading-[1.5] text-[#6E6E6E] text-center max-w-[848px]">
            GLP-1 treatments typically begin at a lower dose and gradually
            increase as your body adapts. While most providers raise prices when
            your dose increases,{" "}
            <strong className="font-semibold text-[#121212]">
              our pricing stays the same throughout your treatment journey.
            </strong>
          </p>
        </div>
      </PageContainer>
    </section>
  );
};

export default CostComparisonSection;
