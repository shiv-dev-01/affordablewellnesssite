import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Check, Info, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatStateForOnboardingQuery } from "@/lib/checkoutHelpers";
import { useCheckoutFlow } from "@/context/CheckoutFlowContext";
import logo from "../assets/affordable-wellness-logo.png";

const ONBOARDING_BASE = "https://www.affordablewellness.com/onboarding/";

/** Brand theme */
const BRAND_LIME = "#E8ED92";
const BRAND_NAVY = "#2F4A73";

type ProgressStatus = "complete" | "next" | "pending";

const PROGRESS_STEPS: {
  label: string;
  status: ProgressStatus;
}[] = [
  { label: "Payment received", status: "complete" },
  { label: "Medical intake", status: "next" },
  { label: "Clinician review", status: "pending" },
  { label: "Prescription and fulfillment", status: "pending" },
];

const statusLabel: Record<ProgressStatus, string> = {
  complete: "Complete",
  next: "Next",
  pending: "Pending",
};

  type ThankYouNavState = {
  email?: string;
  orderId?: string | number;
  uniqueId?: string | number;
  amount?: number;
  currency?: string;
  productId?: string | number;
  productName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  medicationType?: "semaglutide" | "tirzepatide";
  gender?: string;
  dobMonth?: string;
  dobDay?: string;
  dobYear?: string;
  heightFeet?: string;
  heightInches?: string;
  weight?: string;
  loginToken?: string;
};

const ThankYou3 = () => {
  const location = useLocation();
  const nav = (location.state || {}) as ThankYouNavState;
  const checkout = useCheckoutFlow();

  const email =
    nav.email ||
    checkout.email ||
    "your email";

  const orderIdFromNav = nav.orderId;
  const orderId =
    orderIdFromNav != null && String(orderIdFromNav).trim() !== ""
      ? orderIdFromNav
      : undefined;

  const orderSuccessful =
    orderId !== undefined &&
    orderId !== null &&
    String(orderId).trim() !== "";

  const orderAmount = nav.amount;
  const currency = nav.currency || "USD";
  const productId = nav.productId;

  const firstName = nav.firstName || checkout.firstName || "";
  const lastName = nav.lastName || checkout.lastName || "";
  const phone = (nav.phone || checkout.phone || "").replace(/\D/g, "");
  const state = nav.state || checkout.state || "";
  const city = nav.city || checkout.city || "";
  const zipCode = nav.zipCode || checkout.zipCode || "";
  const addressLine1 = nav.addressLine1 || checkout.addressLine1 || "";
  const addressLine2 = nav.addressLine2 || checkout.addressLine2 || "";
  const medicationType =
    nav.medicationType || checkout.medicationType || "tirzepatide";
  const gender = nav.gender || checkout.gender || "";
  const dobMonth = nav.dobMonth || checkout.dobMonth || "";
  const dobDay = nav.dobDay || checkout.dobDay || "";
  const dobYear = nav.dobYear || checkout.dobYear || "";
  const heightFeet = nav.heightFeet || checkout.heightFeet || "";
  const heightInches =
    nav.heightInches != null && String(nav.heightInches) !== ""
      ? String(nav.heightInches)
      : checkout.heightInches || "";
  const weight = nav.weight || checkout.weight || "";
  const loginToken = nav.loginToken || "";

  const intakeUrl = useMemo(() => {
    const params = new URLSearchParams();
    const id = orderId != null ? String(orderId) : "";
    if (id) {
      params.set("order_id", id);
      params.set("unique_id", id);
    }
    params.set("op", "intake");
    if (firstName) params.set("fullName[0]", firstName);
    if (lastName) params.set("fullName[1]", lastName);
    if (email && email !== "your email") params.set("email", email);
    if (phone) params.set("phone", phone);
    const usState = formatStateForOnboardingQuery(state);
    if (usState) params.set("usState", usState);
    if (city) params.set("address[city]", city);
    if (zipCode) params.set("address[postal]", zipCode);
    const line1 = [addressLine1, addressLine2].filter(Boolean).join(", ");
    if (line1) params.set("address[addr_line1]", line1);
    // Semaglutide → S, Tirzepatide → T
    params.set("med", medicationType === "semaglutide" ? "S" : "T");

    if (gender) {
      const sex =
        gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      params.set("sex", sex);
    }
    if (dobMonth) {
      params.set("dob[month]", String(parseInt(dobMonth, 10)));
    }
    if (dobDay) {
      params.set("dob[day]", String(parseInt(dobDay, 10)));
    }
    if (dobYear) params.set("dob[year]", dobYear);
    if (heightFeet) {
      params.set("height_fi_feet", String(parseInt(heightFeet, 10)));
    }
    if (heightInches !== "") {
      params.set("height_fi_inches", String(parseInt(heightInches, 10)));
    }
    if (weight) {
      const lbs = parseFloat(weight);
      if (Number.isFinite(lbs)) {
        params.set("weight_lbs", String(Math.round(lbs)));
      }
    }
    if (loginToken) params.set("login_token", loginToken);

    return `${ONBOARDING_BASE}?${params.toString()}`;
  }, [
    orderId,
    firstName,
    lastName,
    email,
    phone,
    state,
    city,
    zipCode,
    addressLine1,
    addressLine2,
    medicationType,
    gender,
    dobMonth,
    dobDay,
    dobYear,
    heightFeet,
    heightInches,
    weight,
    loginToken,
  ]);

  const handleCompleteIntake = () => {
    window.location.assign(intakeUrl);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const w = window as Window & {
      sendInflektionEvent?: (
        eventId: number,
        em: string,
        payload?: Record<string, unknown>,
      ) => void;
      sendInflektionConversion?: (payload: Record<string, unknown>) => void;
    };

    if (w.sendInflektionEvent && email && orderSuccessful) {
      w.sendInflektionEvent(328, email, { transaction_id: String(orderId) });
    }

    if (
      w.sendInflektionConversion &&
      email &&
      orderSuccessful &&
      orderAmount != null &&
      productId != null
    ) {
      w.sendInflektionConversion({
        amount: orderAmount,
        currency,
        order_id: String(orderId),
        email,
        items: [
          {
            ps: String(productId),
            p: orderAmount,
            qty: 1,
          },
        ],
      });
    }
  }, [email, orderId, orderSuccessful, orderAmount, currency, productId]);

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden p-2 sm:p-4",
        "bg-gradient-to-b from-[#2F4A73]/10 via-background to-[#2F4A73]/5",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#2F4A7333,transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND_LIME}26` }}
        />
        <div
          className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND_NAVY}14` }}
        />
      </div>

      <Card
        className={cn(
          "relative z-10 mx-auto w-full max-w-[480px] border-2 bg-card/95 text-card-foreground shadow-xl backdrop-blur-sm",
          "rounded-2xl p-8 md:px-10 md:py-10 max-sm:p-5",
        )}
        style={{ borderColor: `${BRAND_LIME}40` }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 animate-fade-in px-2 md:mb-8 md:px-0">
            <img
              src={logo}
              alt="Affordable Wellness"
              className="h-11 object-contain md:h-12"
            />
          </div>

          <div className="mb-4 flex items-start justify-center gap-3 text-left">
            <div
              className={cn(
                "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md ring-4",
              )}
              style={{
                backgroundColor: BRAND_LIME,
                color: BRAND_NAVY,
                boxShadow: `0 4px 14px ${BRAND_LIME}55`,
                ["--tw-ring-color" as string]: `${BRAND_LIME}30`,
              }}
            >
              <Check className="h-5 w-5 stroke-[3]" aria-hidden />
            </div>
            <h1
              className="text-2xl font-black leading-tight md:text-[1.5rem]"
              style={{ color: BRAND_NAVY }}
            >
              Payment received.
              <br />
              Thanks for your order!
            </h1>
          </div>

          <h2
            className="mb-3 text-lg font-bold md:text-xl"
            style={{ color: BRAND_NAVY }}
          >
            You&apos;re almost there!
          </h2>

          <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Complete your medical intake so a licensed provider can review your
            information and move your order forward.
          </p>

          {/* Customer progress */}
          <div
            className="mb-8 w-full rounded-xl border p-4 text-left"
            style={{
              borderColor: `${BRAND_NAVY}18`,
              backgroundColor: `${BRAND_NAVY}06`,
            }}
            aria-label="Order progress"
          >
            <p
              className="mb-3 text-xs font-bold uppercase tracking-wider"
              style={{ color: BRAND_NAVY }}
            >
              Your progress
            </p>
            <ol className="space-y-3">
              {PROGRESS_STEPS.map((step) => {
                const isComplete = step.status === "complete";
                const isNext = step.status === "next";
                return (
                  <li
                    key={step.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          isNext && "ring-2 ring-[#E8ED92]/80",
                        )}
                        style={
                          isComplete
                            ? { backgroundColor: BRAND_NAVY, color: "#fff" }
                            : isNext
                              ? {
                                  backgroundColor: BRAND_LIME,
                                  color: BRAND_NAVY,
                                }
                              : {
                                  backgroundColor: "#E8EEF5",
                                  color: "#8A9BB0",
                                }
                        }
                      >
                        {isComplete ? (
                          <Check className="h-4 w-4 stroke-[3]" aria-hidden />
                        ) : (
                          <Circle
                            className="h-3.5 w-3.5"
                            fill={isNext ? "currentColor" : "none"}
                            aria-hidden
                          />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isComplete || isNext
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      )}
                      style={
                        isComplete
                          ? {
                              backgroundColor: `${BRAND_NAVY}14`,
                              color: BRAND_NAVY,
                            }
                          : isNext
                            ? {
                                backgroundColor: BRAND_LIME,
                                color: BRAND_NAVY,
                              }
                            : {
                                backgroundColor: "#EEF2F6",
                                color: "#8A9BB0",
                              }
                      }
                    >
                      {statusLabel[step.status]}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {orderSuccessful ? (
            <>
              <div
                className="mb-6 flex w-full gap-3 rounded-lg border p-4 text-left shadow-sm"
                style={{
                  borderColor: `${BRAND_LIME}40`,
                  backgroundColor: `${BRAND_LIME}0F`,
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${BRAND_LIME}22` }}
                >
                  <Info
                    className="h-5 w-5"
                    style={{ color: BRAND_NAVY }}
                    aria-hidden
                  />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-bold" style={{ color: BRAND_NAVY }}>
                    Important:
                  </span>{" "}
                  Use the same email you used at checkout when you complete your
                  intake.
                </p>
              </div>

              <Button
                type="button"
                className={cn(
                  "h-auto w-full rounded-xl border-0 py-5 text-[17px] font-extrabold uppercase tracking-[0.08em]",
                  "transition-all duration-300 hover:brightness-95",
                )}
                style={{
                  backgroundColor: BRAND_LIME,
                  color: BRAND_NAVY,
                  boxShadow: `0 8px 32px -6px ${BRAND_LIME}88`,
                }}
                onClick={handleCompleteIntake}
              >
                Complete Intake
              </Button>

              <p className="mt-4 text-sm text-muted-foreground">
                Continues in this tab so you can finish your medical intake.
              </p>
            </>
          ) : (
            <>
              <Button
                type="button"
                className={cn(
                  "h-auto w-full rounded-xl border-0 py-5 text-[17px] font-extrabold uppercase tracking-[0.08em]",
                  "transition-all duration-300 hover:brightness-95",
                )}
                style={{
                  backgroundColor: BRAND_LIME,
                  color: BRAND_NAVY,
                  boxShadow: `0 8px 32px -6px ${BRAND_LIME}88`,
                }}
                onClick={handleCompleteIntake}
              >
                Complete Intake
              </Button>
              <p className="mt-4 mb-2 max-w-md text-sm text-muted-foreground">
                If you just completed checkout, use the button above to continue
                to medical intake. Otherwise, check your email for next steps.
              </p>
            </>
          )}

          <div className="mt-8 w-full border-t border-border pt-6 text-xs text-muted-foreground">
            Questions?{" "}
            <a
              href="mailto:support@affordablewellness.com"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: BRAND_NAVY }}
            >
              support@affordablewellness.com
            </a>
            <p className="mt-1">We respond during business hours, M—F.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ThankYou3;
