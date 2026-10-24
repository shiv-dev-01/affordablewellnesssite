import { useContext, useEffect } from "react";
import { Timer } from "lucide-react";
import { LowStockBannerContext } from "@/components/LowStockBanner";

interface CheckoutReservedTimerProps {
  embeddedInCard?: boolean;
}

const CheckoutReservedTimer = ({
  embeddedInCard = false,
}: CheckoutReservedTimerProps) => {
  const { timeLeft, startCounter } = useContext(LowStockBannerContext);

  useEffect(() => {
    startCounter();
  }, [startCounter]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground ${
        embeddedInCard ? "rounded-t-xl" : "rounded-xl"
      }`}
    >
      <p className="text-sm text-pretty">
        Your prescription program is reserved for
      </p>
      <p className="flex shrink-0 items-center gap-1.5 rounded-full bg-highlight px-3 py-1 font-heading text-sm font-semibold tabular-nums text-highlight-foreground">
        <Timer className="h-4 w-4" aria-hidden />
        <span className="inline-block min-w-[5ch] text-center">
          {formatTime(timeLeft)}
        </span>
      </p>
    </div>
  );
};

export default CheckoutReservedTimer;
