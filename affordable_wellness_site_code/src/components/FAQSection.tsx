import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What conditions does Affordable Wellness treat?",
    a: "Affordable Wellness focuses on medically supervised weight management through GLP-1 therapies. A licensed provider reviews your health history to determine whether compounded Semaglutide or Tirzepatide is appropriate for you.",
  },
  {
    q: "How is Affordable Wellness different from other telehealth weight loss companies?",
    a: "We publish a full cost breakdown before you pay, keep the same monthly price at every dose, and connect you with US-licensed doctors and pharmacies — without membership layers or surprise fees.",
  },
  {
    q: "What medications do you prescribe?",
    a: "Our providers may prescribe compounded Semaglutide and compounded Tirzepatide when clinically appropriate. All medications are prepared by a 503A licensed US compounding pharmacy.",
  },
  {
    q: "What states are you licensed in?",
    a: "We work with licensed providers who can evaluate patients in most US states. Availability can vary by state — complete the intake to confirm eligibility where you live.",
  },
  {
    q: "Will I be able to speak with a doctor?",
    a: "Yes. Every patient is reviewed by a licensed physician. You can message your care team through the patient portal, and clinical support is available when you need it.",
  },
];

function PlusIcon({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "w-8 h-8 rounded-full border border-[#E5E5E5] bg-[#F9F9F9] flex items-center justify-center shrink-0 transition-transform duration-200",
        open && "rotate-45",
      )}
      aria-hidden
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 2.5V11.5M2.5 7H11.5"
          stroke="#363636"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-10 lg:py-16">
      <PageContainer
        variant="hero"
        className="!pr-5 sm:!pr-10 lg:!pr-[120px] flex flex-col items-start gap-8"
      >
        <h2 className="text-[32px] sm:text-[42px] lg:text-[52px] font-medium leading-[1.2] tracking-[-0.02em] text-[#121212]">
          Your Questions Answered
        </h2>

        <div className="w-full max-w-[1240px]">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q} className="border-b border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium leading-[1.4] tracking-[-0.01em] text-[#121212] group-hover:text-[#2D476F] transition-colors">
                    {faq.q}
                  </span>
                  <PlusIcon open={isOpen} />
                </button>
                {isOpen && (
                  <p className="pb-6 text-base leading-[1.6] text-[#363636] max-w-[900px]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
};

export default FAQSection;
