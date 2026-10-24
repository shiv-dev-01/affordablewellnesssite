/**
 * Build JSON body for POST
 * https://panel.whitelabelmd.com/affordablewellness/api/createOrder_stripe
 *
 * Exact contract:
 * {
 *   email, first_name, last_name, phone,
 *   address, city_name, state_name, zip_code,
 *   start_url, payment_token, product_id,
 *   address2, billing_address, billing_address2,
 *   billing_city_name, billing_state_name, billing_zip_code,
 *   billingSameAsShipping ("YES" | "NO"),
 *   promo_codes (string | null)
 * }
 */
export const buildCreateOrderStripeBody = (params: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  stateCode: string;
  zipCode: string;
  sameAsShipping: boolean;
  billingAddress?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingStateCode?: string;
  billingZipCode?: string;
  productId: string | number;
  promoCodes?: string | null;
  paymentToken: string;
  startUrl?: string;
}) => {
  const {
    email,
    firstName,
    lastName,
    phone,
    address,
    address2,
    city,
    stateCode,
    zipCode,
    sameAsShipping,
    billingAddress,
    billingAddress2,
    billingCity,
    billingStateCode,
    billingZipCode,
    productId,
    promoCodes,
    paymentToken,
    startUrl,
  } = params;

  const parsedProductId = Number(productId);
  const product_id = Number.isFinite(parsedProductId)
    ? parsedProductId
    : productId;

  const body: Record<string, unknown> = {
    email: (email || "").trim(),
    first_name: (firstName || "").trim(),
    last_name: (lastName || "").trim(),
    phone: (phone || "").replace(/\D/g, ""),
    address: (address || "").trim(),
    city_name: (city || "").trim(),
    state_name: (stateCode || "").trim(),
    zip_code: (zipCode || "").trim(),
    start_url:
      startUrl ||
      (typeof window !== "undefined" ? window.location.href : ""),
    payment_token: paymentToken,
    product_id,
    address2: (address2 || "").trim(),
    billingSameAsShipping: sameAsShipping ? "YES" : "NO",
    promo_codes: promoCodes?.trim() ? promoCodes.trim() : null,
  };

  if (sameAsShipping) {
    body.billing_address = body.address;
    body.billing_address2 = body.address2;
    body.billing_city_name = body.city_name;
    body.billing_state_name = body.state_name;
    body.billing_zip_code = body.zip_code;
  } else {
    body.billing_address = (billingAddress || "").trim();
    body.billing_address2 = (billingAddress2 || "").trim();
    body.billing_city_name = (billingCity || "").trim();
    body.billing_state_name = (billingStateCode || "").trim();
    body.billing_zip_code = (billingZipCode || "").trim();
  }

  return body;
};
