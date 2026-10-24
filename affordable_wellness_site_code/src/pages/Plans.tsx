import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CheckOutHeader from "@/components/CheckOutHeader";
import CheckoutReservedTimer from "@/components/checkout/CheckoutReservedTimer";
import { Check, Lock, Tag, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import tirzepatideImage from "@/assets/tirzepatide-bottle.png";
import semaglutideImage from "@/assets/semaglutide-bottle.png";
import fedExIcon from "@/assets/fedex_icon.svg";
import giftIcon from "@/assets/gift_icon.png";
import includesIcon1 from "@/assets/includes_icon_1.png";
import includesIcon2 from "@/assets/includes_icon_2.png";
import affordableIcon from "@/assets/affordableicon.png";
import includesIcon4 from "@/assets/includes_icon_4.png";
import {
  useCheckoutFlow,
  type QuestionnaireCheckoutState,
} from "@/context/CheckoutFlowContext";
import { formatSavingsUsdDisplay } from "@/lib/checkoutHelpers";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import {
  captureLeadTrackingFromSearch,
  sendPlansPageLeadWebhook,
} from "@/lib/leadWebhook";
import CheckoutFooter from "./questions/checkout-footer";

const Plans = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;
  const { toast } = useToast();
  const [bootDone, setBootDone] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const bootOnce = useRef(false);
  const [smsTransactional, setSmsTransactional] = useState(false);
  const [smsMarketing, setSmsMarketing] = useState(false);


  const {
    isHydrated,
    hydrateFromQuestionnaire,
    tryRestoreFromStorage,
    medicationType,
    setMedicationType,
    loadingProducts,
    selectedPlan,
    setSelectedPlan,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    email,
    setEmail,
    appliedCoupon,
    setAppliedCoupon,
    selectedProductId,
    couponCode,
    setCouponCode,
    couponError,
    setCouponError,
    checkingCoupon,
    checkCouponCode,
    errors,
    setErrors,
    isEmailValid,
    setIsEmailValid,
    checkingMemberPrice,
    memberPrice,
    setMemberPrice,
    getProductByPlan,
    calculateFinalPrice,
    getPricePerDay,
    getTotalSavingsDisplay,
    getPlanShippingInterval,
    productDisplayName,
    validateEmail,
    validateContactForm,
    checkMemberPrice,
    couponAutoAppliedRef,
  } = useCheckoutFlow();

  useEffect(() => {
    captureLeadTrackingFromSearch(search);
  }, [search]);

  useEffect(() => {
    if (!bootDone) return;
    if (!email.trim() || !validateEmail(email)) return;
    void sendPlansPageLeadWebhook({
      email: email.trim(),
      first_name: firstName,
      last_name: lastName,
      phone,
    });
  }, [bootDone, email, firstName, lastName, phone, validateEmail]);

  useEffect(() => {
    if (bootOnce.current) return;
    bootOnce.current = true;
    window.scrollTo(0, 0);
    const st = location.state as QuestionnaireCheckoutState | undefined;
    if (st?.medicationType) {
      hydrateFromQuestionnaire(st);
      navigate(`${location.pathname}${mergeAffiliateIntoSearch(search)}`, {
        replace: true,
        state: {},
      });
      setBootDone(true);
      return;
    }
    if (tryRestoreFromStorage()) {
      setBootDone(true);
      return;
    }
    navigate(`/questionnaire${mergeAffiliateIntoSearch(search)}`);
  }, [hydrateFromQuestionnaire, navigate, search, tryRestoreFromStorage, location.pathname]);

  useEffect(() => {
    if (appliedCoupon) {
      setShowCoupon(true);
      if (appliedCoupon.data?.code)
        setCouponCode(appliedCoupon.data.code);
    }
  }, [appliedCoupon, setCouponCode]);

  useEffect(() => {
    if (
      selectedProductId &&
      couponCode === "Truelyrx15OFF" &&
      !appliedCoupon &&
      !checkingCoupon &&
      !couponAutoAppliedRef.current
    ) {
      const t = setTimeout(() => {
        void checkCouponCode();
        couponAutoAppliedRef.current = true;
      }, 500);
      return () => clearTimeout(t);
    }
  }, [
    selectedProductId,
    selectedPlan,
    couponCode,
    appliedCoupon,
    checkingCoupon,
    checkCouponCode,
    couponAutoAppliedRef,
  ]);

  const handlePlanSelection = useCallback(
    (planType: string) => {
      setSelectedPlan(planType);
      setMemberPrice(null);
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setCouponError("");
        couponAutoAppliedRef.current = false;
      }
    },
    [
      setSelectedPlan,
      setMemberPrice,
      appliedCoupon,
      setAppliedCoupon,
      setCouponError,
      couponAutoAppliedRef,
    ],
  );

  const handleSubmit = () => {
    if (!validateContactForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/shipping${mergeAffiliateIntoSearch(search)}`);
  };

  const perMonth = (planKey: string) => {
    const product = getProductByPlan(planKey);
    if (!product) return "—";
    const months =
      planKey === "monthly"
        ? 1
        : planKey === "3-month"
          ? 3
          : planKey === "6-month"
            ? 6
            : 12;
    return (parseFloat(product.price) / months).toFixed(2);
  };

  const planTagline = (planKey: string) => {
    const save = getTotalSavingsDisplay(planKey);
    const saveFmt = formatSavingsUsdDisplay(save);
    switch (planKey) {
      case "12-month":
        return `Save $${saveFmt} vs monthly – Maximum Savings`;
      case "6-month":
        return `Save $${saveFmt} vs monthly – Best long-term results.`;
      case "3-month":
        return save > 0
          ? `Save $${saveFmt} vs monthly – Convenient automatic deliveries.`
          : "Convenient automatic deliveries.";
      default:
        return "Low commitment - Cancel Anytime.";
    }
  };

  if (!bootDone) return null;

  const productData = {
    name: productDisplayName,
    plans: {
      monthly: { shippingInterval: getPlanShippingInterval("monthly") },
      "3-month": { shippingInterval: getPlanShippingInterval("3-month") },
      "6-month": { shippingInterval: getPlanShippingInterval("6-month") },
      "12-month": { shippingInterval: getPlanShippingInterval("12-month") },
    },
  };

  const renderContactInfo = (variant: "desktop" | "mobile") => {
    const idSuffix = variant === "mobile" ? "-mobile" : "";
    const wrapperClass =
      variant === "desktop" ? "hidden md:block" : "md:hidden";

    return (
      <div className={wrapperClass}>
        <h2 className="font-heading mt-6 mb-4 text-xl font-semibold text-foreground md:text-2xl">
          Confirm your personal information
        </h2>

        <div className="rounded-[2rem] border bg-card p-4 md:p-6">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-primary">
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            Private &amp; encrypted
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor={`firstName${idSuffix}`}
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  First Name
                </Label>
                <Input
                  id={`firstName${idSuffix}`}
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName)
                      setErrors((p) => ({ ...p, firstName: "" }));
                  }}
                  className={`h-12 rounded-xl text-base ${errors.firstName ? "border-destructive" : ""}`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor={`lastName${idSuffix}`}
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Last Name
                </Label>
                <Input
                  id={`lastName${idSuffix}`}
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName)
                      setErrors((p) => ({ ...p, lastName: "" }));
                  }}
                  className={`h-12 rounded-xl text-base ${errors.lastName ? "border-destructive" : ""}`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor={`phone${idSuffix}`}
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Phone Number
              </Label>
              <Input
                id={`phone${idSuffix}`}
                type="tel"
                placeholder="(555) 555-5555"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  if (cleaned.length <= 10) setPhone(e.target.value);
                  if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                }}
                maxLength={14}
                className={`h-12 rounded-xl text-base ${errors.phone ? "border-destructive" : ""}`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor={`email${idSuffix}`}
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Email Address <span className="text-destructive">*</span>{" "}
                {!selectedProductId && (
                  <span className="text-xs text-muted-foreground">
                    (Select a plan first)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id={`email${idSuffix}`}
                  type="email"
                  placeholder={
                    selectedProductId ? "your@email.com" : "Select a plan first"
                  }
                  value={email}
                  disabled={!selectedProductId}
                  required
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setEmail(newEmail);

                    if (newEmail.trim()) {
                      const ok = validateEmail(newEmail);
                      setIsEmailValid(ok);

                      if (ok && errors.email)
                        setErrors((p) => ({ ...p, email: "" }));
                    } else {
                      setIsEmailValid(false);
                    }

                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));

                    if (memberPrice) setMemberPrice(null);
                  }}
                  onBlur={() => {
                    if (!selectedProductId) return;
                    if (!email.trim()) {
                      setErrors((p) => ({
                        ...p,
                        email: "Email is required",
                      }));
                      return;
                    }

                    if (!validateEmail(email)) {
                      setErrors((p) => ({
                        ...p,
                        email: "Please enter a valid email address",
                      }));
                      return;
                    }

                    if (selectedProductId) {
                      void checkMemberPrice(email);
                    }
                  }}
                  className={`h-12 rounded-xl pr-12 text-base ${errors.email ? "border-destructive" : ""} ${!selectedProductId ? "cursor-not-allowed opacity-60" : ""}`}
                />
                {email.trim() && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isEmailValid ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 stroke-[3] text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <X className="h-4 w-4 stroke-[3] text-destructive-foreground" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
              {checkingMemberPrice && (
                <p className="mt-1 flex items-center gap-1 text-sm text-primary">
                  Checking member price...
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
        {/* non marketing  */}
        {/* <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginTop: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "20px",
              height: "20px",
              marginRight: "10px",
              marginTop: "2px",
              minWidth: "20px",
            }}
          >
            <input
              type="checkbox"
              id="smsTransactional"
              checked={smsTransactional}
              onChange={(e) => setSmsTransactional(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "2px solid #000",
                boxSizing: "border-box",
                appearance: "none",
                WebkitAppearance: "none",
                outline: "none",
                cursor: "pointer",
                backgroundColor: smsTransactional ? "#2D476F" : "#fff",
                margin: 0,
              }}
            />

            {smsTransactional && (
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "16px",
                  color: "#fff",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  lineHeight: 1,
                }}
              >
                ✓
              </span>
            )}
          </div>

          <label
            htmlFor="smsTransactional"
            className="checkbox-label"
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
              fontWeight: "300",
            }}
          >
            I consent to receive non-marketing text messages from Affordable Wellness regarding order updates, shipping notifications, and doctor communication. Message frequency varies. Message & data rates may apply. Reply HELP for assistance, reply STOP to opt out.
          </label>
        </div> */}

        {/* Marketing / Promotional consent */}
        {/* <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "20px",
              height: "20px",
              marginRight: "10px",
              marginTop: "2px",
              minWidth: "20px",
            }}
          >
            <input
              type="checkbox"
              id="smsMarketing"
              checked={smsMarketing}
              onChange={(e) => setSmsMarketing(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "2px solid #000",
                boxSizing: "border-box",
                appearance: "none",
                WebkitAppearance: "none",
                outline: "none",
                cursor: "pointer",
                backgroundColor: smsMarketing ? "#2D476F" : "#fff",
                margin: 0,
              }}
            />

            {smsMarketing && (
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "16px",
                  color: "#fff",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  lineHeight: 1,
                }}
              >
                ✓
              </span>
            )}
          </div>

          <label
            htmlFor="smsMarketing"
            className="checkbox-label"
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
              fontWeight: "300",
            }}
          >
            I consent to receive marketing text messages from  affordablewellness  regarding promotions and special offers. Message frequency varies. Message & data rates may apply. Reply HELP for assistance, reply STOP to opt out.
          </label>
        </div> */}



        <div className="pt-4">
          {/* <p
            className="text-center text-[14px] leading-5 mb-4 text-[#000]"
          >
            Mobile information will not be sold or shared with third parties.
          </p>

          <div className="flex items-center justify-center text-[16px] gap-2 mb-6 flex-wrap text-[#000]">
            <a
              href="https://affordablewellness.com/pages/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              Privacy Policy
            </a>

            <span>|</span>

            <a
              href="https://affordablewellness.com/pages/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              Terms & Conditions
            </a>

            <span>|</span>

            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              SMS Terms & Conditions
            </a>
          </div> */}

          <Button
            variant="checkout"
            type="button"
            size="lg"
            onClick={handleSubmit}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 animate-shine bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.5)_50%,transparent_65%)] bg-[length:200%_100%]"
            />
            Continue to Shipping →
          </Button>
        </div>
        {/* <p className="text-[10px] md:text-xs text-muted-foreground text-justify leading-1 pt-4 opacity-80">
          * Your visit is completely free. A medical provider will review your
          information and determine whether treatment is right for you. You’ll
          only be billed if a prescription is approved - otherwise, there’s no
          cost.
        </p> */}
        </div>
      </div>
    );
  };

  const renderPlanButton = (
    planKey: "12-month" | "6-month" | "3-month" | "monthly",
    bestPrice?: boolean,
  ) => {
    const title =
      planKey === "12-month"
        ? "12-Month Plan"
        : planKey === "6-month"
          ? "6-Month Plan"
          : planKey === "3-month"
            ? "3-Month Plan"
            : "Monthly Plan";
    const inputId = `plan-${planKey}`;
    const isSelected = selectedPlan === planKey;

    return (
      <label
        key={planKey}
        htmlFor={inputId}
        className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 transition-colors md:p-5 ${
          isSelected
            ? "border-primary ring-1 ring-primary"
            : "border-border hover:border-primary/40"
        }`}
      >
        <input
          id={inputId}
          type="radio"
          name="plan"
          checked={isSelected}
          onChange={() => handlePlanSelection(planKey)}
          className="sr-only"
        />
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            isSelected ? "border-primary" : "border-muted-foreground/40"
          }`}
          aria-hidden
        >
          {isSelected && (
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground md:text-lg">
              {title}
            </h2>
            {loadingProducts ? (
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                Loading...
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                {planTagline(planKey)}
              </p>
            )}
          </div>
          <p className="shrink-0 font-heading text-sm font-semibold text-foreground md:text-base">
            ${perMonth(planKey)}
            <span className="text-xs font-normal">/mo</span>
          </p>
        </div>
        {bestPrice && (
          <span className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-highlight px-2.5 py-0.5 text-[11px] font-semibold text-highlight-foreground">
            Best Price
          </span>
        )}
      </label>
    );
  };

  return (
    <div className="checkout-flow flex min-h-screen flex-col">
      <CheckOutHeader />
      <main role="main" id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:grid lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-8">
          {/* Left column */}
          <div className="space-y-5">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Choose Your Plan
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                All plans include free shipping and on-demand refills.
                <span className="font-semibold text-foreground">
                  {" "}
                  Cancel or change anytime.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-full bg-blue-card p-1">
              <button
                type="button"
                onClick={() => setMedicationType("tirzepatide")}
                className={`rounded-full py-2.5 text-sm font-semibold transition-all ${
                  medicationType === "tirzepatide"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-primary/70 hover:text-primary"
                }`}
              >
                Tirzepatide
              </button>
              <button
                type="button"
                onClick={() => setMedicationType("semaglutide")}
                className={`rounded-full py-2.5 text-sm font-semibold transition-all ${
                  medicationType === "semaglutide"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-primary/70 hover:text-primary"
                }`}
              >
                Semaglutide
              </button>
            </div>

            <fieldset className="space-y-3">
              <legend className="sr-only">Select a plan</legend>
              {renderPlanButton("12-month", true)}
              {renderPlanButton("6-month")}
              {renderPlanButton("3-month")}
              {renderPlanButton("monthly")}
            </fieldset>

            {renderContactInfo("desktop")}
          </div>

          {/* Right column — prescription summary */}
          <aside className="mt-6 lg:sticky lg:top-6 lg:mt-0">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
              <CheckoutReservedTimer embeddedInCard />

              <div className="space-y-4 p-5 md:p-6">
                {/* Product */}
                <div className="flex items-start gap-3">
                  <div className="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-xl bg-secondary p-2 md:h-24 md:w-24">
                    <img
                      src={
                        medicationType === "semaglutide"
                          ? semaglutideImage
                          : tirzepatideImage
                      }
                      alt="Medication"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-lg font-semibold leading-tight text-foreground md:text-xl">
                        {productData.name}
                      </h3>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] leading-none text-muted-foreground md:text-xs">
                          As low as
                        </p>
                        <p className="font-heading text-xl font-bold leading-none text-foreground md:text-2xl">
                          ${getPricePerDay()}
                          <span className="text-sm font-normal">/day</span>
                        </p>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                      {
                        productData.plans[
                          selectedPlan as keyof typeof productData.plans
                        ].shippingInterval
                      }
                    </p>
                    <ul className="mt-2.5 space-y-1 text-xs text-foreground md:text-sm">
                      <li className="flex items-center gap-2">
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span>Cheaper than lunch</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span>1 simple injection weekly</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span>#1 choice among members</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground md:text-xs">
                  This is a compounded medication. It is not FDA-approved.
                  Medications only issued when clinically appropriate after
                  provider evaluation. Affordable Wellness does not manufacture
                  compounded medications. Actual product appearance and labeling
                  of the medication you receive will differ from website images.
                </p>

                <div className="flex items-center gap-2 rounded-full bg-highlight px-4 py-2.5 text-xs text-highlight-foreground md:text-sm">
                  <Tag className="h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    Discount{" "}
                    <span className="font-semibold">
                      $
                      {formatSavingsUsdDisplay(
                        getTotalSavingsDisplay(selectedPlan),
                      )}{" "}
                      Total Savings
                    </span>
                  </span>
                </div>

                <div className="space-y-2.5 text-sm text-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span className="capitalize">{selectedPlan} Plan</span>
                    <span className="font-medium text-foreground">
                      ${calculateFinalPrice().subtotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Discount</span>
                    <span className="font-semibold text-primary">INCLUDED</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Online Clinician Visit</span>
                    <span className="text-right text-primary">
                      <span className="mr-1 text-muted-foreground line-through">
                        $49
                      </span>
                      <span className="font-semibold">INCLUDED</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Shipping 1–5 days from approval</span>
                    <span className="text-right text-primary">
                      <span className="mr-1 text-muted-foreground line-through">
                        $19.99
                      </span>
                      <span className="font-semibold">INCLUDED</span>
                    </span>
                  </div>
                  {appliedCoupon &&
                    parseFloat(calculateFinalPrice().discount) > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">
                          Coupon
                          {couponCode ? ` (${couponCode})` : ""}
                        </span>
                        <span className="font-bold text-primary">
                          -${calculateFinalPrice().discount}
                          {parseFloat(appliedCoupon.discount_percent) > 0
                            ? ` (${appliedCoupon.discount_percent}% off)`
                            : ""}
                        </span>
                      </div>
                    )}
                </div>

                <div className="h-px w-full bg-border" />

                <div className="flex items-center justify-between">
                  <p className="font-heading text-lg font-bold text-foreground md:text-xl">
                    Total Due
                  </p>
                  <p className="font-heading text-xl font-bold text-foreground md:text-2xl">
                    ${calculateFinalPrice().total}
                  </p>
                </div>

                {showCoupon ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        className="h-10 flex-1 rounded-xl text-base"
                        disabled={
                          !!appliedCoupon || checkingCoupon || !showCoupon
                        }
                      />
                      <Button
                        onClick={() => void checkCouponCode()}
                        disabled={
                          !!appliedCoupon ||
                          checkingCoupon ||
                          !couponCode.trim() ||
                          !showCoupon
                        }
                        className="h-10 whitespace-nowrap rounded-xl px-6 font-semibold"
                      >
                        {checkingCoupon ? "Checking..." : "Apply"}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="flex items-center gap-1 text-sm font-semibold text-destructive">
                        <X className="h-4 w-4" />
                        {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCoupon(true)}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-primary md:text-sm"
                    >
                      Apply Coupon Code
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 py-1 text-xs text-foreground md:text-sm">
                  <img
                    src={fedExIcon}
                    alt=""
                    className="h-5 w-auto object-contain"
                  />
                  <span>Express Delivery</span>
                </div>

                <div className="rounded-xl bg-secondary p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Your all–inclusive plan includes upgraded benefits:
                  </p>
                  <img
                    src={giftIcon}
                    alt=""
                    className="h-8 w-auto object-contain"
                  />
                </div>
                {[
                  {
                    icon: includesIcon1,
                    text: (
                      <>
                        <b>Private & Encrypted </b>- Your info stays protected.
                      </>
                    ),
                    was: "$199",
                  },
                  {
                    icon: includesIcon2,
                    text: (
                      <>
                        <b>Unlimited </b>Chats With Clinicians
                      </>
                    ),
                    was: "$69.99",
                  },
                  {
                    icon: affordableIcon,
                    text: (
                      <>
                        <b>100% U.S. </b>Based care support agents
                      </>
                    ),
                    was: "$49.99",
                  },
                  {
                    icon: includesIcon4,
                    text: (
                      <>
                        On-Time Refills <b>Guaranteed</b>
                      </>
                    ),
                    was: "$69.99",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-t border-border py-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
                        <img
                          src={row.icon}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground md:text-sm">
                        {row.text}
                      </span>
                    </div>
                    <div className="text-right text-xs md:text-sm">
                      <div className="text-muted-foreground line-through">
                        {row.was}
                      </div>
                      <div className="font-semibold text-primary">INCLUDED</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 border-t border-border py-3">
                  <span className="text-xs text-muted-foreground md:text-sm">
                    All approved orders are processed within 24 hours. Total
                    estimated delivery time is 1-5 business days from
                    prescription approval.
                  </span>
                  <div className="shrink-0 text-right text-xs md:text-sm">
                    <div className="text-muted-foreground line-through">
                      $19.99
                    </div>
                    <div className="font-semibold text-primary">INCLUDED</div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {renderContactInfo("mobile")}
          </aside>
        </div>
      </main>
      <CheckoutFooter />
    </div>
  );
};

export default Plans;
