import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface LowStockBannerProps {
  initialMinutes?: number;
}

type LowStockBannerContextType = {
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  startCounter: () => void;
};

export const LowStockBannerContext = createContext<LowStockBannerContextType>({
  timeLeft: 15 * 60,
  setTimeLeft: () => {},
  startCounter: () => {},
});

export const LowStockBannerProvider = ({
  children,
  initialMinutes = 15,
}: { children: ReactNode } & LowStockBannerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  const startCounter = () => {
    if (timeLeft < initialMinutes * 60) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  };

  return (
    <LowStockBannerContext.Provider
      value={{ timeLeft, setTimeLeft, startCounter }}
    >
      {children}
    </LowStockBannerContext.Provider>
  );
};

const LowStockBanner: React.FC<LowStockBannerProps> = ({
  initialMinutes = 15,
}) => {
  const { timeLeft, startCounter } = useContext(LowStockBannerContext);

  useEffect(() => {
    startCounter();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <section className="w-full m-auto pt-1">
      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 1; background-color: #FFC700; }
          50% { opacity: 0.4; background-color: #FFD84D; }
        }
        .animate-flash {
          animation: flash 1.2s infinite ease-in-out;
        }
      `}</style>

      <div className="mx-auto">
        <div className="flex items-center gap-4 rounded-xl bg-[#2F3344] px-4 py-3 md:px-6 md:py-4 mb-4 text-white">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-base">
              <span className="text-[#AAB8EE]">
                Last Updated{" "}
                <span className="font-medium">{getTodayDate()}</span>
              </span>
            </div>
            <p className="mt-1 text-xs md:text-[15px] text-white text-left">
              Your prescription program is reserved for{" "}
              <span className="font-semibold text-[15px]">
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LowStockBanner;
