import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Questionnaire from "./pages/Questionnaire";
import Plans from "./pages/Plans";
import Shipping from "./pages/Shipping";
import Payment from "./pages/Payment";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import ReturnsAndRefund from "./pages/ReturnsAndRefund";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CCPA from "./pages/CCPA";
import TelehealthConsent from "./pages/TelehealthConsent";
import HipaaNotice from "./pages/HipaaNotice";
import { CheckoutFlowProvider } from "./context/CheckoutFlowContext";
import { LowStockBannerProvider } from "./components/LowStockBanner";
import ThankYou3 from "./pages/ThankYou3";
import ImportantSafetyInformationSemaglutide from "./pages/ImportantSafetyInformationSemaglutide";
import ImportantSafetyInformationTirzepatide from "./pages/ImportantSafetyInformationTirzepatide";
import { SAFETY_INFO_ROUTES } from "./lib/safetyInformationRoutes";
// import { PostAffiliateIntegration } from "./components/PostAffiliateIntegration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <PostAffiliateIntegration /> */}
        <CheckoutFlowProvider>
          <LowStockBannerProvider initialMinutes={15}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/questionnaire/:step?" element={<Questionnaire />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/payment" element={<Payment />} />
              {/* <Route path="/thank-you" element={<ThankYou />} /> */}
              <Route path="/thank-you" element={<ThankYou3 />} />
              <Route path="/returnsandrefund" element={<ReturnsAndRefund />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/ccpa" element={<CCPA />} />
              <Route path="/telehealth-consent" element={<TelehealthConsent />} />
              <Route
                path="/telehealthconsent"
                element={<Navigate to="/telehealth-consent" replace />}
              />
              <Route path="/hipaa" element={<HipaaNotice />} />
              <Route
                path="/hipaanotice"
                element={<Navigate to="/hipaa" replace />}
              />
              <Route
                path={SAFETY_INFO_ROUTES.semaglutide}
                element={<ImportantSafetyInformationSemaglutide />}
              />
              <Route
                path={SAFETY_INFO_ROUTES.tirzepatide}
                element={<ImportantSafetyInformationTirzepatide />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LowStockBannerProvider>
        </CheckoutFlowProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
