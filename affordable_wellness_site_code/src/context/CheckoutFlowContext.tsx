import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  formatPriceValue,
  getCouponDiscountDollars,
  getMarketingTotalSavingsUsd,
  getProductByPlanFromList,
  isExcludedState,
  normalizeCouponResponse,
  normalizeStateCode,
} from "@/lib/checkoutHelpers";
import {
  AFFORDABLE_WELLNESS_SITE_ID,
  CHECK_COUPONS_V3_URL,
  createOrder_stripe,
  NEXIRX_PORTAL_PUSH_URL,
} from "@/lib/apiConstants";
import { buildCreateOrderStripeBody } from "@/lib/createOrderStripe";

const STORAGE_KEY = "benalign_checkout_flow_v1";

export type MedicationType = "semaglutide" | "tirzepatide";

export interface QuestionnaireCheckoutState {
  medicationType: MedicationType;
  selectedDosage?: string;
  semaglutideProducts: any[];
  tirzepatideProducts: any[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  state?: string;
  gender?: string;
  dobMonth?: string;
  dobDay?: string;
  dobYear?: string;
  heightFeet?: string;
  heightInches?: string;
  weight?: string;
}

interface PersistedCheckout {
  medicationType: MedicationType;
  selectedPlan: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  state: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  zipCode: string;
  differentBilling: boolean;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  cardHolderName: string;
  couponCode: string;
  appliedCoupon: any | null;
  memberPrice: string | null;
  gender: string;
  dobMonth: string;
  dobDay: string;
  dobYear: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
}

export type PendingStripeOrder = {
  planType: string;
  productId: string | number;
  productName: string;
  finalPrice: number;
  originalPrice: number;
  appliedCoupon: boolean;
  couponCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  differentBilling: boolean;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  selectedPlan: string;
  cardHolderName: string;
  medicationType: MedicationType;
  gender: string;
  dobMonth: string;
  dobDay: string;
  dobYear: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
};

type CheckoutFlowContextValue = {
  isHydrated: boolean;
  hydrateFromQuestionnaire: (data: QuestionnaireCheckoutState) => void;
  tryRestoreFromStorage: () => boolean;
  medicationType: MedicationType;
  setMedicationType: (t: MedicationType) => void;
  semaglutideProducts: any[];
  tirzepatideProducts: any[];
  medicationProducts: any[];
  loadingProducts: boolean;
  selectedPlan: string;
  setSelectedPlan: (p: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  gender: string;
  dobMonth: string;
  dobDay: string;
  dobYear: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  expiry: string;
  setExpiry: (v: string) => void;
  cvc: string;
  setCvc: (v: string) => void;
  addressLine1: string;
  setAddressLine1: (v: string) => void;
  addressLine2: string;
  setAddressLine2: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  zipCode: string;
  setZipCode: (v: string) => void;
  differentBilling: boolean;
  setDifferentBilling: (v: boolean) => void;
  billingAddressLine1: string;
  setBillingAddressLine1: (v: string) => void;
  billingAddressLine2: string;
  setBillingAddressLine2: (v: string) => void;
  billingCity: string;
  setBillingCity: (v: string) => void;
  billingState: string;
  setBillingState: (v: string) => void;
  billingZipCode: string;
  setBillingZipCode: (v: string) => void;
  cardHolderName: string;
  setCardHolderName: (v: string) => void;
  selectedProductId: number | null;
  setSelectedProductId: (id: number | null) => void;
  memberPrice: string | null;
  setMemberPrice: (v: string | null) => void;
  couponCode: string;
  setCouponCode: (v: string) => void;
  appliedCoupon: any | null;
  setAppliedCoupon: (v: any | null) => void;
  checkingCoupon: boolean;
  couponError: string;
  setCouponError: (v: string) => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isEmailValid: boolean;
  setIsEmailValid: (v: boolean) => void;
  checkingMemberPrice: boolean;
  getProductByPlan: (planType: string) => any | null;
  calculateSavings: (planType: string) => number;
  calculateDiscountedPrice: (planType: string) => number | null;
  calculateFinalPrice: () => { subtotal: string; discount: string; total: string };
  getPricePerDay: () => string;
  getTotalSavingsDisplay: (planType: string) => number;
  getPlanShippingInterval: (planType: string) => string;
  productDisplayName: string;
  fetchSemaglutideProducts: () => Promise<void>;
  fetchTirzepatideProducts: () => Promise<void>;
  checkCouponCode: () => Promise<void>;
  removeCoupon: () => void;
  validateEmail: (e: string) => boolean;
  validateContactForm: () => boolean;
  validateShippingForm: () => boolean;
  validateCardForm: () => boolean;
  validateOrderBeforePayment: () => boolean;
  checkMemberPrice: (userEmail: string) => Promise<void>;
  getPricingForPlan: (planType: string) => {
    product: any;
    finalPrice: number;
    originalPrice: number;
  } | null;
  buildPendingStripeOrder: (planOverride?: string) => PendingStripeOrder | null;
  createOrderFromPendingData: (
    paymentIntentId: string,
    pendingData: PendingStripeOrder,
  ) => Promise<{ orderId: string | number; amount: number; productId: string | number; productName: string }>;
  submitOrder: (paymentIntentId: string, planOverride?: string) => Promise<void>;
  setIsSubmitting: (v: boolean) => void;
  couponAutoAppliedRef: React.MutableRefObject<boolean>;
};

const CheckoutFlowContext = createContext<CheckoutFlowContextValue | null>(
  null,
);

export function CheckoutFlowProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isHydrated, setIsHydrated] = useState(false);
  const [medicationType, setMedicationTypeState] =
    useState<MedicationType>("tirzepatide");
  const [semaglutideProducts, setSemaglutideProducts] = useState<any[]>([]);
  const [tirzepatideProducts, setTirzepatideProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState("12-month");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [differentBilling, setDifferentBilling] = useState(false);
  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZipCode, setBillingZipCode] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [memberPrice, setMemberPrice] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [checkingMemberPrice, setCheckingMemberPrice] = useState(false);

  const couponAutoAppliedRef = useRef(false);

  const medicationProducts = useMemo(() => {
    return medicationType === "tirzepatide"
      ? tirzepatideProducts
      : semaglutideProducts;
  }, [medicationType, tirzepatideProducts, semaglutideProducts]);

  const productDisplayName =
    medicationType === "tirzepatide" ? "Tirzepatide" : "Semaglutide";

  const persist = useCallback(() => {
    if (!isHydrated) return;
    try {
      const payload: PersistedCheckout = {
        medicationType,
        selectedPlan,
        firstName,
        lastName,
        phone,
        email,
        state,
        addressLine1,
        addressLine2,
        city,
        zipCode,
        differentBilling,
        billingAddressLine1,
        billingAddressLine2,
        billingCity,
        billingState,
        billingZipCode,
        cardHolderName,
        couponCode,
        appliedCoupon,
        memberPrice,
        gender,
        dobMonth,
        dobDay,
        dobYear,
        heightFeet,
        heightInches,
        weight,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota */
    }
  }, [
    isHydrated,
    medicationType,
    selectedPlan,
    firstName,
    lastName,
    phone,
    email,
    state,
    addressLine1,
    addressLine2,
    city,
    zipCode,
    differentBilling,
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingState,
    billingZipCode,
    cardHolderName,
    couponCode,
    appliedCoupon,
    memberPrice,
    gender,
    dobMonth,
    dobDay,
    dobYear,
    heightFeet,
    heightInches,
    weight,
  ]);

  useEffect(() => {
    persist();
  }, [persist]);

  const validateEmail = useCallback((em: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  }, []);

  const fetchSemaglutideProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(
        "https://panel.whitelabelmd.com/affordablewellness/api/get_all_sema",
      );
      if (response.data.status === 1) {
        setSemaglutideProducts(response.data.data);
      }
    } catch (e) {
      console.error("Error fetching semaglutide products:", e);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchTirzepatideProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(
        "https://panel.whitelabelmd.com/affordablewellness/api/get_all_tirz",
      );
      if (response.data.status === 1) {
        setTirzepatideProducts(response.data.data);
      }
    } catch (e) {
      console.error("Error fetching tirzepatide products:", e);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const hydrateFromQuestionnaire = useCallback(
    (data: QuestionnaireCheckoutState) => {
      setMedicationTypeState(data.medicationType);
      setSemaglutideProducts(data.semaglutideProducts || []);
      setTirzepatideProducts(data.tirzepatideProducts || []);
      if (data.firstName) setFirstName(data.firstName);
      if (data.lastName) setLastName(data.lastName);
      if (data.phone) setPhone(data.phone);
      if (data.email) {
        setEmail(data.email);
        if (validateEmail(data.email)) setIsEmailValid(true);
      }
      if (data.state) setState(normalizeStateCode(data.state));
      if (data.gender) setGender(data.gender);
      if (data.dobMonth) setDobMonth(data.dobMonth);
      if (data.dobDay) setDobDay(data.dobDay);
      if (data.dobYear) setDobYear(data.dobYear);
      if (data.heightFeet) setHeightFeet(data.heightFeet);
      if (data.heightInches != null && data.heightInches !== "")
        setHeightInches(data.heightInches);
      if (data.weight) setWeight(data.weight);
      setIsHydrated(true);
    },
    [validateEmail],
  );

  const tryRestoreFromStorage = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const p = JSON.parse(raw) as PersistedCheckout;
      if (!p.medicationType) return false;
      setMedicationTypeState(p.medicationType);
      setSelectedPlan(p.selectedPlan || "12-month");
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setPhone(p.phone || "");
      setEmail(p.email || "");
      setState(p.state ? normalizeStateCode(p.state) : "");
      setAddressLine1(p.addressLine1 || "");
      setAddressLine2(p.addressLine2 || "");
      setCity(p.city || "");
      setZipCode(p.zipCode || "");
      setDifferentBilling(!!p.differentBilling);
      setBillingAddressLine1(p.billingAddressLine1 || "");
      setBillingAddressLine2(p.billingAddressLine2 || "");
      setBillingCity(p.billingCity || "");
      setBillingState(p.billingState || "");
      setBillingZipCode(p.billingZipCode || "");
      setCardHolderName(p.cardHolderName || "");
      setCouponCode(p.couponCode || "");
      setAppliedCoupon(p.appliedCoupon ?? null);
      setMemberPrice(p.memberPrice ?? null);
      setGender(p.gender || "");
      setDobMonth(p.dobMonth || "");
      setDobDay(p.dobDay || "");
      setDobYear(p.dobYear || "");
      setHeightFeet(p.heightFeet || "");
      setHeightInches(p.heightInches || "");
      setWeight(p.weight || "");
      if (p.email && validateEmail(p.email)) setIsEmailValid(true);
      setIsHydrated(true);
      return true;
    } catch {
      return false;
    }
  }, [validateEmail]);

  const setMedicationType = useCallback(
    (t: MedicationType) => {
      setMedicationTypeState(t);
      setMemberPrice(null);
      setAppliedCoupon(null);
      setCouponError("");
      couponAutoAppliedRef.current = false;
    },
    [],
  );

  useEffect(() => {
    if (!isHydrated) return;
    const needSema = semaglutideProducts.length === 0;
    const needTirz = tirzepatideProducts.length === 0;
    if (medicationType === "semaglutide" && needSema) void fetchSemaglutideProducts();
    if (medicationType === "tirzepatide" && needTirz) void fetchTirzepatideProducts();
  }, [
    isHydrated,
    medicationType,
    semaglutideProducts.length,
    tirzepatideProducts.length,
    fetchSemaglutideProducts,
    fetchTirzepatideProducts,
  ]);

  const getProductByPlan = useCallback(
    (planType: string) =>
      getProductByPlanFromList(medicationProducts, planType),
    [medicationProducts],
  );

  const getPerMonthPrice = useCallback(
    (planType: string): number => {
      const product = getProductByPlanFromList(medicationProducts, planType);
      if (!product) return 0;
      const totalPrice = parseFloat(product.price);
      const months =
        planType === "monthly"
          ? 1
          : planType === "3-month"
            ? 3
            : planType === "6-month"
              ? 6
              : planType === "12-month"
                ? 12
                : 1;
      return totalPrice / months;
    },
    [medicationProducts],
  );

  const calculateSavings = useCallback(
    (planType: string) =>
      getMarketingTotalSavingsUsd(medicationType, planType),
    [medicationType],
  );

  const couponFallbackBasis = useCallback(() => {
    const monthly = getProductByPlanFromList(medicationProducts, "monthly");
    const p = monthly ? parseFloat(monthly.price) : NaN;
    return Number.isFinite(p) && p > 0 ? p : undefined;
  }, [medicationProducts]);

  const calculateDiscountedPrice = useCallback(
    (planType: string): number | null => {
      const product = getProductByPlanFromList(medicationProducts, planType);
      if (!product) return null;
      const subtotal =
        memberPrice && planType === "monthly"
          ? parseFloat(memberPrice)
          : parseFloat(product.price);
      if (!Number.isFinite(subtotal)) return null;
      const discount = getCouponDiscountDollars(
        subtotal,
        appliedCoupon,
        couponFallbackBasis(),
      );
      return Math.max(0, subtotal - discount);
    },
    [medicationProducts, memberPrice, appliedCoupon, couponFallbackBasis],
  );

  const calculateFinalPrice = useCallback(() => {
    const product = getProductByPlanFromList(medicationProducts, selectedPlan);
    if (!product)
      return { subtotal: "0.00", discount: "0.00", total: "0.00" };

    let subtotal =
      memberPrice && selectedPlan === "monthly"
        ? parseFloat(memberPrice)
        : parseFloat(product.price);
    if (!Number.isFinite(subtotal)) subtotal = 0;

    const discount = getCouponDiscountDollars(
      subtotal,
      appliedCoupon,
      couponFallbackBasis(),
    );
    const total = Math.max(0, subtotal - discount);
    return {
      subtotal: formatPriceValue(subtotal),
      discount: formatPriceValue(discount),
      total: formatPriceValue(total),
    };
  }, [
    medicationProducts,
    selectedPlan,
    memberPrice,
    appliedCoupon,
    couponFallbackBasis,
  ]);

  const getPricePerDay = useCallback(() => {
    const product = getProductByPlanFromList(medicationProducts, selectedPlan);
    if (!product) return "0.00";
    const months =
      selectedPlan === "monthly"
        ? 1
        : selectedPlan === "3-month"
          ? 3
          : selectedPlan === "6-month"
            ? 6
            : 12;
    const totalDue = parseFloat(calculateFinalPrice().total);
    const base =
      Number.isFinite(totalDue) && totalDue >= 0
        ? totalDue
        : parseFloat(product.price);
    return (base / months / 30).toFixed(2);
  }, [medicationProducts, selectedPlan, calculateFinalPrice]);

  const getTotalSavingsDisplay = useCallback(
    (planType: string) => Math.max(0, Math.round(calculateSavings(planType))),
    [calculateSavings],
  );

  const getPlanShippingInterval = useCallback((planType: string) => {
    switch (planType) {
      case "monthly":
        return "1-month supply delivered monthly";
      case "3-month":
        return "3-month supply delivered every 3 months";
      case "6-month":
        return "Two 3-month shipments (90 days apart)";
      case "12-month":
        return "Four 3-month shipments (every 90 days)";
      default:
        return "";
    }
  }, []);

  useEffect(() => {
    if (medicationProducts.length > 0 && selectedPlan) {
      const p = getProductByPlanFromList(medicationProducts, selectedPlan);
      if (p) setSelectedProductId(p.product_id);
    }
  }, [medicationProducts, selectedPlan]);

  const checkMemberPrice = useCallback(
    async (userEmail: string) => {
      if (
        selectedPlan !== "monthly" ||
        !selectedProductId ||
        (medicationType !== "semaglutide" && medicationType !== "tirzepatide")
      ) {
        return;
      }
      if (!validateEmail(userEmail)) return;
      setCheckingMemberPrice(true);
      try {
        const response = await axios.post(
          "https://panel.whitelabelmd.com/affordablewellness/api/member_view",
          { email: userEmail, product_id: selectedProductId },
        );
        if (response.data.status === 1 && response.data.m_price) {
          setMemberPrice(response.data.m_price);
        } else {
          setMemberPrice(null);
        }
      } catch {
        setMemberPrice(null);
      } finally {
        setCheckingMemberPrice(false);
      }
    },
    [selectedPlan, selectedProductId, medicationType, validateEmail],
  );

  useEffect(() => {
    if (
      email.trim() &&
      validateEmail(email) &&
      selectedProductId &&
      selectedPlan === "monthly"
    ) {
      const t = setTimeout(() => {
        void checkMemberPrice(email);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [selectedProductId, selectedPlan, email, validateEmail, checkMemberPrice]);

  const checkCouponCode = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    if (!selectedProductId) {
      setCouponError("Please select a plan first");
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setCouponError("Please enter a valid email before applying a coupon");
      return;
    }
    setCheckingCoupon(true);
    setCouponError("");
    try {
      const product = getProductByPlanFromList(medicationProducts, selectedPlan);
      if (!product) throw new Error("Product not found");

      const productIdNum = Number(product.product_id ?? selectedProductId);
      if (!Number.isFinite(productIdNum)) {
        setCouponError("Invalid product. Please reselect your plan.");
        return;
      }

      const response = await axios.post(CHECK_COUPONS_V3_URL, {
        site_id: AFFORDABLE_WELLNESS_SITE_ID,
        promo_codes: couponCode.trim(),
        product_id: productIdNum,
        email: email.trim(),
      });

      const data = response.data;
      if (data?.status == 1 || data?.status === true) {
        const appliedOnSubtotal = parseFloat(product.price);
        const normalized = {
          ...normalizeCouponResponse(data, couponCode.trim()),
          applied_on_subtotal: Number.isFinite(appliedOnSubtotal)
            ? appliedOnSubtotal
            : undefined,
        };
        if (
          parseFloat(normalized.discount_percent) <= 0 &&
          parseFloat(normalized.discount_amount) <= 0
        ) {
          setCouponError(
            "Coupon accepted but no discount amount was returned. Please try another code.",
          );
          setAppliedCoupon(null);
          return;
        }
        setAppliedCoupon(normalized);
        toast({
          title: "Coupon Applied!",
          description: "Your coupon has been successfully applied.",
        });
      } else {
        setCouponError(data?.message || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      const apiMessage =
        axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : null;
      setCouponError(apiMessage || "Failed to apply coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setCheckingCoupon(false);
    }
  }, [
    couponCode,
    selectedProductId,
    medicationProducts,
    selectedPlan,
    memberPrice,
    email,
    validateEmail,
    toast,
  ]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError("");
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your order.",
    });
  }, [toast]);

  const validateContactForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (phone.replace(/\D/g, "").length !== 10)
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email))
      newErrors.email = "Please enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, phone, email, validateEmail]);

  const validateShippingForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!addressLine1.trim())
      newErrors.addressLine1 = "Street address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state) newErrors.state = "State is required";
    else if (isExcludedState(state))
      newErrors.state = "We are not currently available in this state.";
    if (!zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    else if (zipCode.length !== 5)
      newErrors.zipCode = "ZIP code must be 5 digits";
    if (differentBilling) {
      if (!billingAddressLine1.trim())
        newErrors.billingAddressLine1 = "Billing street address is required";
      if (!billingCity.trim()) newErrors.billingCity = "Billing city is required";
      if (!billingState) newErrors.billingState = "Billing state is required";
      else if (isExcludedState(billingState))
        newErrors.billingState =
          "We are not currently available in this state.";
      if (!billingZipCode.trim())
        newErrors.billingZipCode = "Billing ZIP code is required";
      else if (billingZipCode.length !== 5)
        newErrors.billingZipCode = "Billing ZIP code must be 5 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    addressLine1,
    city,
    state,
    zipCode,
    differentBilling,
    billingAddressLine1,
    billingCity,
    billingState,
    billingZipCode,
  ]);

  const validateCardForm = useCallback(() => {
    // Card fields are collected by Stripe Payment Element — no local card validation.
    return true;
  }, []);

  const validateOrderBeforePayment = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (phone.replace(/\D/g, "").length !== 10)
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email))
      newErrors.email = "Please enter a valid email address";
    if (!addressLine1.trim())
      newErrors.addressLine1 = "Street address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state) newErrors.state = "State is required";
    else if (isExcludedState(state))
      newErrors.state = "We are not currently available in this state.";
    if (!zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    else if (zipCode.length !== 5)
      newErrors.zipCode = "ZIP code must be 5 digits";
    if (differentBilling) {
      if (!billingAddressLine1.trim())
        newErrors.billingAddressLine1 = "Billing street address is required";
      if (!billingCity.trim()) newErrors.billingCity = "Billing city is required";
      if (!billingState) newErrors.billingState = "Billing state is required";
      else if (isExcludedState(billingState))
        newErrors.billingState =
          "We are not currently available in this state.";
      if (!billingZipCode.trim())
        newErrors.billingZipCode = "Billing ZIP code is required";
      else if (billingZipCode.length !== 5)
        newErrors.billingZipCode = "Billing ZIP code must be 5 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    firstName,
    lastName,
    phone,
    email,
    addressLine1,
    city,
    state,
    zipCode,
    differentBilling,
    billingAddressLine1,
    billingCity,
    billingState,
    billingZipCode,
    validateEmail,
  ]);

  const getPricingForPlan = useCallback(
    (planType: string) => {
      const product = getProductByPlanFromList(medicationProducts, planType);
      if (!product) return null;

      let subtotal =
        memberPrice && planType === "monthly"
          ? parseFloat(memberPrice)
          : parseFloat(product.price);
      if (!Number.isFinite(subtotal)) subtotal = 0;
      const discount = getCouponDiscountDollars(
        subtotal,
        appliedCoupon,
        couponFallbackBasis(),
      );
      const finalPrice = Math.max(0, subtotal - discount);
      const originalPrice = parseFloat(product.price);
      return {
        product,
        finalPrice,
        originalPrice,
        subtotal,
        discount,
      };
    },
    [medicationProducts, memberPrice, appliedCoupon, couponFallbackBasis],
  );

  const buildPendingStripeOrder = useCallback(
    (planOverride?: string): PendingStripeOrder | null => {
      const planType = planOverride || selectedPlan;
      const pricing = getPricingForPlan(planType);
      if (!pricing) return null;
      return {
        planType,
        productId: pricing.product.product_id,
        productName: pricing.product.product_name || productDisplayName,
        finalPrice: pricing.finalPrice,
        originalPrice: pricing.originalPrice,
        appliedCoupon: Boolean(appliedCoupon),
        couponCode,
        firstName,
        lastName,
        phone,
        email,
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
        selectedPlan: planType,
        cardHolderName: cardHolderName || `${firstName} ${lastName}`.trim(),
        medicationType,
        gender,
        dobMonth,
        dobDay,
        dobYear,
        heightFeet,
        heightInches,
        weight,
      };
    },
    [
      selectedPlan,
      getPricingForPlan,
      productDisplayName,
      appliedCoupon,
      couponCode,
      firstName,
      lastName,
      phone,
      email,
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
      cardHolderName,
      medicationType,
      gender,
      dobMonth,
      dobDay,
      dobYear,
      heightFeet,
      heightInches,
      weight,
    ],
  );

  const postCreateOrder = useCallback(
    async (
      paymentIntentId: string,
      orderData: Record<string, unknown>,
      meta: {
        finalPrice: number;
        productId: string | number;
        productName: string;
        email: string;
        replace?: boolean;
        firstName?: string;
        lastName?: string;
        phone?: string;
        state?: string;
        city?: string;
        zipCode?: string;
        addressLine1?: string;
        addressLine2?: string;
        medicationType?: MedicationType;
        gender?: string;
        dobMonth?: string;
        dobDay?: string;
        dobYear?: string;
        heightFeet?: string;
        heightInches?: string;
        weight?: string;
      },
    ) => {
      const response = await axios.post(
        createOrder_stripe,
        {
          ...orderData,
          payment_token: paymentIntentId,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      const responseData = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      const successOrders = Array.isArray(responseData?.success_orders)
        ? responseData.success_orders.map(String)
        : responseData?.status == 1 && responseData?.order_id
          ? [String(responseData.order_id)]
          : [];

      if (!(responseData && responseData.status == 1 && successOrders.length > 0)) {
        throw new Error(responseData?.message || "Payment processing failed");
      }

      let loginToken = "";
      try {
        const portalRes = await axios.post(
          NEXIRX_PORTAL_PUSH_URL,
          {
            email: orderData.email,
            first_name: orderData.first_name,
            last_name: orderData.last_name,
            phone: orderData.phone,
          },
          { headers: { "Content-Type": "application/json" } },
        );
        const portalData = Array.isArray(portalRes.data)
          ? portalRes.data[0]
          : portalRes.data;
        const token =
          portalData?.login_token ?? portalData?.data?.login_token ?? "";
        if (typeof token === "string") loginToken = token.trim();
      } catch (err) {
        console.error("Error sending nexirx portal push:", err);
      }

      const orderId = successOrders[0] || responseData.order_id;
      trackPurchase(orderId, meta.finalPrice, "USD", [
        {
          item_id: meta.productId,
          item_name: meta.productName,
          price: meta.finalPrice,
          quantity: 1,
        },
      ]);
      sessionStorage.removeItem(STORAGE_KEY);
      toast({
        title: "Payment Successful!",
        description: "Your order has been confirmed.",
      });
      navigate("/thank-you", {
        replace: meta.replace === true,
        state: {
          email: meta.email,
          orderId,
          uniqueId: orderId,
          amount: meta.finalPrice,
          productId: meta.productId,
          productName: meta.productName,
          firstName: meta.firstName || "",
          lastName: meta.lastName || "",
          phone: meta.phone || "",
          state: meta.state || "",
          city: meta.city || "",
          zipCode: meta.zipCode || "",
          addressLine1: meta.addressLine1 || "",
          addressLine2: meta.addressLine2 || "",
          medicationType: meta.medicationType || "tirzepatide",
          gender: meta.gender || "",
          dobMonth: meta.dobMonth || "",
          dobDay: meta.dobDay || "",
          dobYear: meta.dobYear || "",
          heightFeet: meta.heightFeet || "",
          heightInches: meta.heightInches || "",
          weight: meta.weight || "",
          loginToken,
        },
      });
      return {
        orderId,
        amount: meta.finalPrice,
        productId: meta.productId,
        productName: meta.productName,
      };
    },
    [navigate, toast],
  );

  const createOrderFromPendingData = useCallback(
    async (paymentIntentId: string, pendingData: PendingStripeOrder) => {
      const sameAsShipping = !pendingData.differentBilling;
      const orderData = buildCreateOrderStripeBody({
        email: pendingData.email || "",
        firstName: pendingData.firstName || "",
        lastName: pendingData.lastName || "",
        phone: (pendingData.phone || "").replace(/\D/g, ""),
        address: pendingData.addressLine1 || "",
        address2: pendingData.addressLine2 || "",
        city: pendingData.city || "",
        stateCode: normalizeStateCode(pendingData.state || ""),
        zipCode: pendingData.zipCode || "",
        sameAsShipping,
        billingAddress: pendingData.billingAddressLine1 || "",
        billingAddress2: pendingData.billingAddressLine2 || "",
        billingCity: pendingData.billingCity || "",
        billingStateCode: normalizeStateCode(pendingData.billingState || ""),
        billingZipCode: pendingData.billingZipCode || "",
        productId: pendingData.productId,
        promoCodes: pendingData.appliedCoupon ? pendingData.couponCode : null,
        paymentToken: paymentIntentId,
        startUrl: window.location.origin + "/?id=" + pendingData.productId,
      });

      return postCreateOrder(paymentIntentId, orderData, {
        finalPrice: pendingData.finalPrice,
        productId: pendingData.productId,
        productName: pendingData.productName,
        email: pendingData.email,
        replace: true,
        firstName: pendingData.firstName,
        lastName: pendingData.lastName,
        phone: pendingData.phone,
        state: pendingData.state,
        city: pendingData.city,
        zipCode: pendingData.zipCode,
        addressLine1: pendingData.addressLine1,
        addressLine2: pendingData.addressLine2,
        medicationType: pendingData.medicationType,
        gender: pendingData.gender,
        dobMonth: pendingData.dobMonth,
        dobDay: pendingData.dobDay,
        dobYear: pendingData.dobYear,
        heightFeet: pendingData.heightFeet,
        heightInches: pendingData.heightInches,
        weight: pendingData.weight,
      });
    },
    [postCreateOrder],
  );

  const trackPurchase = (
    orderId: string | number,
    value: number,
    currency: string,
    items: Array<{
      item_id: string | number;
      item_name: string;
      price: number;
      quantity: number;
    }>,
  ) => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: String(orderId),
          value,
          currency,
          items,
        },
      });
    }
  };

  const submitOrder = useCallback(
    async (paymentIntentId: string, planOverride?: string) => {
      const planType = planOverride || selectedPlan;
      const pricing = getPricingForPlan(planType);
      if (!pricing) throw new Error("Please select a product first");
      const { product, finalPrice } = pricing;
      const isFullyDiscounted = finalPrice <= 0 && Boolean(appliedCoupon);
      const paymentToken = isFullyDiscounted
        ? paymentIntentId || "123"
        : paymentIntentId;
      if (!paymentToken) {
        throw new Error("Missing payment intent id");
      }

      const orderData = buildCreateOrderStripeBody({
        email,
        firstName,
        lastName,
        phone: phone.replace(/\D/g, ""),
        address: addressLine1,
        address2: addressLine2 || "",
        city,
        stateCode: normalizeStateCode(state),
        zipCode,
        sameAsShipping: !differentBilling,
        billingAddress: billingAddressLine1,
        billingAddress2: billingAddressLine2 || "",
        billingCity,
        billingStateCode: normalizeStateCode(billingState),
        billingZipCode,
        productId: product.product_id,
        promoCodes: appliedCoupon ? couponCode : null,
        paymentToken,
        startUrl: window.location.origin + "/?id=" + product.product_id,
      });

      await postCreateOrder(paymentToken, orderData, {
        finalPrice,
        productId: product.product_id,
        productName: product.product_name || productDisplayName,
        email,
        firstName,
        lastName,
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
      });
    },
    [
      selectedPlan,
      getPricingForPlan,
      differentBilling,
      email,
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      appliedCoupon,
      couponCode,
      billingAddressLine1,
      billingAddressLine2,
      billingCity,
      billingState,
      billingZipCode,
      productDisplayName,
      medicationType,
      gender,
      dobMonth,
      dobDay,
      dobYear,
      heightFeet,
      heightInches,
      weight,
      postCreateOrder,
    ],
  );

  const value = useMemo(
    () => ({
      isHydrated,
      hydrateFromQuestionnaire,
      tryRestoreFromStorage,
      medicationType,
      setMedicationType,
      semaglutideProducts,
      tirzepatideProducts,
      medicationProducts,
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
      state,
      setState,
      gender,
      dobMonth,
      dobDay,
      dobYear,
      heightFeet,
      heightInches,
      weight,
      cardNumber,
      setCardNumber,
      expiry,
      setExpiry,
      cvc,
      setCvc,
      addressLine1,
      setAddressLine1,
      addressLine2,
      setAddressLine2,
      city,
      setCity,
      zipCode,
      setZipCode,
      differentBilling,
      setDifferentBilling,
      billingAddressLine1,
      setBillingAddressLine1,
      billingAddressLine2,
      setBillingAddressLine2,
      billingCity,
      setBillingCity,
      billingState,
      setBillingState,
      billingZipCode,
      setBillingZipCode,
      cardHolderName,
      setCardHolderName,
      selectedProductId,
      setSelectedProductId,
      memberPrice,
      setMemberPrice,
      couponCode,
      setCouponCode,
      appliedCoupon,
      setAppliedCoupon,
      checkingCoupon,
      couponError,
      setCouponError,
      isSubmitting,
      errors,
      setErrors,
      isEmailValid,
      setIsEmailValid,
      checkingMemberPrice,
      getProductByPlan,
      calculateSavings,
      calculateDiscountedPrice,
      calculateFinalPrice,
      getPricePerDay,
      getTotalSavingsDisplay,
      getPlanShippingInterval,
      productDisplayName,
      fetchSemaglutideProducts,
      fetchTirzepatideProducts,
      checkCouponCode,
      removeCoupon,
      validateEmail,
      validateContactForm,
      validateShippingForm,
      validateCardForm,
      validateOrderBeforePayment,
      checkMemberPrice,
      getPricingForPlan,
      buildPendingStripeOrder,
      createOrderFromPendingData,
      submitOrder,
      setIsSubmitting,
      couponAutoAppliedRef,
    }),
    [
      isHydrated,
      hydrateFromQuestionnaire,
      tryRestoreFromStorage,
      medicationType,
      setMedicationType,
      semaglutideProducts,
      tirzepatideProducts,
      medicationProducts,
      loadingProducts,
      selectedPlan,
      firstName,
      lastName,
      phone,
      email,
      state,
      gender,
      dobMonth,
      dobDay,
      dobYear,
      heightFeet,
      heightInches,
      weight,
      cardNumber,
      expiry,
      cvc,
      addressLine1,
      addressLine2,
      city,
      zipCode,
      differentBilling,
      billingAddressLine1,
      billingAddressLine2,
      billingCity,
      billingState,
      billingZipCode,
      cardHolderName,
      selectedProductId,
      memberPrice,
      couponCode,
      appliedCoupon,
      checkingCoupon,
      couponError,
      isSubmitting,
      errors,
      isEmailValid,
      checkingMemberPrice,
      getProductByPlan,
      calculateSavings,
      calculateDiscountedPrice,
      calculateFinalPrice,
      getPricePerDay,
      getTotalSavingsDisplay,
      getPlanShippingInterval,
      productDisplayName,
      fetchSemaglutideProducts,
      fetchTirzepatideProducts,
      checkCouponCode,
      removeCoupon,
      validateEmail,
      validateContactForm,
      validateShippingForm,
      validateCardForm,
      validateOrderBeforePayment,
      checkMemberPrice,
      getPricingForPlan,
      buildPendingStripeOrder,
      createOrderFromPendingData,
      submitOrder,
    ],
  );

  return (
    <CheckoutFlowContext.Provider value={value}>
      {children}
    </CheckoutFlowContext.Provider>
  );
}

export function useCheckoutFlow() {
  const ctx = useContext(CheckoutFlowContext);
  if (!ctx) {
    throw new Error("useCheckoutFlow must be used within CheckoutFlowProvider");
  }
  return ctx;
}
