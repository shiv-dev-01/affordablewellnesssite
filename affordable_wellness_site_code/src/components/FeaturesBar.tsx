import {
  Heart,
  CircleDollarSign,
  BadgeCheck,
  EyeOff,
  PackageCheck,
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";

const usps = [
  { icon: Heart, label: "Dedicated 1-on-1 care teams" },
  { icon: CircleDollarSign, label: "Same price every dose" },
  { icon: BadgeCheck, label: "Licensed, US-based pharmacies" },
  { icon: EyeOff, label: "No hidden fees" },
  { icon: PackageCheck, label: "Discreet home delivery" },
];

const FeaturesBar = () => {
  return (
    <div className="bg-white border-y border-[#EFEFEF]">
      <PageContainer variant="nav" className="!px-8 max-lg:!px-4">
        <div className="flex flex-row items-center py-5 max-lg:py-4 gap-8 max-lg:gap-4 h-[104px] max-lg:min-h-[72px] max-lg:h-auto box-border isolate">
          <div className="relative flex-1 min-w-0 self-stretch flex items-center py-5 max-lg:py-2 overflow-hidden">
            <div className="flex items-center gap-8 max-lg:gap-6 overflow-x-auto scrollbar-none pr-20 max-lg:pr-16">
              {usps.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 max-lg:gap-3 shrink-0"
                >
                  <Icon
                    className="w-6 h-6 max-lg:w-5 max-lg:h-5 text-[#363636] shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="text-base max-lg:text-sm font-medium leading-[1.4] text-[#121212] whitespace-nowrap">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="pointer-events-none absolute right-0 top-0 w-20 h-full z-[2]"
              style={{
                background:
                  "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 20%, rgba(255, 255, 255, 0.6) 40%, rgba(255, 255, 255, 0) 100%)",
              }}
              aria-hidden
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default FeaturesBar;
