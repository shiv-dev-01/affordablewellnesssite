import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import affordableWellnessLogo from "../assets/affordable-wellness-logo.png";
import check_mark from "@/assets/check-mark-thank-you.svg";
import doctor from "@/assets/doctor-icon.svg";
import email_icon from "@/assets/email-icon.svg";
import shipping from "@/assets/shipping-icon.svg";
import { useCheckoutFlow } from "@/context/CheckoutFlowContext";
import { formatStateForOnboardingQuery } from "@/lib/checkoutHelpers";
import CheckoutFooter from "./questions/checkout-footer";

export type OrderData = {
  amount: number | string;
  date: string;
  email: string;
  orderId: string;
  productName: string;
};

function readStoredOrderData(): OrderData | null {
  try {
    const raw = localStorage.getItem("orderData");
    if (!raw || raw === "null") return null;
    const o = JSON.parse(raw) as Partial<OrderData>;
    if (o?.orderId && o?.email) return o as OrderData;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

type ThankYouNavState = { email?: string; orderId?: string | number };

const ThankYou = () => {
  const ONBOARDING_URL = "/onboarding.html";

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const {
    email,
    firstName,
    lastName,
    phone,
    state,
    city,
    addressLine1,
    addressLine2,
    zipCode,
    medicationType,
    calculateFinalPrice,
    productDisplayName,
  } = useCheckoutFlow();

  const [orderData, setOrderData] = useState<OrderData | null>(() =>
    readStoredOrderData(),
  );
  const [resolved, setResolved] = useState(false);

  // redirect effect - starts the countdown only after orderData exists
  // useEffect(() => {
  //   if (!orderData) return;

  //   setSecondsLeft(15);

  //   const intervalId = window.setInterval(() => {
  //     setSecondsLeft((s) => Math.max(0, s - 1));
  //   }, 1000);

  //   const timeoutId = window.setTimeout(() => {
  //     window.location.assign("/onboarding.html"); // ✅ hard navigation
  //   }, 15000);

  //   return () => {
  //     window.clearInterval(intervalId);
  //     window.clearTimeout(timeoutId);
  //   };
  // }, [orderData]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const validatePaymentStatus = (paymentIntentId: string) =>
    fetch(
      `${import.meta.env.VITE_PRODUCT_SERVER_API}/api/stripe/subscription/payment-status?paymentIntentId=${paymentIntentId}`,
    ).then((res) => res.json());

  useEffect(() => {
    let cancelled = false;

    async function resolveOrder() {
      const nav = location.state as ThankYouNavState | null;
      if (nav?.email && nav.orderId != null && String(nav.orderId).trim()) {
        const { total } = calculateFinalPrice();
        const amount =
          parseFloat(String(total).replace(/[^0-9.]/g, "")) || 0;
        const next: OrderData = {
          orderId: String(nav.orderId),
          email: String(nav.email),
          amount,
          productName: productDisplayName || "Order",
          date: new Date().toISOString(),
        };
        if (!cancelled) {
          setOrderData(next);
          localStorage.setItem("orderData", JSON.stringify(next));
        }
        if (!cancelled) setResolved(true);
        return;
      }

      const stored = readStoredOrderData();
      if (stored) {
        if (!cancelled) setOrderData(stored);
        if (!cancelled) setResolved(true);
        return;
      }

      const paymentIntentId = searchParams.get("payment_intent");
      const apiBase = import.meta.env.VITE_PRODUCT_SERVER_API;
      if (paymentIntentId && apiBase) {
        try {
          const res = await validatePaymentStatus(paymentIntentId);
          if (!cancelled && res?.orderId) {
            localStorage.setItem("orderData", JSON.stringify(res));
            setOrderData(res as OrderData);
            if (searchParams.get("redirect_status") === "succeeded") {
              const g = (window as unknown as { gtag?: (...args: unknown[]) => void })
                .gtag;
              g?.("event", "card_success", {
                transaction_id: paymentIntentId,
              });
            }
          }
        } catch {
          /* ignore */
        }
      }
      if (!cancelled) setResolved(true);
    }

    void resolveOrder();
    return () => {
      cancelled = true;
    };
  }, [
    location.state,
    searchParams,
    calculateFinalPrice,
    productDisplayName,
  ]);

  const buildOnboardingUrl = () => {
    const base = new URL(ONBOARDING_URL, window.location.origin).toString();
    const usState = formatStateForOnboardingQuery(state);
    const med = medicationType === "semaglutide" ? "S" : "T";
    const params = new URLSearchParams();
    if (usState) params.set("usState", usState);
    if (firstName) params.set("fullName[first]", firstName);
    if (lastName) params.set("fullName[last]", lastName);
    if (email) params.set("email", email);
    if (phone) params.set("phoneNumber", phone);
    if (city) params.set("address[city]", city);
    if (zipCode) params.set("address[postal]", zipCode);
    const line1 = [addressLine1, addressLine2].filter(Boolean).join(",");
    if (line1) params.set("address[addr_line1]", line1);
    params.set("med", med);
    const q = params.toString();
    return q ? `${base}?${q}` : base;
  };

  return (
    <main
      id="main-content"
      role="main"
      className="min-h-screen bg-background py-6 md:py-4 px-0 md:px-4 relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-xl relative z-10 px-0 md:px-4">
        {/* Logo */}
        <div className="flex justify-center mb-4 md:mb-4 px-4 md:px-0">
          <img
            src={affordableWellnessLogo}
            alt="Affordable Wellness Logo"
           className="h-8 md:h-[3rem] object-contain"
          />
        </div>

        {/* Thank You Card */}
        {orderData ? (
          <div className="min-h-screen flex flex-col items-center pt-1 pb-16">
            {/* Card */}
            <main className="relative mt-8 w-full max-w-xl rounded-3xl bg-card shadow-2xl border border-border">
              {/* Floating Image Badge */}
              <div className="absolute left-1/2 -top-8 -translate-x-1/2">
                <img
                  src={check_mark}
                  alt="Order Success"
                  className="w-13 h-13 object-contain"
                />
              </div>

              {/* Top gradient header */}
              <div className="rounded-t-3xl bg-gradient-to-r from-primary to-primary/85 px-8 pt-12 pb-8 text-center text-primary-foreground">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Thank you for your order!
                </h1>
                <p className="mt-2 text-sm md:text-base text-primary-foreground/90">
                  Your order has been received
                </p>

                {/* Order number pill */}
                <div className="rounded-full bg-card px-4 py-1 mt-2 inline-flex items-center justify-center border border-primary/20 shadow-sm">
                  <span className="mr-2 text-xs md:text-sm text-foreground">
                    Order Number:
                  </span>
                  <span className="text-base md:text-md font-semibold text-primary shadow-sm">
                    #{orderData.orderId}
                  </span>
                </div>

                <p className="mt-2 text-[11px] md:text-sm text-primary-foreground/90">
                  An email confirmation has been sent to{" "}
                  <span className="font-medium">{orderData.email}</span>
                </p>
              </div>

              {/* Order details */}
              <section className="px-8 py-6 text-xs md:text-sm text-foreground">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {new Date(orderData.date).toLocaleDateString(
                      "default",
                      options,
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">E-mail</span>
                  <span>{orderData.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Total</span>
                  <span>
                    $
                    {typeof orderData.amount === "number"
                      ? orderData.amount.toFixed(2)
                      : orderData.amount}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Purchased plan</span>
                  <span>{orderData.productName}</span>
                </div>
              </section>

              <div className="mt-4 flex flex-col items-center gap-2">
                {/* <button
                  type="button"
                  onClick={() => {
                    window.location.assign(buildOnboardingUrl());
                  }}
                  className="
                                max-w-[550px] px-6 py-5
                                relative overflow-hidden
                                inline-flex items-center justify-center
                                rounded-[2vw] md:rounded-[0.7vw] 
                                text-sm md:text-base font-semibold text-primary-foreground
                                bg-gradient-to-r from-primary to-primary/85
                                hover:from-primary/95 hover:to-primary/75
                                shadow-md
                                transition-all "
                >
                  Continue to Onboarding
                  <span className="absolute inset-0 pointer-events-none animate-shine bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.5)_50%,transparent_65%)] bg-[length:200%_100%]"></span>
                </button> */}

                {/* <p className="text-xs text-slate-500">
                  Redirecting automatically in{" "}
                  <span className="font-semibold">{secondsLeft}s</span>…
                </p> */}
              </div>

              {/* Next Steps */}
              <section className="px-8 pb-6 mt-5">
                <h2 className="mb-4 text-center text-sm md:text-2xl font-extrabold text-primary">
                  Next Steps
                </h2>

                <div className="space-y-3 text-xs md:text-sm text-foreground">
                  {/* Step 1 */}
                  <div className="step-card step-delay-1  min-h-24 flex items-center gap-5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.8vw] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-extrabold">
                      1
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-1">
                      <div>
                        <p className="font-semibold text-foreground">
                          Complete your medical intake
                        </p>
                        <p className="mt-1 text-[11px] md:text-xs text-muted-foreground">
                          Log in to your member portal and complete your medical
                          intake form.
                        </p>
                      </div>
                      <img
                        src={email_icon}
                        alt="Medical Intake"
                        className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0"
                      />
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="step-card step-delay-2 min-h-24 flex items-center gap-5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.8vw] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-extrabold">
                      2
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-1">
                      <div>
                        <p className="font-semibold text-foreground">
                          Doctor review &amp; approval
                        </p>
                        <p className="mt-1 text-[11px] md:text-xs text-muted-foreground">
                          A physician licensed in your state will review your
                          medical intake and issue the prescription if eligible.
                        </p>
                      </div>
                      <img
                        src={doctor}
                        alt="Doctor Review"
                        className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0"
                      />
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="step-card step-delay-3 min-h-24 flex items-center gap-5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.8vw] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-extrabold">
                      3
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-1">
                      <div>
                        <p className="font-semibold text-foreground">
                          Shipping &amp; tracking
                        </p>
                        <p className="mt-1 text-[11px] md:text-xs text-muted-foreground">
                          Shipment will be sent within one day of approval, and
                          we&apos;ll share tracking information once it&apos;s
                          on the way.
                        </p>
                      </div>
                      <img
                        src={shipping}
                        alt="Shipping and Tracking"
                        className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mt-6 h-px w-full bg-border"></div>

                {/* Footer */}
                <div className="mt-4 pb-2 text-center text-[11px] md:text-xs text-muted-foreground">
                  <p>
                    <span className="font-bold">Questions?</span> Our support
                    team is here to help.
                  </p>
                  <p>Contact us at support@affordablewellness.com</p>
                </div>
                {/* Animations for steps */}
                <style>{`
    @keyframes stepFadeUp {
      0% {
        opacity: 0;
        transform: translateY(12px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .step-card {
      opacity: 0;
      animation-name: stepFadeUp;
      animation-duration: 0.6s;
      animation-timing-function: ease-out;
      animation-fill-mode: forwards;
    }

    .step-delay-1 {
      animation-delay: 0.1s;
    }

    .step-delay-2 {
      animation-delay: 0.25s;
    }

    .step-delay-3 {
      animation-delay: 0.4s;
    }

    .step-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px hsl(var(--primary) / 0.14);
      transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    }
  `}</style>
              </section>
            </main>
          </div>
        ) : !resolved ? (
          <div className="flex items-center justify-center">
            <div className="py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-foreground font-medium">
              We couldn&apos;t load your order confirmation.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              If you just completed checkout, go back to payment or contact
              support. Otherwise you can return home.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block text-sm font-semibold text-primary underline underline-offset-2"
            >
              Return home
            </Link>
          </div>
        )}
      </div>
      <CheckoutFooter />
    </main>
  );
};

export default ThankYou;
