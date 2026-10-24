import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TrendingDown, Loader2 } from "lucide-react";
import affordableWellnessLogo from "@/assets/affordable-wellness-logo.png";
import { useToast } from "@/hooks/use-toast";
import CheckOutHeader from "@/components/CheckOutHeader";
import CheckoutReservedTimer from "@/components/checkout/CheckoutReservedTimer";
import StripeCheckoutForm, {
  type StripeCheckoutFormHandle,
} from "@/components/StripeCheckoutForm";
import { useCheckoutFlow } from "@/context/CheckoutFlowContext";
import CheckoutFooter from "./questions/checkout-footer";
import tirzepatideImage from "@/assets/tirzepatide-bottle.png";
import semaglutideImage from "@/assets/semaglutide-bottle.png";
import { formatSavingsUsdDisplay, normalizeStateCode } from "@/lib/checkoutHelpers";
import {
  buildStripeBillingDefaults,
  createStripePaymentIntent,
  getStripePromise,
  PENDING_STRIPE_ORDER_KEY,
  stripeAppearance,
  verifyStripePaymentSucceeded,
} from "@/lib/stripe";
import {
  buildReturnUrl,
  cleanStripeReturnParamsFromUrl,
  getStripeReturnParams,
  saveCheckoutSnapshot,
} from "@/lib/stripeCheckoutSession";

const Payment = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { toast } = useToast();
  const bootOnce = useRef(false);
  const stripeRedirectHandledRef = useRef(false);
  const checkoutFormRef = useRef<StripeCheckoutFormHandle | null>(null);
  const pendingConfirmPaymentMethodRef = useRef<string | null>(null);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null,
  );
  const [stripePaymentError, setStripePaymentError] = useState<string | null>(
    null,
  );
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [pendingPlanOverride, setPendingPlanOverride] = useState<string | null>(
    null,
  );

  const {
    isHydrated,
    tryRestoreFromStorage,
    medicationType,
    selectedPlan,
    setSelectedPlan,
    email,
    firstName,
    lastName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    differentBilling,
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingState,
    billingZipCode,
    isSubmitting,
    setIsSubmitting,
    calculateFinalPrice,
    getPricePerDay,
    getProductByPlan,
    calculateSavings,
    appliedCoupon,
    couponCode,
    calculateDiscountedPrice,
    validateOrderBeforePayment,
    submitOrder,
    buildPendingStripeOrder,
    createOrderFromPendingData,
    getPricingForPlan,
    productDisplayName,
    getPlanShippingInterval,
  } = useCheckoutFlow();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isHydrated) return;
    if (bootOnce.current) return;
    bootOnce.current = true;
    if (!tryRestoreFromStorage()) {
      navigate(`/questionnaire${mergeAffiliateIntoSearch(search)}`);
    }
  }, [isHydrated, tryRestoreFromStorage, navigate, search]);

  const activePlan = pendingPlanOverride || selectedPlan;

  const orderSummary = useMemo(() => {
    const pricing = getPricingForPlan(activePlan);
    if (pricing) {
      return {
        subtotal: pricing.subtotal.toFixed(2),
        discount: pricing.discount.toFixed(2),
        total: pricing.finalPrice.toFixed(2),
      };
    }
    return calculateFinalPrice();
  }, [activePlan, getPricingForPlan, calculateFinalPrice]);

  const amountInCents = useMemo(() => {
    const pricing = getPricingForPlan(activePlan);
    if (pricing) return Math.round(pricing.finalPrice * 100);
    const total = parseFloat(orderSummary.total);
    return Math.round(total * 100);
  }, [activePlan, getPricingForPlan, orderSummary.total]);

  const isFullyDiscounted =
    Boolean(appliedCoupon) &&
    (amountInCents <= 0 ||
      parseFloat(String(appliedCoupon.discount_percent || 0)) >= 100);

  const productForIntent = useMemo(
    () => getProductByPlan(activePlan),
    [getProductByPlan, activePlan],
  );

  const hasShippingForStripe = useMemo(
    () =>
      Boolean(
        firstName.trim() &&
          lastName.trim() &&
          addressLine1.trim() &&
          city.trim() &&
          state &&
          zipCode.trim().length === 5 &&
          email.includes("@"),
      ),
    [firstName, lastName, addressLine1, city, state, zipCode, email],
  );

  const stripeBillingDefaults = useMemo(
    () =>
      buildStripeBillingDefaults({
        email,
        firstName,
        lastName,
        phone,
        sameAsShipping: !differentBilling,
        addressLine1,
        addressLine2,
        city,
        stateCode: normalizeStateCode(state),
        zipCode,
        billingAddressLine1,
        billingAddressLine2,
        billingCity,
        billingStateCode: normalizeStateCode(billingState),
        billingZipCode,
      }),
    [
      email,
      firstName,
      lastName,
      phone,
      differentBilling,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      billingAddressLine1,
      billingAddressLine2,
      billingCity,
      billingState,
      billingZipCode,
    ],
  );

  const getStripePaymentPayload = useCallback(() => {
    const pricing = getPricingForPlan(activePlan);
    if (!pricing) {
      throw new Error("Please select a product first");
    }
    return {
      email,
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state: normalizeStateCode(state),
      zip: zipCode,
      sameAsShipping: !differentBilling,
      billingAddressLine1,
      billingAddressLine2,
      billingCity,
      billingState: normalizeStateCode(billingState),
      billingZip: billingZipCode,
      productName: pricing.product.product_name || productDisplayName,
      sku: pricing.product.sku || "",
      amount: Math.round(pricing.finalPrice * 100),
      currency: "usd",
      productId: pricing.product.product_id,
      coupon: appliedCoupon ? couponCode : null,
    };
  }, [
    activePlan,
    getPricingForPlan,
    email,
    firstName,
    lastName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    differentBilling,
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingState,
    billingZipCode,
    productDisplayName,
    appliedCoupon,
    couponCode,
  ]);

  const initStripePaymentIntent = useCallback(async () => {
    if (!hasShippingForStripe || !productForIntent || isFullyDiscounted) return;

    setIsCreatingPaymentIntent(true);
    setStripePaymentError(null);
    try {
      const secret = await createStripePaymentIntent(getStripePaymentPayload());
      setStripeClientSecret(secret);
    } catch (error) {
      setStripeClientSecret(null);
      setStripePaymentError(
        error instanceof Error
          ? error.message
          : "Could not load payment form. Please try again.",
      );
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  }, [
    hasShippingForStripe,
    productForIntent,
    isFullyDiscounted,
    getStripePaymentPayload,
  ]);

  useEffect(() => {
    if (!isHydrated || !hasShippingForStripe || !productForIntent) return;
    if (isFullyDiscounted) {
      setStripeClientSecret(null);
      setStripePaymentError(null);
      setIsCreatingPaymentIntent(false);
      return;
    }
    void initStripePaymentIntent();
    // Recreate intent when amount/plan/coupon/shipping identity changes — not on every callback identity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isHydrated,
    hasShippingForStripe,
    isFullyDiscounted,
    activePlan,
    amountInCents,
    appliedCoupon,
    email,
    firstName,
    lastName,
    addressLine1,
    city,
    state,
    zipCode,
    productForIntent?.product_id,
  ]);

  const persistPendingOrder = useCallback(() => {
    const pending = buildPendingStripeOrder(activePlan);
    if (!pending) return;
    const pendingJson = JSON.stringify(pending);
    sessionStorage.setItem(PENDING_STRIPE_ORDER_KEY, pendingJson);
    localStorage.setItem(PENDING_STRIPE_ORDER_KEY, pendingJson);
    saveCheckoutSnapshot(pending);
  }, [buildPendingStripeOrder, activePlan]);

  const finalizeStripeOrder = useCallback(
    async (paymentToken: string, clientSecret: string) => {
      setIsSubmitting(true);
      try {
        if (clientSecret) {
          await verifyStripePaymentSucceeded(paymentToken, clientSecret);
        }

        const pendingRaw =
          sessionStorage.getItem(PENDING_STRIPE_ORDER_KEY) ||
          localStorage.getItem(PENDING_STRIPE_ORDER_KEY);
        const pendingData = pendingRaw ? JSON.parse(pendingRaw) : null;

        if (pendingData) {
          await createOrderFromPendingData(paymentToken, pendingData);
        } else {
          await submitOrder(paymentToken, activePlan);
        }

        sessionStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
        localStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
        cleanStripeReturnParamsFromUrl();
      } catch (error) {
        toast({
          title: "Order Creation Failed",
          description:
            error instanceof Error
              ? error.message
              : "Unable to create order after payment.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      setIsSubmitting,
      createOrderFromPendingData,
      submitOrder,
      activePlan,
      toast,
    ],
  );

  useEffect(() => {
    if (stripeRedirectHandledRef.current) return;
    const { paymentIntentId, clientSecret, redirectStatus } =
      getStripeReturnParams();
    if (!paymentIntentId || !redirectStatus) return;

    stripeRedirectHandledRef.current = true;

    if (redirectStatus !== "succeeded") {
      cleanStripeReturnParamsFromUrl();
      toast({
        title: "Payment Failed",
        description: "Payment was not successful. Please try again.",
        variant: "destructive",
      });
      return;
    }

    void finalizeStripeOrder(paymentIntentId, clientSecret || "");
  }, [finalizeStripeOrder, toast]);

  const formatPrice = (price: number | string) => {
    const n = typeof price === "string" ? parseFloat(price) : price;
    if (Number.isNaN(n)) return "0";
    return n.toFixed(2).replace(/\.00$/, "").replace(/\.0$/, "");
  };

  const handlePayClickGate = () => {
    if (!validateOrderBeforePayment()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return false;
    }
    if (selectedPlan === "monthly" && !pendingPlanOverride) {
      setShowSavingsModal(true);
      return false;
    }
    return true;
  };

  const completeZeroDollarOrder = useCallback(async () => {
    if (!validateOrderBeforePayment()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitOrder("123", activePlan);
    } catch (error) {
      toast({
        title: "Order Creation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateOrderBeforePayment,
    toast,
    setIsSubmitting,
    submitOrder,
    activePlan,
  ]);

  const confirmWithPaymentMethod = useCallback(
    async (paymentMethodId: string, clientSecret: string) => {
      persistPendingOrder();
      setIsSubmitting(true);
      try {
        const stripe = await getStripePromise();
        if (!stripe) throw new Error("Stripe is not loaded");
        const { error, paymentIntent } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method: paymentMethodId,
            return_url: buildReturnUrl(),
          },
          redirect: "if_required",
        });
        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message || "Payment was not successful.",
            variant: "destructive",
          });
          return;
        }
        if (paymentIntent?.status === "succeeded" && paymentIntent.id) {
          await finalizeStripeOrder(
            paymentIntent.id,
            paymentIntent.client_secret || clientSecret,
          );
        } else {
          toast({
            title: "Payment Failed",
            description: "Payment was not successful. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Payment Failed",
          description:
            error instanceof Error
              ? error.message
              : "Unable to complete payment.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistPendingOrder, setIsSubmitting, finalizeStripeOrder, toast],
  );

  const payWithPlanFromModal = async (plan: string) => {
    setShowSavingsModal(false);
    setPendingPlanOverride(plan);

    const stayingOnCurrentPlan = plan === "monthly" || plan === selectedPlan;
    if (stayingOnCurrentPlan) {
      persistPendingOrder();
      await checkoutFormRef.current?.resumePayment();
      return;
    }

    const paymentMethodId =
      await checkoutFormRef.current?.capturePaymentMethod();
    if (!paymentMethodId) {
      toast({
        title: "Payment details needed",
        description: "Please check your card details and try checkout again.",
        variant: "destructive",
      });
      return;
    }

    pendingConfirmPaymentMethodRef.current = paymentMethodId;
    setStripeClientSecret(null);
    setSelectedPlan(plan);
  };

  useEffect(() => {
    const paymentMethodId = pendingConfirmPaymentMethodRef.current;
    if (!paymentMethodId) return;
    if (isCreatingPaymentIntent || !stripeClientSecret) return;
    pendingConfirmPaymentMethodRef.current = null;
    void confirmWithPaymentMethod(paymentMethodId, stripeClientSecret);
  }, [
    stripeClientSecret,
    isCreatingPaymentIntent,
    confirmWithPaymentMethod,
  ]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-slate-600">Loading checkout…</p>
      </div>
    );
  }

  const planKey = (
    ["monthly", "3-month", "6-month", "12-month"].includes(selectedPlan)
      ? selectedPlan
      : "12-month"
  ) as "monthly" | "3-month" | "6-month" | "12-month";

  const productData = {
    name: productDisplayName,
    plans: {
      monthly: { shippingInterval: getPlanShippingInterval("monthly") },
      "3-month": { shippingInterval: getPlanShippingInterval("3-month") },
      "6-month": { shippingInterval: getPlanShippingInterval("6-month") },
      "12-month": { shippingInterval: getPlanShippingInterval("12-month") },
    },
  };

  const shippingInterval =
    productData.plans[planKey]?.shippingInterval ||
    getPlanShippingInterval(planKey);

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

  return (
    <div className="checkout-flow flex min-h-screen flex-col">
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-base font-medium text-slate-800">
            Processing your payment...
          </p>
          <p className="mt-1 text-sm text-slate-500">Please do not close this window.</p>
        </div>
      )}

      <CheckOutHeader />
      <main
        role="main"
        id="main-content"
        className="mx-auto w-full max-w-xl flex-1 px-4 py-8 md:px-6"
      >
        <section className="w-full max-w-xl m-auto mb-6">
          <div className="mx-auto mb-4">
            <div className="flex items-center justify-between text-xs md:text-sm font-semibold font-heading">
              <div className="flex-1 text-center">
                <p className="text-primary">Approval</p>
                <div className="mt-1 h-[4px] bg-primary" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-primary">Shipping</p>
                <div className="mt-1 h-[4px] bg-primary" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-primary">Payment</p>
                <div className="mt-1 h-[4px] bg-primary" />
              </div>
            </div>
          </div>
          <CheckoutReservedTimer />
        </section>

        <div className="px-0">
          <Card className="rounded-[2rem] border border-border bg-card p-5 md:p-6">
            <section className="w-full">
              <div className="mx-auto md:px-0">
                <div className="flex flex-wrap md:flex-row items-start gap-3 lg:gap-3">
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <img
                      src={
                        medicationType === "semaglutide"
                          ? semaglutideImage
                          : tirzepatideImage
                      }
                      alt=""
                      className="h-36 w-auto md:h-36 object-contain"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h2 className="flex text-xl md:text-xl font-bold text-slate-900">
                        {productData.name}
                      </h2>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xl font-bold text-slate-900 leading-none">
                          ${getPricePerDay()}
                          <span className="text-[11px] md:text-xs text-slate-900 mt-1">
                            /day
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[11px] md:text-xs text-slate-500 leading-snug">
                        {shippingInterval}
                      </p>
                      <div className="h-px w-full bg-slate-200 my-2 md:my-2" />
                      <div>
                        <div className="w-full flex items-center justify-between text-xs">
                          <span className="capitalize">{activePlan} Plan</span>
                          <span className="text-slate-600">
                            ${orderSummary.subtotal}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Discount</span>
                          <span className="font-semibold text-green-700">
                            INCLUDED
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Online Clinician Visit</span>
                          <span className="text-slate-500">
                            <span className="line-through mr-1">$49.00</span>
                            <span className="font-semibold text-green-700">
                              INCLUDED
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Shipping 1-5 days from approval</span>
                          <span className="text-slate-500">
                            <span className="line-through mr-1">$19.99</span>
                            <span className="font-semibold text-green-700">
                              INCLUDED
                            </span>
                          </span>
                        </div>
                        {appliedCoupon && parseFloat(orderSummary.discount) > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold">
                              Coupon
                              {couponCode ? ` (${couponCode})` : ""}
                            </span>
                            <span className="font-bold text-green-700">
                              -${orderSummary.discount}
                              {parseFloat(appliedCoupon.discount_percent) > 0
                                ? ` (${appliedCoupon.discount_percent}% off)`
                                : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div className="space-y-1">
              <section className="w-full">
                <div className=" text-slate-800 text-sm md:text-sm">
                  <div className="h-px w-full bg-slate-200 my-2 md:my-2" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl md:text-xl font-bold text-slate-900">
                        Total Due
                      </p>
                    </div>
                    <div className="text-right leading-1">
                      <p className="text-xl md:text-xl font-bold text-slate-900">
                        ${orderSummary.total}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </Card>
        </div>

        <div className="w-full max-w-xl m-auto px-2 md:px-0 pt-4">
          <div className="mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              &nbsp;Payment Details
            </h1>
            <p className="text-sm md:text-base text-slate-900">
              &nbsp;&nbsp;Secure checkout • SSL encrypted
            </p>
          </div>
          <Card className="p-4 md:p-4 border-2 md:border-2 border-y-2 border-x-2 md:border-x-2 border-primary/30 bg-secondary/50 rounded-xl md:rounded-xl">
            {isFullyDiscounted ? (
              <Button
                type="button"
                className="mx-auto flex w-full max-w-[350px] h-auto py-5 px-5 text-base font-semibold rounded-full bg-[#2D476F] text-white shadow-md hover:bg-[#243247] active:scale-[0.98]"
                disabled={isSubmitting}
                onClick={() => void completeZeroDollarOrder()}
              >
                Complete Secure Checkout — $0.00
              </Button>
            ) : (
              <>
                {!stripePublishableKey && (
                  <div className="mb-3 space-y-2">
                    <p className="text-sm text-red-500">
                      Stripe publishable key is missing. Add{" "}
                      <code className="text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code>{" "}
                      to <code className="text-xs">.env</code>, then restart{" "}
                      <code className="text-xs">npm run dev</code>.
                    </p>
                  </div>
                )}

                {stripePaymentError && (
                  <div className="mb-3 space-y-2">
                    <p className="text-sm text-red-500">{stripePaymentError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void initStripePaymentIntent()}
                    >
                      Retry payment setup
                    </Button>
                  </div>
                )}

                {isCreatingPaymentIntent && (
                  <p className="text-sm text-slate-600 py-4 text-center">
                    Loading secure payment…
                  </p>
                )}

                {stripePublishableKey && stripeClientSecret && (
                  <Elements
                    key={stripeClientSecret}
                    stripe={getStripePromise()}
                    options={{
                      clientSecret: stripeClientSecret,
                      appearance: stripeAppearance,
                    }}
                  >
                    <StripeCheckoutForm
                      ref={checkoutFormRef}
                      amountInCents={amountInCents}
                      billingDefaults={stripeBillingDefaults}
                      disabled={isSubmitting}
                      onValidateBilling={handlePayClickGate}
                      onPersistCheckoutSnapshot={persistPendingOrder}
                      onPaymentSuccess={(paymentToken, clientSecret) =>
                        finalizeStripeOrder(paymentToken, clientSecret)
                      }
                      onExpressPaymentSuccess={(paymentToken, clientSecret) =>
                        finalizeStripeOrder(paymentToken, clientSecret)
                      }
                    />
                  </Elements>
                )}

                {stripePublishableKey &&
                  !stripeClientSecret &&
                  !isCreatingPaymentIntent &&
                  !stripePaymentError && (
                    <p className="text-sm text-slate-600 py-4 text-center">
                      Preparing payment options…
                    </p>
                  )}
              </>
            )}
          </Card>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-700 pt-2 md:pt-3">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              Secured by 256-bit SSL encryption
            </span>
          </div>

          <p className="text-xs text-slate-700 text-center leading-5 pt-2 px-2">
            By completing checkout, you agree to our{" "}
            <a
              href="/termsofservice"
              className="font-semibold underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
            >
              Terms
            </a>{" "}
            and authorize recurring payments according to your selected plan.
          </p>
        </div>

        <Dialog open={showSavingsModal} onOpenChange={setShowSavingsModal}>
          <DialogContent className="max-w-xl w-[95vw] sm:w-full p-0 overflow-hidden rounded-2xl border border-[#2D476F]/15 bg-white font-[Manrope,Inter,sans-serif] max-h-[90vh] overflow-y-auto [&>button]:right-4 [&>button]:top-4 [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100 [&>button]:focus:ring-[#2D476F]">
            <div className="bg-[#2D476F] text-white p-5 sm:p-6 text-center">
              <div className="flex justify-center mb-3 sm:mb-4">
                <img
                  src={affordableWellnessLogo}
                  alt="Affordable Wellness"
                  className="h-9 sm:h-10 w-auto max-w-[160px] object-contain brightness-0 invert"
                />
              </div>
              <DialogTitle className="text-xl sm:text-2xl md:text-[28px] font-semibold tracking-[-0.02em] text-white mb-1.5 sm:mb-2 px-2">
                Wait! Unlock Huge Savings
              </DialogTitle>
              <p className="text-sm sm:text-base text-white/85 tracking-[-0.01em] px-2">
                Switch to a multi-month plan and save on your weight loss
                journey
              </p>
            </div>
            <div className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 bg-[#F8F7F3]">
              {(["3-month", "6-month", "12-month"] as const).map((plan) => {
                const product = getProductByPlan(plan);
                if (!product) return null;
                const savings = calculateSavings(plan);
                const discountedPrice = calculateDiscountedPrice(plan);
                return (
                  <Card
                    key={plan}
                    className="p-3.5 sm:p-4 rounded-xl border border-[#E8E6E1] shadow-none hover:border-[#2D476F]/40 transition-all cursor-pointer hover:shadow-md bg-white"
                    onClick={() => void payWithPlanFromModal(plan)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                      <div className="flex-1 w-full sm:w-auto min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-[#121212] tracking-[-0.01em]">
                          {plan === "12-month"
                            ? "🏆 12-Month Plan"
                            : plan === "6-month"
                              ? "⚡ 6-Month Plan"
                              : "3-Month Plan"}
                        </h3>
                        <p className="text-xs sm:text-sm mt-1">
                          {discountedPrice &&
                          discountedPrice < parseFloat(product.price) ? (
                            <>
                              <span className="line-through text-[#9A9A9A] mr-2">
                                ${formatPrice(product.price)}
                              </span>
                              <span className="text-[#2D476F] font-semibold">
                                ${formatPrice(discountedPrice)} total
                              </span>
                            </>
                          ) : (
                            <span className="text-[#121212] font-semibold">
                              ${formatPrice(product.price)} total
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#6B6B6B] mt-1 tracking-[-0.01em]">
                          Save ${formatSavingsUsdDisplay(savings)} vs. monthly
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4F7E7] text-[#2D476F] font-semibold text-xs sm:text-sm px-3 py-1.5">
                        <TrendingDown className="w-4 h-4" />
                        {plan === "12-month"
                          ? "Best Value"
                          : plan === "6-month"
                            ? "Better Value"
                            : "Great Value"}
                      </div>
                    </div>
                  </Card>
                );
              })}
              <div className="pt-1 space-y-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-11 rounded-full border-[#D4D2CC] bg-white text-[#121212] font-semibold text-sm tracking-[-0.01em] hover:bg-[#F8F7F3] hover:text-[#121212]"
                  disabled={isSubmitting}
                  onClick={() => void payWithPlanFromModal("monthly")}
                >
                  No thanks, continue with monthly plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <CheckoutFooter />
      </main>
    </div>
  );
};

export default Payment;
