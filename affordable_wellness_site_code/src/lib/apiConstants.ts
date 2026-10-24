const DEFAULT_API_BASE =
  "https://panel.whitelabelmd.com/affordablewellness/api";

export const API_BASE = (
  import.meta.env.VITE_PRODUCT_SERVER_API || DEFAULT_API_BASE
).replace(/\/$/, "");

export const createPaymentIntent_stripe = `${API_BASE}/stripe/create-payment-intent`;
export const createOrder_stripe = `${API_BASE}/createOrder_stripe`;

export const NEXIRX_PORTAL_PUSH_URL =
  "https://panel.whitelabelmd.com/affordablewellness/api/portal/push";

/** Coupon verification (wlmdbackend v3) — site_id 329 is fixed for Affordable Wellness */
export const CHECK_COUPONS_V3_URL =
  "https://panel.whitelabelmd.com/wlmdbackend/api/check_coupons_v3";
export const AFFORDABLE_WELLNESS_SITE_ID = 329;
