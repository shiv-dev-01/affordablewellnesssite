import { useLocation, useNavigate } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import { Button } from "@/components/ui/button";
import resultCard1 from "@/assets/result-card-1.svg";
import resultCard2 from "@/assets/result-card-2.svg";
import resultCard3 from "@/assets/result-card-3.svg";
import resultCard4 from "@/assets/result-card-4.svg";

const StatsSection = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const funnelSearch = mergeAffiliateIntoSearch(search);

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-0 md:px-4 lg:px-8">
        <div className="text-center mb-10 md:mb-16 px-4 md:px-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 text-gray-900">
            Proven Results
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Scientifically backed weight loss, based on evidence—not opinions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 lg:gap-6">
          <div className="animate-fade-in hover-scale">
            <img
              src={resultCard1}
              alt="Weight loss result statistics"
              className="w-full h-auto rounded-none md:rounded-2xl shadow-none md:shadow-md"
            />
          </div>

          <div className="animate-fade-in hover-scale" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <img
              src={resultCard2}
              alt="6X more effective results"
              className="w-full h-auto rounded-none md:rounded-2xl shadow-none md:shadow-md"
            />
          </div>

          <div className="animate-fade-in hover-scale" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <img
              src={resultCard3}
              alt="Waist reduction percentage"
              className="w-full h-auto rounded-none md:rounded-2xl shadow-none md:shadow-md"
            />
          </div>

          <div className="animate-fade-in hover-scale" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <img
              src={resultCard4}
              alt="40% body weight reduction"
              className="w-full h-auto rounded-none md:rounded-2xl shadow-none md:shadow-md"
            />
          </div>
        </div>

        {/* Get Started Button */}
        <div className="flex justify-center mt-12 md:mt-16 px-4 md:px-0">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/questionnaire" + funnelSearch)}
            className="text-base md:text-lg lg:text-xl px-8 md:px-12 py-6 md:py-8 font-bold w-full md:w-auto max-w-md text-white font-semibold"
          >
            Get Started Now →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
