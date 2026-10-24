import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureAffiliateFromRouter, trackPostAffiliatePageView } from "@/lib/postAffiliateClient";

/**
 * Persists `a_aid` from the URL across the SPA and fires PAP click tracking on each route.
 */
export function PostAffiliateIntegration() {
  const location = useLocation();

  useEffect(() => {
    captureAffiliateFromRouter(location.search, location.hash);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    trackPostAffiliatePageView();
  }, [location.pathname, location.search, location.hash]);

  return null;
}
