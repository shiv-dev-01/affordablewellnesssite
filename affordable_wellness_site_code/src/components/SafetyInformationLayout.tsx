import { useEffect, type ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

type SafetyInformationLayoutProps = {
  title: string;
  children: ReactNode;
};

const SafetyInformationLayout = ({
  title,
  children,
}: SafetyInformationLayoutProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      <Navbar />
      <div className="pt-[80.8px]">
        <section className="bg-[#eaebf5] px-4 py-10 sm:px-6 sm:py-12 md:py-14">
          <h1 className="container mx-auto max-w-5xl font-heading text-[1.75rem] font-bold uppercase leading-tight tracking-tight text-navy sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {title}
          </h1>
        </section>

        <section className="bg-white px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pt-10">
          <div className="container mx-auto max-w-5xl">
            <div className="text-[1.125rem] leading-[1.65] text-[#363636] [&_strong]:font-bold [&_strong]:text-[#121212] [&>h2]:mb-4 [&>h2]:mt-12 [&>h2]:font-bold [&>h2]:font-heading [&>h2]:text-[1.375rem] [&>h2]:leading-snug [&>h2]:text-navy sm:[&>h2]:text-2xl [&>p]:mb-5 [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:space-y-3 [&>ul]:pl-6 [&>ul>li]:pl-1">
              {children}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default SafetyInformationLayout;
