import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PricingTransparencySection from "@/components/PricingTransparencySection";
import ReviewStripSection from "@/components/ReviewStripSection";
import CostComparisonSection from "@/components/CostComparisonSection";
import ValuePropositionSection from "@/components/ValuePropositionSection";
import ProcessSection from "@/components/ProcessSection";
import WhyAffordableSection from "@/components/WhyAffordableSection";
import SwitchSection from "@/components/SwitchSection";
import EmotionalCTASection from "@/components/EmotionalCTASection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash, location.search]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <PricingTransparencySection />
        <ReviewStripSection />
        <CostComparisonSection />
        <ValuePropositionSection />
        <ProcessSection />
        <WhyAffordableSection />
        <SwitchSection />
        <EmotionalCTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
