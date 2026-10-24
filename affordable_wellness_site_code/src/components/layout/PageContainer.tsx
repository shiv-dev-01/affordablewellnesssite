import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Figma nav uses 40px gutters; hero uses 80px */
  variant?: "nav" | "hero" | "default";
};

/** Figma frame width 1440px */
export function PageContainer({
  children,
  className,
  variant = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px]",
        variant === "nav" && "px-10 max-lg:px-4",
        variant === "hero" && "px-5 sm:px-10 lg:px-20",
        variant === "default" && "px-5 sm:px-10 lg:px-20",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default PageContainer;
