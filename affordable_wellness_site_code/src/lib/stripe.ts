import { loadStripe, type Stripe } from "@stripe/stripe-js";
import axios from "axios";
import { createPaymentIntent_stripe } from "@/lib/apiConstants";

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export const PENDING_STRIPE_ORDER_KEY = "pendingStripeOrderData";

let _stripePromise: Promise<Stripe | null> | null = null;

export const getStripePromise = () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.error(
      "[stripe] VITE_STRIPE_PUBLISHABLE_KEY is empty. Restart the Vite dev server after updating .env.",
    );
    return Promise.resolve(null);
  }
  if (!_stripePromise) {
    _stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return _stripePromise;
};

/** @deprecated prefer getStripePromise() — kept for older imports */
export const stripePromise = getStripePromise();

export const stripeAppearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#2F4A73",
    colorBackground: "#ffffff",
    colorText: "#111111",
    colorDanger: "#ef4444",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e2e8f0",
      padding: "12px 16px",
    },
    ".Input:focus": {
      border: "1px solid #2F4A73",
      boxShadow: "0 0 0 3px rgba(47, 74, 115, 0.2)",
    },
  },
};

export type StripeBillingDefaults = {
  email?: string;
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

export const buildStripeBillingDefaults = (params: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  sameAsShipping?: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateCode: string;
  zipCode: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingStateCode?: string;
  billingZipCode?: string;
}): StripeBillingDefaults => {
  const {
    email,
    firstName,
    lastName,
    phone,
    sameAsShipping = true,
    addressLine1,
    addressLine2,
    city,
    stateCode,
    zipCode,
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingStateCode,
    billingZipCode,
  } = params;

  const shipName = [firstName, lastName]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(" ");
  const phoneDigits = (phone || "").replace(/\D/g, "");

  if (sameAsShipping) {
    return {
      email: (email || "").trim() || undefined,
      name: shipName || undefined,
      phone: phoneDigits || undefined,
      addressLine1: (addressLine1 || "").trim() || undefined,
      addressLine2: (addressLine2 || "").trim() || undefined,
      city: (city || "").trim() || undefined,
      state: (stateCode || "").trim() || undefined,
      postalCode: (zipCode || "").trim() || undefined,
    };
  }

  return {
    email: (email || "").trim() || undefined,
    name: shipName || undefined,
    phone: phoneDigits || undefined,
    addressLine1: (billingAddressLine1 || "").trim() || undefined,
    addressLine2: (billingAddressLine2 || "").trim() || undefined,
    city: (billingCity || "").trim() || undefined,
    state: (billingStateCode || "").trim() || undefined,
    postalCode: (billingZipCode || "").trim() || undefined,
  };
};

export type PaymentIntentPayloadInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  sameAsShipping?: boolean;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  productName: string;
  sku?: string;
  amount: number;
  currency?: string;
  productId: string | number;
  coupon?: string | null;
};

/**
 * PaymentIntent body for panel create-payment-intent.
 * Matches affordablewellness contract (camelCase + snake_case aliases):
 * email, firstName/first_name, lastName/last_name, productName, sku, amount,
 * currency, productId, phone, address, city/city_name, state/state_name, zip/zip_code
 * Uses payment_method_types for card, Link, and Amazon Pay (Klarna is not included).
 */
export const buildPaymentIntentPayload = (input: PaymentIntentPayloadInput) => {
  const firstName = (input.firstName || "").trim();
  const lastName = (input.lastName || "").trim();
  const customerName = [firstName, lastName].filter(Boolean).join(" ");
  const shipLine1 = (input.addressLine1 || "").trim();
  const shipCity = (input.city || "").trim();
  const shipState = (input.state || "").trim();
  const shipZip = (input.zip || "").trim();
  const phoneDigits = (input.phone || "").replace(/\D/g, "");
  const sameAsShipping = input.sameAsShipping !== false;
  const email = (input.email || "").trim();

  if (!customerName || !shipLine1 || !shipCity || !shipState || !shipZip) {
    throw new Error(
      "Complete shipping name and address are required before payment.",
    );
  }

  const shippingAddress = {
    line1: shipLine1,
    ...(input.addressLine2?.trim()
      ? { line2: input.addressLine2.trim() }
      : {}),
    city: shipCity,
    state: shipState,
    postal_code: shipZip,
    country: "US",
  };

  const billingAddress = sameAsShipping
    ? shippingAddress
    : {
        line1: (input.billingAddressLine1 || "").trim(),
        ...(input.billingAddressLine2?.trim()
          ? { line2: input.billingAddressLine2.trim() }
          : {}),
        city: (input.billingCity || "").trim(),
        state: (input.billingState || "").trim(),
        postal_code: (input.billingZip || "").trim(),
        country: "US",
      };

  const resolvedProductName = input.productName || "Medication";
  const amountCents = Math.max(50, Math.floor(Number(input.amount)));

  const body: Record<string, unknown> = {
    // Contract fields (sample payload)
    email,
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
    productName: resolvedProductName,
    sku: input.sku || "",
    amount: amountCents,
    currency: String(input.currency || "usd").toLowerCase(),
    productId: String(input.productId || ""),
    phone: phoneDigits,
    address: shipLine1,
    city: shipCity,
    city_name: shipCity,
    state: shipState,
    state_name: shipState,
    zip: shipZip,
    zip_code: shipZip,
    name: customerName,
    country: "US",
    shipping: {
      name: customerName,
      address: shippingAddress,
    },
    billing_details: {
      name: customerName,
      email,
      phone: phoneDigits,
      address: billingAddress,
    },
    amount_details: {
      line_items: [
        {
          product_name: resolvedProductName,
          unit_cost: amountCents,
          quantity: 1,
        },
      ],
    },
    payment_method_options: {
      klarna: {
        preferred_locale: "en-US",
      },
    },
    setup_future_usage: null,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "always",
    },
  };

  if (input.coupon) {
    body.coupon = input.coupon;
  }

  return body;
};

export const createStripePaymentIntent = async (
  payload: PaymentIntentPayloadInput,
): Promise<string> => {
  const body = buildPaymentIntentPayload(payload);

  console.log(
    "[stripe] create-payment-intent →",
    createPaymentIntent_stripe,
    body,
  );

  const response = await axios.post(createPaymentIntent_stripe, body, {
    headers: { "Content-Type": "application/json" },
  });

  const raw = response.data;
  const clientSecret =
    raw?.clientSecret ??
    raw?.client_secret ??
    raw?.data?.clientSecret ??
    raw?.data?.client_secret ??
    raw?.result?.clientSecret ??
    raw?.result?.client_secret ??
    raw?.stripe_response?.client_secret;

  if (!clientSecret) {
    throw new Error(
      "Failed to create payment intent — no clientSecret returned.",
    );
  }

  return clientSecret as string;
};

export const verifyStripePaymentSucceeded = async (
  paymentIntentId: string,
  clientSecret: string,
) => {
  if (!clientSecret) {
    throw new Error("Missing payment verification secret");
  }

  const stripe = await getStripePromise();
  if (!stripe) {
    throw new Error("Stripe is not loaded");
  }

  const { paymentIntent, error } =
    await stripe.retrievePaymentIntent(clientSecret);

  if (error) {
    throw new Error(error.message || "Could not verify payment");
  }

  if (!paymentIntent || paymentIntent.status !== "succeeded") {
    throw new Error(
      paymentIntent?.status
        ? `Payment not completed (status: ${paymentIntent.status})`
        : "Payment verification failed",
    );
  }

  if (paymentIntentId && paymentIntent.id !== paymentIntentId) {
    throw new Error("Payment intent ID mismatch");
  }

  return paymentIntent;
};
