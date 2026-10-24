import { useState, useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { mergeAffiliateIntoSearch } from "@/lib/affiliateTracking";
import {
  formatPriceValue,
  getMonthlyStartingPriceFromProducts,
  isExcludedState,
} from "@/lib/checkoutHelpers";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  Stethoscope,
  Truck,
  Info,
  Dot,
  Check,
  AlertTriangle,
} from "lucide-react";
import affordableWellnessLogo from "@/assets/affordable-wellness-logo.png";
import semaglutideBottle from "@/assets/semaglutide-bottle.png";
import tirzepatideBottle from "@/assets/tirzepatide-bottle.png";
import forbes from "@/assets/forbes-laurel.png";
import doctorImage from "@/assets/doctor.png";

import doctorcollage from "@/assets/remedy-collage.png";
import glpsyringe from "@/assets/glp1-syringe.png";
import CheckoutFooter from "./questions/checkout-footer";
import {
  saveQuestionnaireLead,
  buildQuestionnaireLeadRecord,
  sendPlansPageLeadWebhook,
} from "@/lib/leadWebhook";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado",
  "Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho",
  "Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Maine","Maryland","Massachusetts","Michigan","Minnesota",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma",
  "Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

const TOTAL_STEPS = 5;

/** Accent used on BMI screen progress + gauge (matches Eden green) */
const BMI_ACCENT = "#34A853";

const getAgeFromDob = (month: string, day: string, year: string): number | null => {
  if (!month || !day || !year || year.length !== 4) return null;

  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  const yearNum = parseInt(year, 10);
  if (
    Number.isNaN(monthNum) ||
    Number.isNaN(dayNum) ||
    Number.isNaN(yearNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    dayNum < 1 ||
    dayNum > 31
  ) {
    return null;
  }

  const dob = new Date(yearNum, monthNum - 1, dayNum);
  if (
    dob.getFullYear() !== yearNum ||
    dob.getMonth() !== monthNum - 1 ||
    dob.getDate() !== dayNum
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - yearNum;
  const hadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hadBirthdayThisYear) age--;

  return age;
};

const getIntakeProgressStep = (currentStep: number) => {
  if (currentStep === 2 || currentStep === 21) return 1;
  if (currentStep === 3 || currentStep === 4 || currentStep === 5) return 2;
  if (currentStep === 7) return 3;
  if (currentStep === 8) return 4;
  if (currentStep === 10) return 5;
  return 5;
};

// ─── Shared progress header ────────────────────────────────────────────────
interface QuizHeaderProps {
  step: number;
  onBack?: () => void;
}
const QuizHeader = ({ step, onBack }: QuizHeaderProps) => (
  <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm ">
    <div className="max-w-xl mx-auto px-4 pt-5 md:pt-12 pb-2.5">
      <div className="flex items-center justify-between mb-2.5 md:mb-12">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        ) : (
          <div className="w-16" />
        )}
        <img src={affordableWellnessLogo} alt="Affordable Wellness" className="h-8 w-auto object-contain" />
        <div className="w-16" />
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            step === 2 || step === 21 ? "" : "bg-primary"
          }`}
          style={{
            width: `${Math.round((getIntakeProgressStep(step) / TOTAL_STEPS) * 100)}%`,
            ...(step === 2 || step === 21
              ? { backgroundColor: BMI_ACCENT }
              : {}),
          }}
        />
      </div>
    </div>
  </div>
);

const QuizShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-white flex flex-col">
    <div className="flex-1 flex flex-col">{children}</div>
    <CheckoutFooter />
  </div>
);

// ─── Reusable large option card ────────────────────────────────────────────
interface OptionCardProps {
  label: string;
  sublabel?: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}
const OptionCard = ({ label, sublabel, emoji, selected, onClick }: OptionCardProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-5 text-left rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
      selected
        ? "border-primary bg-primary/8 shadow-md"
        : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
    }`}
  >
    {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
    <div className="flex-1 min-w-0">
      <p className={`font-semibold text-base md:text-lg ${selected ? "text-gray-900" : "text-gray-700"}`}>
        {label}
      </p>
      {sublabel && <p className="text-sm text-gray-500 mt-0.5">{sublabel}</p>}
    </div>
    <div
      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
        selected ? "border-primary bg-primary" : "border-gray-300"
      }`}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </button>
);

const QUIZ_SELECT_TRIGGER =
  "h-14 rounded-xl border-2 !border-gray-200 bg-white text-base text-gray-900 shadow-none focus:!border-primary focus:ring-2 focus:ring-primary/20 data-[state=open]:!border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20 [&_svg]:text-primary/70";
const QUIZ_SELECT_CONTENT = "rounded-xl border-gray-200 bg-white shadow-lg";
const QUIZ_SELECT_ITEM =
  "cursor-pointer rounded-lg py-2.5 text-base focus:!bg-primary/10 focus:!text-gray-900 data-[highlighted]:!bg-primary/10 data-[highlighted]:!text-gray-900 data-[state=checked]:font-semibold data-[state=checked]:text-gray-900 [&_svg]:!text-primary";

/** Eden-style segmented ring BMI gauge + linear scale */
const BMI_GAUGE_SEGMENTS = 12;
/** Larger angular gap — round stroke caps eat ~stroke width of space */
const BMI_SEGMENT_GAP_DEG = 18;
const BMI_RING_STROKE = 18;
const BMI_RING_TRACK = "#E8E8E8";
const BMI_RING_GREENS = [
  "#A5D6A7",
  "#81C784",
  "#66BB6A",
  "#4CAF50",
  "#43A047",
  "#388E3C",
  "#2E7D32",
  "#1B5E20",
];

function getBmiFillRatio(bmi: number) {
  if (bmi <= 0) return 0;
  const min = 15;
  const max = 40;
  return Math.min(1, Math.max(0, (bmi - min) / (max - min)));
}

function getBmiScalePercent(bmi: number) {
  if (bmi <= 0) return 0;
  // Scale markers: <18.5 … >35
  return Math.min(100, Math.max(0, ((bmi - 18.5) / (35 - 18.5)) * 100));
}

function getBmiInsight(bmi: number) {
  if (bmi <= 0) return "";
  if (bmi < 18.5) {
    return "Your BMI score falls in the low range. It's just one snapshot of your health. Let's continue toward your personalized wellness plan.";
  }
  if (bmi < 25) {
    return "Your BMI score falls in the average range. It's just one snapshot of your health. Let's continue toward your personalized wellness plan.";
  }
  if (bmi < 27) {
    return "Your BMI score falls in the slightly high range. It's just one snapshot of your health. Let's continue toward your personalized wellness plan.";
  }
  return "Your BMI score falls in the range where medication might be prescribed, but it's just one snapshot of your health. Let's continue toward your personalized wellness plan.";
}

/** Smoothly animates a numeric value toward `target` (for BMI / gauge fill). */
function useAnimatedNumber(target: number, durationMs = 480) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    const from = valueRef.current;
    const to = target;
    if (Math.abs(from - to) < 0.001) {
      valueRef.current = to;
      setValue(to);
      return;
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      valueRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function BmiRingGauge({ bmi }: { bmi: number }) {
  const size = 240;
  const stroke = BMI_RING_STROKE;
  const radius = (size - stroke) / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const gapDeg = BMI_SEGMENT_GAP_DEG;
  const sweepDeg = 360 / BMI_GAUGE_SEGMENTS - gapDeg;

  const animatedBmi = useAnimatedNumber(bmi);
  const fillRatio = getBmiFillRatio(animatedBmi);
  const filledCount =
    animatedBmi > 0.5
      ? Math.max(1, Math.round(fillRatio * BMI_GAUGE_SEGMENTS))
      : 0;
  const displayValue = Math.round(animatedBmi);
  const [popKey, setPopKey] = useState(0);
  const prevTargetRef = useRef(bmi);

  useEffect(() => {
    if (Math.round(prevTargetRef.current) !== Math.round(bmi)) {
      setPopKey((k) => k + 1);
    }
    prevTargetRef.current = bmi;
  }, [bmi]);

  const polarToCartesian = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (startDeg: number, endDeg: number) => {
    const start = polarToCartesian(endDeg);
    const end = polarToCartesian(startDeg);
    const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  return (
    <div className="relative mx-auto flex h-[240px] w-[240px] items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {Array.from({ length: BMI_GAUGE_SEGMENTS }, (_, i) => {
          const startDeg = i * (360 / BMI_GAUGE_SEGMENTS) + gapDeg / 2;
          const endDeg = startDeg + sweepDeg;
          const isFilled = i < filledCount;
          const color = isFilled
            ? BMI_RING_GREENS[
                Math.min(
                  BMI_RING_GREENS.length - 1,
                  Math.floor(
                    (i / Math.max(1, filledCount - 1)) *
                      (BMI_RING_GREENS.length - 1)
                  )
                )
              ]
            : BMI_RING_TRACK;
          return (
            <path
              key={i}
              d={describeArc(startDeg, endDeg)}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{
                transition: "stroke 280ms ease-out",
              }}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          key={popKey}
          className="text-[64px] font-bold leading-none tracking-tight text-gray-900 tabular-nums"
          style={{
            animation: popKey > 0 ? "bmi-number-pop 320ms ease-out" : undefined,
          }}
        >
          {displayValue}
        </span>
        <span className="mt-1 text-[15px] text-gray-600">Your BMI</span>
      </div>
    </div>
  );
}

function BmiScaleBar({ bmi }: { bmi: number }) {
  const animatedBmi = useAnimatedNumber(bmi);
  const percent = getBmiScalePercent(animatedBmi);
  const insight = getBmiInsight(bmi);

  return (
    <div className="mx-auto w-full">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-500">
        <span>&lt;18.5</span>
        <span>&gt;35</span>
      </div>
      <div className="relative h-3.5 w-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #C8E6C9 0%, #81C784 33%, #4CAF50 66%, #1B5E20 100%)",
          }}
        />
        {bmi > 0 && (
          <div
            className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-[#1B5E20]"
            style={{
              left: `calc(${percent}% - 1px)`,
              transition: "left 480ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        )}
      </div>
      <div className="mt-2.5 grid grid-cols-4 text-[13px] text-gray-700 md:text-sm">
        <span className="text-left">Low</span>
        <span className="text-center">Average</span>
        <span className="text-center">Slightly High</span>
        <span className="text-right">High</span>
      </div>
      {insight ? (
        <p className="mt-6 text-center text-[15px] leading-relaxed text-gray-600 md:text-base">
          {insight}
        </p>
      ) : null}
    </div>
  );
}

const Questionnaire = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const [step, setStep] = useState(2);
  const [dobError, setDobError] = useState("");
  const [stateError, setStateError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  useEffect(() => {
    document.body.classList.add("questionnaire-page");
    return () => document.body.classList.remove("questionnaire-page");
  }, []);

  // ── State ──────────────────────────────────────────────────────────────────
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [state, setState] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [email, setEmail] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState("");
  const [smsTermsConsent, setSmsTermsConsent] = useState(true);
  const [smsTransactional, setSmsTransactional] = useState(false);
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [finalConsent, setFinalConsent] = useState(false);
  const [requiredFieldsWarning, setRequiredFieldsWarning] = useState("");
  const [genderError, setGenderError] = useState("");
  const [emailConsentError, setEmailConsentError] = useState("");
  const [smsConsentError, setSmsConsentError] = useState("");
  const [finalConsentError, setFinalConsentError] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiConsentChecked, setBmiConsentChecked] = useState(false);
  const [bmiConsentOpen, setBmiConsentOpen] = useState(false);
  const [goalWeight, setGoalWeight] = useState("");
  const [goalWeightError, setGoalWeightError] = useState("");
  const [currentlyTakesMedication, setCurrentlyTakesMedication] = useState("");
  const [selectedMedicationType, setSelectedMedicationType] = useState("");
  const [selectedDosage, setSelectedDosage] = useState("");
  const [selectedFinalMedication, setSelectedFinalMedication] = useState("");
  const [semaglutideProducts, setSemaglutideProducts] = useState<any[]>([]);
  const [tirzepatideProducts, setTirzepatideProducts] = useState<any[]>([]);
  const [loadingSema, setLoadingSema] = useState(false);
  const [loadingTirz, setLoadingTirz] = useState(false);
  const [semaFetchFailed, setSemaFetchFailed] = useState(false);
  const [tirzFetchFailed, setTirzFetchFailed] = useState(false);
  const [selectedPlan1, setSelectedPlan1] = useState('12-months');

  const startWeightNum = parseFloat(weight) || 0;
  const goalWeightNum = parseFloat(goalWeight) || 0;
  const computedLoseLbs = Math.max(0, startWeightNum - goalWeightNum);

  // Track selected button option: 'none' | 'glp1' | 'other'
  const [medicationStatus, setMedicationStatus] = useState<string>('');
  // Track optional text detail context for previous history
  const [medicationDetails, setMedicationDetails] = useState<string>('');

  // DOB
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (!dobMonth) return '';
    if (!dobDay) return dobMonth;
    return `${dobMonth}/${dobDay}/${dobYear}`;
  });

  // Sync internal layout if parent components reset or change the state from outside
  useEffect(() => {
    if (!dobMonth && !dobDay && !dobYear) {
      setDisplayValue('');
    }
  }, [dobMonth, dobDay, dobYear]);

  // Handle backspace gracefully when trailing character is a slash
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const target = e.currentTarget;
      const value = target.value;
      
      // If the character right before the cursor is a slash, drop it along with the previous digit
      if (value.endsWith('/') && target.selectionStart === value.length) {
        e.preventDefault();
        const updatedValue = value.slice(0, -2);
        setDisplayValue(updatedValue);
        updateParentStates(updatedValue);
      }
    }
  };

  const updateParentStates = (formattedString: string) => {
    const segments = formattedString.split('/');
    const month = segments[0] || '';
    const day = segments[1] || '';
    const year = segments[2] || '';
    setDobMonth(month);
    setDobDay(day);
    setDobYear(year);

    if (!month || !day || year.length !== 4) {
      setDobError("");
      return;
    }

    const age = getAgeFromDob(month, day, year);
    if (age === null) {
      setDobError("Please enter a valid date of birth.");
    } else if (age < 18 || age > 75) {
      setDobError("You must be between 18 and 75 years old to be eligible.");
    } else {
      setDobError("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleanInput = input.replace(/\D/g, ''); // Extract only raw numeric values
    
    let formatted = '';
    if (cleanInput.length > 0) {
      formatted += cleanInput.substring(0, 2); // Month
    }
    if (cleanInput.length > 2) {
      formatted += '/' + cleanInput.substring(2, 4); // Day
    }
    if (cleanInput.length > 4) {
      formatted += '/' + cleanInput.substring(4, 8); // Year
    }

    setDisplayValue(formatted);
    updateParentStates(formatted);
  };

  const getFutureDate = (monthsToAdd: number) => {
  const date = new Date();

  date.setMonth(date.getMonth() + monthsToAdd);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

  const plansData: Record<
  string,
  {
    months: number;
    targetDate: string;
    midpointLabel: string;
  }
> = {
  '3-months': {
    months: 3,
    targetDate: getFutureDate(3),
    midpointLabel: '1.5 mo',
  },

  '6-months': {
    months: 6,
    targetDate: getFutureDate(6),
    midpointLabel: '3 mo',
  },

  '12-months': {
    months: 12,
    targetDate: getFutureDate(12),
    midpointLabel: '6 mo',
  },
};

const commonGraph = {
  remedyPath:
    "M -10,105 C 40,105 90,120 140,165 C 185,205 240,245 360,255",

  glp1Path:
    "M -10,105 C 40,105 90,120 140,165 C 190,185 260,205 360,195",

  glp1DotY: 195,
};

const activeData = {
  ...(plansData[selectedPlan1] || plansData['12-months']),
  ...commonGraph,
};
const [showGraphContent, setShowGraphContent] = useState(false);

useEffect(() => {
  if (step === 5) {
    setShowGraphContent(false);

    const timer = setTimeout(() => {
      setShowGraphContent(true);
    }, 100);

    return () => clearTimeout(timer);
  }
}, [step, selectedPlan1]);

useEffect(() => {
  setShowGraphContent(false);

  const timer = setTimeout(() => {
    setShowGraphContent(true);
  }, 2000);

  return () => clearTimeout(timer);
}, [selectedPlan1]);

  useEffect(() => {
    if (selectedMedicationType === "semaglutide" && semaglutideProducts.length === 0) {
      fetchSemaglutideProducts();
    } else if (selectedMedicationType === "tirzepatide" && tirzepatideProducts.length === 0) {
      fetchTirzepatideProducts();
    }
  }, [selectedMedicationType]);

  useEffect(() => {
    if (step === 8 || step === 10) {
      if (semaglutideProducts.length === 0) fetchSemaglutideProducts();
      if (tirzepatideProducts.length === 0) fetchTirzepatideProducts();
    }
  }, [step]);

  // Some whitelabel endpoints may return mixed product rows.
  // Filter them so the Plans page can reliably map monthly/3/6/12-month SKUs.
  const isSemaglutideProduct = (p: any) => {
    const sku = String(p?.sku || "").toLowerCase();
    const name = String(p?.product_name || "").toLowerCase();
    return (
      sku.includes("semaginj") ||
      name.includes("semaglutide") ||
      (name.includes("glp-1") && !name.includes("gip"))
    );
  };

  const isTirzepatideProduct = (p: any) => {
    const sku = String(p?.sku || "").toLowerCase();
    const name = String(p?.product_name || "").toLowerCase();
    return (
      sku.includes("tirz") ||
      name.includes("tirzepatide") ||
      (name.includes("glp-1") && name.includes("gip")) ||
      name.includes("+ gip")
    );
  };

  const fetchSemaglutideProducts = async () => {
    setLoadingSema(true);
    setSemaFetchFailed(false);
    try {
      const response = await axios.get(
        "https://panel.whitelabelmd.com/affordablewellness/api/get_all_sema"
      );
      if (response.data.status === 1) {
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        const filtered = list.filter(isSemaglutideProduct);
        setSemaglutideProducts(filtered);
        if (!getMonthlyStartingPriceFromProducts(filtered)) {
          setSemaFetchFailed(true);
        }
      } else {
        setSemaFetchFailed(true);
      }
    } catch (error) {
      console.error("Error fetching semaglutide products:", error);
      setSemaFetchFailed(true);
    } finally {
      setLoadingSema(false);
    }
  };

  const fetchTirzepatideProducts = async () => {
    setLoadingTirz(true);
    setTirzFetchFailed(false);
    try {
      const response = await axios.get(
        "https://panel.whitelabelmd.com/affordablewellness/api/get_all_tirz"
      );
      if (response.data.status === 1) {
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        const filtered = list.filter(isTirzepatideProduct);
        setTirzepatideProducts(filtered);
        if (!getMonthlyStartingPriceFromProducts(filtered)) {
          setTirzFetchFailed(true);
        }
      } else {
        setTirzFetchFailed(true);
      }
    } catch (error) {
      console.error("Error fetching tirzepatide products:", error);
      setTirzFetchFailed(true);
    } finally {
      setLoadingTirz(false);
    }
  };

  const renderMedicationStartingPrice = (
    loading: boolean,
    fetchFailed: boolean,
    products: any[],
  ) => {
    if (loading) {
      return (
        <span className="text-sm text-gray-400 animate-pulse">
          Loading pricing...
        </span>
      );
    }
    const monthly = getMonthlyStartingPriceFromProducts(products);
    if (monthly != null && !fetchFailed) {
      return (
        <>
          <span className="text-xs text-gray-400">Starting at </span>
          <span className="text-xl font-extrabold text-primary">
            ${formatPriceValue(monthly)}
          </span>
          <span className="text-sm text-gray-400">/mo</span>
        </>
      );
    }
    return (
      <span className="text-sm text-gray-500">
        Pricing temporarily unavailable
      </span>
    );
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleStep1Continue = () => {
    if (!agreedToTerms) return;
    setStep(2);
  };

  const handleStep2Continue = () => {
    let hasError = false;
    const missingFields: string[] = [];

    if (!firstName.trim()) missingFields.push("first name");
    if (!lastName.trim()) missingFields.push("last name");

    if (!gender) {
      setGenderError("Please select your sex assigned at birth.");
      hasError = true;
    } else {
      setGenderError("");
    }

    if (!dobMonth || !dobDay || !dobYear) {
      setDobError("Please enter your date of birth.");
      hasError = true;
    } else {
      const age = getAgeFromDob(dobMonth, dobDay, dobYear);
      if (age === null) {
        setDobError("Please enter a valid date of birth.");
        hasError = true;
      } else if (age < 18 || age > 75) {
        setDobError("You must be between 18 and 75 years old to be eligible.");
        hasError = true;
      } else {
        setDobError("");
      }
    }

    if (!state) {
      setStateError("Please select your state.");
      hasError = true;
    } else if (isExcludedState(state)) {
      setStateError("We are not currently available in this state.");
      hasError = true;
    } else {
      setStateError("");
    }

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      missingFields.push("email");
    }

    if (!emailConsent) {
      setEmailConsentError(
        "Please check the box to agree to email messages before continuing."
      );
      hasError = true;
    } else {
      setEmailConsentError("");
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      missingFields.push("mobile number");
    }

    setSmsConsentError("");

    if (!finalConsent) {
      setFinalConsentError(
        "Please check the box to consent to phone calls and/or SMS messages before continuing."
      );
      hasError = true;
    } else {
      setFinalConsentError("");
    }

    if (missingFields.length > 0) {
      const list =
        missingFields.length === 1
          ? missingFields[0]
          : missingFields.length === 2
            ? `${missingFields[0]} and ${missingFields[1]}`
            : `${missingFields.slice(0, -1).join(", ")}, and ${missingFields[missingFields.length - 1]}`;
      setRequiredFieldsWarning(
        `Please fill in all required fields (${list}) to continue.`
      );
      hasError = true;
    } else {
      setRequiredFieldsWarning("");
    }

    if (hasError) return;

    saveQuestionnaireLead(
      buildQuestionnaireLeadRecord({
        state,
        firstName,
        lastName,
        email: emailTrimmed,
        emailConsent,
        phone,
        smsConsent,
        dobYear,
        dobMonth,
        dobDay,
        gender,
        heightFeet,
        heightInches,
        weight,
        goalWeight,
        currentlyTakesMedication,
        selectedMedicationType,
        selectedDosage,
        medicationType: selectedFinalMedication,
      }),
    );
    void sendPlansPageLeadWebhook({
      email: emailTrimmed,
      first_name: firstName,
      last_name: lastName,
      phone,
    });

    setSmsTransactional(smsConsent === "yes");
    setStep(10);
  };

  const handleStep3Continue = () => {
    if (!dobMonth || !dobDay || !dobYear) return;
    setStep(4);
  };

  const handleStep4Continue = () => {
    const weightNum = parseFloat(weight);
    const inchesNum = heightInches === "" ? NaN : parseInt(heightInches, 10);
    if (!heightFeet || heightInches === "" || !weight) return;
    if (Number.isNaN(inchesNum) || inchesNum < 0 || inchesNum > 11) return;
    if (!Number.isFinite(weightNum) || weightNum < 50) return;
    // Temporarily bypass BMI consent, pace, projection graph, and results comparison.
    setStep(7);
  };

  const handleBmiConsentContinue = () => {
    if (!bmiConsentChecked) return;
    setStep(4);
  };

  const handleStep5Continue = () => {
    setGoalWeightError("");
    setStep(7);
  };

  const handleStep11Continue = () => {
    if (!selectedPlan1) return;
    setStep(5);
  };
   const handleStep12Continue = () => {

    setStep(6);
  };
     const handleStep13Continue = () => {

    setStep(7);
  };

  const handleStep14Continue = () => {
    if (!medicationStatus) return;

    if (medicationStatus === "semaglutide") {
      setCurrentlyTakesMedication("yes");
      setSelectedMedicationType("semaglutide");
      setSelectedFinalMedication("semaglutide");
    } else if (medicationStatus === "tirzepatide") {
      setCurrentlyTakesMedication("yes");
      setSelectedMedicationType("tirzepatide");
      setSelectedFinalMedication("tirzepatide");
    } else {
      setCurrentlyTakesMedication("no");
      setSelectedMedicationType("");
      setSelectedFinalMedication("");
    }

    setStep(8);
  };

  const handlePlanSelect = (plan: string) => {
  if (plan === 'help-me-choose') {
    setSelectedPlan1('12-months');
  } else {
    setSelectedPlan1(plan);
  }

  setStep(5);
};

  const handleStep6Continue = () => setStep(7);

  const handleMedQuestionSelect = (value: string) => {
    setCurrentlyTakesMedication(value);
    setTimeout(() => {
      if (value === "yes") setStep(8);
      else setStep(10);
    }, 300);
  };

  const handleStep8Selection = (medicationType: string) => {
    setSelectedMedicationType(medicationType);
    setTimeout(() => setStep(9), 300);
  };

  const handleStep9Continue = () => {
    if (!selectedDosage) return;
    setStep(10);
  };

  const handleStep10Selection = (medicationType: string) => {
    setSelectedFinalMedication(medicationType);
    saveQuestionnaireLead(
      buildQuestionnaireLeadRecord({
        state,
        firstName,
        lastName,
        email: email.trim(),
        emailConsent,
        phone,
        smsConsent,
        dobYear,
        dobMonth,
        dobDay,
        gender,
        heightFeet,
        heightInches,
        weight,
        goalWeight,
        currentlyTakesMedication,
        selectedMedicationType,
        selectedDosage,
        medicationType,
      }),
    );
    setTimeout(() => {
      navigate("/plans" + mergeAffiliateIntoSearch(search), {
        state: {
          medicationType,
          selectedDosage,
          semaglutideProducts,
          tirzepatideProducts,
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
        },
      });
    }, 300);
  };

  const calculateWeightLoss = () => {
    const curr = parseFloat(weight);
    const goal = parseFloat(goalWeight);
    return curr > goal ? curr - goal : 0;
  };

  const formatPhoneNumber = (value: string) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 3) return n;
    if (n.length <= 6) return `(${n.slice(0, 3)}) ${n.slice(3)}`;
    return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };


    // ─── STEP 2: Height & Weight ───────────────────────────────────────────────
  if (step === 2) {
    const weightNum = parseFloat(weight);
    const inchesNum = heightInches === "" ? NaN : parseInt(heightInches, 10);
    const feetNum = heightFeet === "" ? NaN : parseInt(heightFeet, 10);
    const hasWeightError =
      weight !== "" && (!Number.isFinite(weightNum) || weightNum < 50);
    const hasInchesError =
      heightInches !== "" &&
      (!Number.isFinite(inchesNum) || inchesNum < 0 || inchesNum > 11);
    const hasFeetError =
      heightFeet !== "" && (!Number.isFinite(feetNum) || feetNum < 3 || feetNum > 8);

    const canComputeBmi =
      Number.isFinite(feetNum) &&
      Number.isFinite(inchesNum) &&
      !hasFeetError &&
      !hasInchesError &&
      Number.isFinite(weightNum) &&
      !hasWeightError &&
      weightNum >= 50;

    const totalInches = canComputeBmi ? feetNum * 12 + inchesNum : 0;
    const bmi = canComputeBmi
      ? (weightNum * 703) / (totalInches * totalInches)
      : 0;

    const bumpWeight = (delta: number) => {
      const current = parseFloat(weight);
      const base = Number.isFinite(current) ? current : 0;
      const next = Math.max(0, Math.min(800, base + delta));
      setWeight(String(next));
    };

    const canContinue =
      !!heightFeet &&
      heightInches !== "" &&
      !!weight &&
      !hasFeetError &&
      !hasInchesError &&
      !hasWeightError &&
      weightNum >= 50;

    return (
      <QuizShell>
        <QuizHeader step={step} />

        <div className="mx-auto max-w-xl px-5 pb-10 pt-6 md:pt-8">
          <div className="mb-8">
            <h1 className="mb-2 text-[28px] font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
              Enter your height and weight
            </h1>
            <p className="text-base text-gray-500">
              This will help calculate your BMI to check your eligibility.
            </p>
          </div>

          <div className="mb-8 space-y-6">
            {/* Height */}
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-gray-900">
                Height
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={3}
                    max={8}
                    value={heightFeet}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                      setHeightFeet(v);
                    }}
                    className={`h-14 rounded-xl border bg-white px-4 text-left text-lg font-semibold text-gray-900 shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      hasFeetError
                        ? "border-red-400 focus-visible:border-red-400"
                        : "border-gray-200 focus-visible:border-gray-400"
                    }`}
                  />
                  <p className="mt-1.5 text-left text-sm text-gray-500">Feet</p>
                  {hasFeetError && (
                    <p className="mt-1 text-left text-sm text-red-500">
                      Height must be between 3 and 8 feet
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={11}
                    value={heightInches}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                      setHeightInches(v);
                    }}
                    className={`h-14 rounded-xl border bg-white px-4 text-left text-lg font-semibold text-gray-900 shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      hasInchesError
                        ? "border-red-400 focus-visible:border-red-400"
                        : "border-gray-200 focus-visible:border-gray-400"
                    }`}
                  />
                  <p className="mt-1.5 text-left text-sm text-gray-500">Inches</p>
                  {hasInchesError && (
                    <p className="mt-1 text-left text-sm text-red-500">
                      Inches must be between 0 and 11
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-gray-900">
                Weight (pounds)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={800}
                  value={weight}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d.]/g, "");
                    setWeight(v);
                  }}
                  className={`h-14 rounded-xl border bg-white px-4 pr-12 text-left text-lg font-semibold text-gray-900 shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                    hasWeightError
                      ? "border-red-400 focus-visible:border-red-400"
                      : "border-gray-200 focus-visible:border-gray-400"
                  }`}
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col">
                  <button
                    type="button"
                    aria-label="Increase weight"
                    onClick={() => bumpWeight(1)}
                    className="flex h-5 w-7 items-center justify-center text-gray-400 hover:text-gray-700"
                  >
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                      <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Decrease weight"
                    onClick={() => bumpWeight(-1)}
                    className="flex h-5 w-7 items-center justify-center text-gray-400 hover:text-gray-700"
                  >
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              {hasWeightError && (
                <p className="mt-1.5 text-left text-sm font-medium text-red-500">
                  Minimum weight is 50 lbs
                </p>
              )}
            </div>
          </div>

          {/* BMI ring + scale */}
          <div className="mb-8 mt-2 flex w-full flex-col items-center gap-6">
            <BmiRingGauge bmi={bmi} />
            {bmi > 0 ? (
              <div className="w-full">
                <BmiScaleBar bmi={bmi} />
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleStep4Continue}
            disabled={!canContinue}
            className="flex w-full items-center justify-center rounded-full bg-black py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </QuizShell>
    );
  }

  // ─── STEP 21: BMI Consent ─────────────────────────────────────────────────
  if (step === 21) {
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(2)} />

        <div className="mx-auto max-w-xl px-5 pb-10 pt-6 md:pt-8">
          <div className="mb-6">
            <h1 className="mb-2 text-[28px] font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
              BMI Consent
            </h1>
            <p className="text-base text-gray-500">
              Please read the following for more information about this product
              and its potential side effects.
            </p>
          </div>

          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-300 bg-white">
            <button
              type="button"
              onClick={() => setBmiConsentOpen((open) => !open)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-[15px] font-semibold text-gray-900">
                BMI Consent
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 text-gray-500 transition-transform ${bmiConsentOpen ? "" : "rotate-180"}`}
                aria-hidden
              >
                <path
                  d="M4 10L8 6L12 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {bmiConsentOpen && (
              <div className="max-h-[300px] overflow-y-auto px-4 pb-4 pt-1">
                <p className="text-sm leading-relaxed text-gray-600">
                  Weight loss medications are traditionally prescribed for
                  patients with a BMI of 30 and above. In certain cases, patients
                  with a BMI between 27 and 29 who also have weight-related health
                  conditions may be candidates for treatment. Use in this range
                  may be considered &quot;off-label.&quot;
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  According to the FDA, off-label use means a medication is
                  prescribed for a purpose or patient population other than what
                  is listed on the FDA-approved label. A licensed provider may
                  prescribe off-label when they determine it is medically
                  appropriate for you based on your health information.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Always follow the regimen prescribed by your provider and
                  discuss any questions or concerns with them. Compounded
                  medications are not FDA-approved finished drug products, and
                  individual results vary.
                </p>
              </div>
            )}
          </div>

          <label className="mb-8 flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={bmiConsentChecked}
              onCheckedChange={(checked) =>
                setBmiConsentChecked(checked === true)
              }
              className="mt-0.5 h-5 w-5 rounded border-gray-400 data-[state=checked]:border-black data-[state=checked]:bg-black"
            />
            <span className="text-sm leading-snug text-gray-700">
              By checking this box, you acknowledge that you have read and
              understood the information above.
            </span>
          </label>

          <button
            type="button"
            onClick={handleBmiConsentContinue}
            disabled={!bmiConsentChecked}
            className="flex w-full items-center justify-center rounded-full bg-black py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </QuizShell>
    );
  }

    // ─── STEP 3: Goal Weight ───────────────────────────────────────────────────
  if (step === 3) {
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(21)} />

        <div className="max-w-xl mx-auto px-5 py-10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-snug">
              Get Moving. Lose Weight. We&apos;ll guide this with a phased, step-by-step approach.
            </h1>
          </div>

          <button
            type="button"
            onClick={handleStep5Continue}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </QuizShell>
    );
  }

    // ─── STEP 4: Medication Month ───────────────────────────────────────────────
  if (step === 4) {
   
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(21)} />

        <div className="max-w-xl mx-auto px-5 py-12">
          <div className=" mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              What pace feels right for you?
            </h1>
            <p className="text-gray-500 text-base">
              Your pace determines how quickly your clinician can increase your dose and how it's tailored to you.
            </p>
          </div>

          <div className="space-y-3">

            <button
              onClick={() => handlePlanSelect('3-months')}
              className={`w-full flex items-center gap-4 p-5 text-left rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]
                ${
                  selectedPlan1 === '3-months'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base md:text-lg text-gray-700">
                  3 Months
                </p>

                <p className="text-sm text-gray-500 mt-0.5">
                  Faster results
                </p>
              </div>
            </button>

            <button
              onClick={() => handlePlanSelect('6-months')}
              className={`w-full flex items-center gap-4 p-5 text-left rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]
                ${
                  selectedPlan1 === '6-months'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base md:text-lg text-gray-700">
                  6 Months
                </p>

                <p className="text-sm text-gray-500 mt-0.5">
                  Steady & sustainable
                </p>
              </div>
            </button>

            <button
              onClick={() => handlePlanSelect('12-months')}
              className={`w-full flex items-center gap-4 p-5 text-left rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]
                ${
                  selectedPlan1 === '12-months'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base md:text-lg text-gray-700">
                  12 Months
                </p>

                <p className="text-sm text-gray-500 mt-0.5">
                  Gentle & gradual
                </p>
              </div>
            </button>

            <button
              onClick={() => handlePlanSelect('12-months')}
              className={`w-full flex items-center gap-4 p-5 text-left rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]
                ${
                  selectedPlan1 === 'help-me-choose'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base md:text-lg text-gray-700">
                  Help me choose
                </p>

                <p className="text-sm text-gray-500 mt-0.5">
                  Matched to your body & target weight
                </p>
              </div>
            </button>

          </div>
          <button
            type="button"
            onClick={handleStep11Continue}
            disabled={!heightFeet || heightInches === "" || !weight}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-6"
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </QuizShell>
    );
  }

   // ─── STEP 5: Medication Graph ───────────────────────────────────────────────

  if (step === 5) {

    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(4)} />
   
        <div className="max-w-xl mx-auto p-4 select-none pt-4">
          
          {/* --- MAIN GRAPH CARD CONTAINER --- */}
          <div className="w-full bg-[#E0E6EF] rounded-[32px] text-white overflow-hidden relative shadow-lg min-h-[480px] flex flex-col justify-between pb-6">
            
            {/* Header Text Section */}
            <div className="p-6">
              <h2 className="text-[32px] font-medium leading-tight tracking-tight flex flex-wrap items-center gap-x-2">
                <span>Lose</span>
                <span className="font-semibold tabular-nums transition-all duration-300">
                  {computedLoseLbs} lbs
                </span>
              </h2>
              <h2 className="text-[32px] font-medium leading-tight tracking-tight mt-1 flex items-center gap-2">
                <span>in</span>
                <span className="bg-primary text-primary-foreground px-3 py-0.5 rounded-xl font-semibold inline-block transition-all duration-300">
                  {activeData.months} months
                </span>
              </h2>
              
              <p className="text-sm opacity-80 font-normal leading-relaxed max-w-[310px] mt-4">
                Members with your profile have hit this goal. Your dose, plan & timeline are calibrated to match.
              </p>
            </div>

            {/* Dynamic Graph Section */}
            <div className="relative w-full h-[309px] mt-4 self-end">
              
              {/* SVG Canvas for Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 343" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Vertical Dotted Guide Timelines */}
                <line x1="75" y1="140" x2="75" y2="310" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="180" y1="180" x2="180" y2="310" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="285" y1="220" x2="285" y2="310" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3,3" />

                {/* GLP-1 Line */}
                <path
                  d={activeData.glp1Path}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-graphLine"
                />

                {/* Area Fill */}
                <path
                  d={`${activeData.remedyPath} L 360,280 L -10,280 Z`}
                  fill="url(#areaGradient)"
                  className={`transition-opacity duration-700 ${
                    showGraphContent ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Main Remedy Line */}
                <path
                  d={activeData.remedyPath}
                  fill="none"
                  stroke="#2D476F"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="animate-graphLine"
                />
              </svg>

              {/* 1. Starting Weight Badge - Keeps real 'weight' state value static */}
              <div
                  className={`absolute left-[21%] top-[130px] 
                  -translate-x-1/2 -translate-y-full flex flex-col items-center
                  transition-all duration-500 delay-200
                  ${
                    showGraphContent
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75'
                  }`}
                >
                <div className="bg-primary text-primary-foreground px-2.5 py-1.5 rounded-full text-center min-w-[48px] shadow-sm">
                  <p className="text-xs font-bold tabular-nums transition-all duration-300">
                    {startWeightNum}
                  </p>
                  <p className="text-[9px] opacity-70 font-medium">Lbs</p>
                </div>
              </div>

              {/* 2. GLP-1 Standard Plateau Pointer Dot Indicator */}
              <div
                style={{
                  left: `79%`,
                  top: `175px`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center
                transition-all duration-700 delay-300
                ${
                  showGraphContent
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-75'
                }`}
              >
                <div className="absolute bottom-4 text-center whitespace-nowrap">
                  <p className="text-[10px] font-semibold text-white tracking-wide">
                    GLP-1
                  </p>

                  <p className="text-[10px] opacity-80 text-white font-medium">
                    Alone
                  </p>
                </div>

                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md" />
              </div>

              {/* 3. Target Goal Badge - Keeps real 'goalWeight' state value static */}
              <div
                  className={`absolute left-[79%] bottom-[48px]
                  -translate-x-1/2 flex flex-col items-center
                  transition-all duration-700 delay-500
                  ${
                    showGraphContent
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75'
                  }`}
                >
                <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-[20px] text-center min-w-[90px] shadow-md border border-white/5 backdrop-blur-sm">
                  <p className="text-[11px] font-serif opacity-90 tracking-wide font-medium">Affordable Wellness</p>
                  <p className="text-xl font-bold leading-none my-0.5 tabular-nums transition-all duration-300">
                    {goalWeightNum} <span className="text-xs font-normal">Lbs</span>
                  </p>
                  <p className="text-[9px] opacity-80 tracking-wide font-medium">Your goal</p>
                </div>
                
              </div>

              {/* --- BOTTOM X-AXIS LABELS --- */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between px-6 text-[11px] font-medium opacity-80 tracking-wide max-w-[88%] md:max-w-[432px] mx-auto">
                <span className="w-16 text-center">Today</span>
                <span className="w-16 text-center tabular-nums transition-all duration-300">
                  {activeData.midpointLabel}
                </span>
                <span className="w-16 text-center transition-all duration-300">
                  {activeData.targetDate}
                </span>
              </div>

            </div>
          </div>

          {/* Action CTAs */}
          <button
            type="button"
            onClick={handleStep12Continue}
            disabled={!heightFeet || heightInches === "" || !weight}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-6"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </QuizShell>
    );
  }

  // ─── STEP 6: better result ───────────────────────────────────────
  if (step === 6) {
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(5)} />

        <div className="max-w-xl mx-auto px-5 py-12 pt-4">
          <div className=" mb-10">
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
              <span className="font-semibold">58% better results</span> than standard GLP-1 alone — clinically backed.
            </h1>
            {/* <p className="text-gray-500 text-base">
              This helps our doctors understand your current medication status
            </p> */}
          </div>

          <div className="space-y-3">
            <div className="w-full bg-gradient-to-b from-[#2D476F] via-[#4A6289]/85 to-[#F2F0EE] rounded-3xl p-6 pb-0 overflow-hidden">
            
            {/* Split Comparison Columns */}
            <div className="grid grid-cols-[124px_100px] gap-6 justify-center">
              
              <div className="flex flex-col gap-4">
                <div>
                    <img src={forbes} alt="" className="h-16 object-contain" />
                </div>
             
                {/* Left Column: Remedy High Performer Card */}
                <div className="bg-[#243247] rounded-2xl p-4 flex flex-col justify-between relative shadow-sm border border-white/10">
                  
                  {/* Brand Identifier Header */}
                  <div className="text-center pt-1">
                    <span className="text-lg font-serif tracking-wide font-bold text-white">
                      Affordable Wellness
                    </span>
                  </div>

                  {/* Overlapping Floating Assets Graphic Cluster */}
                  <div className=" mt-2">
                    <img src={doctorcollage} alt="" className="w-full object-contain" />
                  </div>

                  {/* Metric Value Footer */}
                  <div className="pt-2  text-white">
                    <p className="text-[10px] uppercase tracking-wider text-white font-semibold">up to</p>
                    <p className="text-3xl md:text-4xl font-bold leading-none tracking-tight flex items-baseline gap-0.5 tabular-nums">
                      40<span className="text-sm font-normal normal-case tracking-normal ml-0.5 opacity-95">lbs</span>
                    </p>
                  </div>
                </div>
               </div>
              {/* Right Column: Standard GLP-1 Base Card */}
              <div className=" text-slate-800 flex flex-col gap-2 justify-end">
                
                {/* Description Header */}
                
                  <p className="text-sm text-gray-700 text-center leading-tight">
                    GLP-1 Meds <span className="block text-sm text-gray-700">(only)</span>
                  </p>
                
                <div className="bg-[#F2F0EE] rounded-2xl pt-0.5 pb-4 w-full -mb-1.5">

                {/* Minimal Single Injection Vial Graphic */}
                <div className="my-4 flex justify-center items-center h-20">
                  <div className="relative flex items-end gap-1.5">
                    <img src={glpsyringe} alt="" />
                    {/* <div className="w-2 h-14 bg-slate-200 border border-slate-300 rounded-t-xs" /> */}
                  </div>
                </div>

                {/* Metric Value Footer */}
                <div className="pt-2 px-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-700 font-semibold">up to</p>
                  <p className="text-3xl md:text-4xl font-bold text-slate-700 leading-none tracking-tight flex items-baseline gap-0.5 tabular-nums">
                    24<span className="text-sm font-normal normal-case tracking-normal ml-0.5 text-slate-700">lbs</span>
                  </p>
                </div>
                </div>
              </div>

            </div>
          </div>

          {/* --- CLINICAL BACKING FOOTER COMPLIANCE CITATION TEXT --- */}
          <div className="!mt-6 px-1">
            <p className="text-[10px] md:text-[11px] text-gray-400 font-normal leading-relaxed text-left tracking-normal">
              Results are based on self-reported data from ~300,000 Affordable Wellness members on personalized treatment plans, including compounded GLP-1 medications and clinician consultations. Members reported their weight on their initial medical intake questionnaire and every 3-4 weeks thereafter. Individual results may vary. Stats compared to outcomes reported for GLP-1 medications alone in Rodriguez P., et al. (2024). "Semaglutide vs Tirzepatide for Weight Loss in Adults with Overweight or Obesity," <span className="italic">JAMA Internal Medicine</span>.
            </p>
          </div>
            
          </div>
          {/* Action CTAs */}
          <div className="mt-auto md:mt-0 sticky bottom-0 z-10 pt-8 pb-6 bg-gradient-to-t from-white to-white/0 -mx-[calc(50vw-50%)] px-[calc(50vw-50%)]">
          <button
            type="button"
            onClick={handleStep13Continue}
            disabled={!heightFeet || heightInches === "" || !weight}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-6"
          >
            Continue
            <ArrowRight size={18} />
          </button>
          </div>
        </div>
      </QuizShell>
    );
  }

    // ─── STEP 7: Currently Taking Meds? ───────────────────────────────────────
  if (step === 7) {
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(2)} />

        <div className="max-w-xl mx-auto px-5 py-12">
          <div className=" mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Have you taken any of the following medication in the last 4 weeks?
            </h1>
          </div>

          <div className="space-y-3">
            <OptionCard
              label="Semaglutide (Ozempic, Wegovy, Rybelsus)"
              selected={medicationStatus === "semaglutide"}
              onClick={() => setMedicationStatus("semaglutide")}
            />
            <OptionCard
              label="Tirzepatide (Zepbound, Mounjaro)"
              selected={medicationStatus === "tirzepatide"}
              onClick={() => setMedicationStatus("tirzepatide")}
            />
            <OptionCard
              label="No"
              selected={medicationStatus === "none"}
              onClick={() => setMedicationStatus("none")}
            />
          </div>

          <button
            type="button"
            onClick={handleStep14Continue}
            disabled={!medicationStatus}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mt-6 shadow-xs"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
        
      </QuizShell>
    );
  }

  // ─── STEP 8: Personal Information ─────────────────────────────────────────
  if (step === 8) {
    const options = ["female", "male"];
    const fieldInputClass =
      "w-full h-14 rounded-[12px] border border-gray-300 px-5 text-base text-gray-900 placeholder-slate-400 font-normal outline-none transition-all duration-150 bg-white focus:border-primary focus:border-2";

    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(7)} />

        <div className="max-w-xl mx-auto px-5 py-8">
          <div className="self-stretch flex items-start gap-3 md:gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-snug">
              Almost there — your clinician just needs a few quick details.
            </h1>
            <div className="relative overflow-hidden rounded-full h-[60px] w-[60px] min-w-[60px] border-2 border-white bg-gradient-to-br from-slate-100 to-slate-400 shadow-lg">
              <img
                src={doctorImage}
                alt=""
                className="h-full w-full object-cover object-center md:object-[center_35%]"
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* First / Last name */}
            <div className="space-y-3">
              <label className="block text-slate-900 text-base font-medium">
                Your name
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (requiredFieldsWarning) setRequiredFieldsWarning("");
                  }}
                  placeholder="First name"
                  autoComplete="given-name"
                  className={fieldInputClass}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (requiredFieldsWarning) setRequiredFieldsWarning("");
                  }}
                  placeholder="Last name"
                  autoComplete="family-name"
                  className={fieldInputClass}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="w-full flex flex-col justify-start items-start select-none">
              <label className="block text-slate-900 text-base font-medium mb-3">
                Sex assigned at birth:
              </label>
              <div className="w-full flex items-center">
                {options.map((option, index) => {
                  const isSelected = gender === option;
                  const isFirst = index === 0;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setGender(option);
                        setGenderError("");
                      }}
                      className={`
                      flex-1 h-14 font-medium text-base text-center transition-all duration-150 relative
                      ${isFirst ? "rounded-l-[12px]" : "rounded-r-[12px] -ml-[1px]"}
                      ${
                        isSelected
                          ? "border-primary border-2 bg-primary/5 text-gray-900 font-semibold z-10"
                          : "border-gray-300 border-2 text-slate-600 hover:bg-gray-50 z-0"
                      }
                    `}
                    >
                      <span className="capitalize">{option}</span>
                    </button>
                  );
                })}
              </div>
              {genderError ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 mt-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-snug">{genderError}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 px-1 text-slate-500">
                  <Stethoscope size={13} className="text-slate-400 stroke-[2.2]" />
                  <span className="justify-start text-gray-600 text-xs font-normal leading-4">
                    Helps your clinician personalize your dosing
                  </span>
                </div>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="block text-slate-900 text-base font-medium mb-3">
                Date of Birth:
              </label>
              <div className="w-full relative">
                <input
                  type="text"
                  maxLength={10}
                  inputMode="numeric"
                  value={displayValue}
                  onChange={handleInputChange}
                  placeholder="MM/DD/YYYY"
                  className={fieldInputClass}
                />
              </div>
              {dobError ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 mt-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-snug">{dobError}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 px-1 text-slate-500">
                  <Info size={14} className="text-slate-400 stroke-[2.2]" />
                  <span className="justify-start text-gray-600 text-xs font-normal leading-4">
                    Ages 18-75 are eligible for treatment
                  </span>
                </div>
              )}
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <Select
                value={state}
                onValueChange={(value) => {
                  setState(value);
                  setStateError("");
                }}
              >
                <SelectTrigger className={QUIZ_SELECT_TRIGGER}>
                  <SelectValue placeholder="Select your state..." />
                </SelectTrigger>
                <SelectContent className={QUIZ_SELECT_CONTENT}>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s} className={QUIZ_SELECT_ITEM}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stateError ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 mt-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-snug">{stateError}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 px-1 text-slate-500">
                  <Info size={14} className="text-slate-400 stroke-[2.2]" />
                  <span className="justify-start text-gray-600 text-xs font-normal leading-4">
                    Ensures your provider is licensed in your state
                  </span>
                </div>
              )}
            </div>

            {/* Email + consent */}
            <div className="space-y-3">
              <label className="block text-slate-900 text-base font-semibold">
                Please enter your email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (requiredFieldsWarning) setRequiredFieldsWarning("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={fieldInputClass}
              />
              <div
                className={`rounded-xl p-4 ${
                  emailConsentError
                    ? "border border-amber-400 bg-amber-50/40"
                    : "bg-[#E8EEF6]"
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={emailConsent}
                    onCheckedChange={(c) => {
                      setEmailConsent(c === true);
                      if (c === true) setEmailConsentError("");
                    }}
                    className={`mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary ${
                      emailConsentError ? "border-amber-500" : ""
                    }`}
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">
                    I agree to receive doctor correspondence, transactional and/or
                    marketing messaging from Affordable Wellness to the email
                    address that I provided above.
                  </span>
                </label>
                {emailConsentError && (
                  <div className="flex items-start gap-2.5 mt-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800 leading-snug">
                      {emailConsentError}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile number */}
            <div className="space-y-3">
              <label className="block text-slate-900 text-base font-semibold">
                Please enter your mobile number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  handlePhoneChange(e);
                  if (requiredFieldsWarning) setRequiredFieldsWarning("");
                }}
                placeholder="(000) 000-0000"
                maxLength={14}
                autoComplete="tel"
                className={fieldInputClass}
              />
            </div>

            {/* SMS Yes / No */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-900 text-base font-semibold">
                  Can we send you text messages about your prescription?{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <p className="text-sm text-slate-500 mt-1">
                  (including tracking information and refill information)
                </p>
              </div>
              <div className="space-y-3">
                {(["yes", "no"] as const).map((v) => {
                  const selected = smsConsent === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setSmsConsent(v);
                        setSmsTransactional(v === "yes");
                        setSmsConsentError("");
                      }}
                      className={`w-full flex items-center gap-3 h-14 px-4 rounded-xl border-2 bg-white text-left transition-all ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-primary/50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className="text-base font-medium text-slate-800 capitalize">
                        {v}
                      </span>
                    </button>
                  );
                })}
              </div>
              {smsConsentError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-snug">
                    {smsConsentError}
                  </p>
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Final SMS / calls legal consent */}
            <div
              className={`rounded-xl p-4 ${
                finalConsentError
                  ? "border border-amber-400 bg-amber-50/40"
                  : ""
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={finalConsent}
                  onCheckedChange={(c) => {
                    setFinalConsent(c === true);
                    if (c === true) setFinalConsentError("");
                  }}
                  className={`mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary ${
                    finalConsentError ? "border-amber-500" : ""
                  }`}
                />
                <span className="text-sm text-slate-600 leading-relaxed">
                  By checking this box, I also consent by electronic signature to
                  receive phone calls and/or SMS text messages at the phone
                  number(s) below, including my wireless number if provided. I
                  understand these calls may be generated using an automated
                  technology, pre-recorded voices and that data rates may apply. I
                  understand that my consent is not required to buy goods/services
                  and I may opt out at any time to avoid receiving calls or SMS
                  text messages.
                </span>
              </label>
              {finalConsentError && (
                <div className="flex items-start gap-2.5 mt-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-snug">
                    {finalConsentError}
                  </p>
                </div>
              )}
            </div>

            {requiredFieldsWarning && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800 leading-snug">
                  {requiredFieldsWarning}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleStep2Continue}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </QuizShell>
    );
  }

  // ─── STEP 3: Date of Birth ─────────────────────────────────────────────────
  if (step === 3) {
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(2)} />

        <div className="max-w-xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              What is your date of birth?
            </h1>
            <p className="text-gray-500 text-base">
              Our doctors use this to create the right treatment plan for you.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Month
              </Label>
              <Select value={dobMonth} onValueChange={setDobMonth}>
                <SelectTrigger className={QUIZ_SELECT_TRIGGER}>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className={QUIZ_SELECT_CONTENT}>
                  {[
                    ["01","January"],["02","February"],["03","March"],
                    ["04","April"],["05","May"],["06","June"],
                    ["07","July"],["08","August"],["09","September"],
                    ["10","October"],["11","November"],["12","December"],
                  ].map(([val, label]) => (
                    <SelectItem key={val} value={val} className={QUIZ_SELECT_ITEM}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Day
              </Label>
              <Select value={dobDay} onValueChange={setDobDay}>
                <SelectTrigger className={QUIZ_SELECT_TRIGGER}>
                  <SelectValue placeholder="DD" />
                </SelectTrigger>
                <SelectContent className={QUIZ_SELECT_CONTENT}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem
                      key={day}
                      value={day.toString().padStart(2, "0")}
                      className={QUIZ_SELECT_ITEM}
                    >
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Year
              </Label>
              <Select value={dobYear} onValueChange={setDobYear}>
                <SelectTrigger className={QUIZ_SELECT_TRIGGER}>
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent className={QUIZ_SELECT_CONTENT}>
                  {Array.from(
                    { length: 100 },
                    (_, i) => new Date().getFullYear() - 18 - i
                  ).map((year) => (
                    <SelectItem
                      key={year}
                      value={year.toString()}
                      className={QUIZ_SELECT_ITEM}
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStep3Continue}
            disabled={!dobMonth || !dobDay || !dobYear}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </QuizShell>
    );
  }

  // // ─── STEP 4: Height & Weight ───────────────────────────────────────────────
  // if (step === 4) {
  //   const totalInches =
  //     heightFeet && heightInches !== ""
  //       ? parseInt(heightFeet) * 12 + parseInt(heightInches)
  //       : 0;
  //   const bmi =
  //     totalInches > 0 && weight
  //       ? (parseFloat(weight) * 703) / (totalInches * totalInches)
  //       : 0;
  //   const getBmiInfo = (b: number) => {
  //     if (b < 18.5) return { label: "underweight range", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", sub: "text-blue-600", icon: "text-blue-500" };
  //     if (b < 25)   return { label: "normal range",      bg: "bg-green-50", border: "border-green-200", text: "text-green-700", sub: "text-green-600", icon: "text-green-500" };
  //     if (b < 30)   return { label: "overweight range",  bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", sub: "text-amber-600", icon: "text-amber-500" };
  //     return           { label: "obese range",          bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", sub: "text-amber-600", icon: "text-amber-500" };
  //   };
  //   const bmiInfo = bmi > 0 ? getBmiInfo(bmi) : null;

  //   return (
  //     <div className="min-h-screen bg-white">
  //       <QuizHeader step={step} onBack={() => setStep(3)} />

  //       <div className="max-w-xl mx-auto px-5 py-10">
  //         <div className="mb-8">
  //           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-snug">
  //             Your dose depends on your body.
  //           </h1>
  //           <p className="text-gray-500 text-base">
  //             These help your clinician calculate the safest, most effective dose.
  //           </p>
  //         </div>

  //         <div className="space-y-4 mb-5">
  //           {/* Height dropdowns */}
  //           <div className="grid grid-cols-2 gap-3">
  //             <Select value={heightFeet} onValueChange={setHeightFeet}>
  //               <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-base focus:border-primary">
  //                 <SelectValue placeholder="Feet" />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 {[3, 4, 5, 6, 7, 8].map((f) => (
  //                   <SelectItem key={f} value={f.toString()} className="cursor-pointer focus:bg-primary/10">
  //                     {f} ft
  //                   </SelectItem>
  //                 ))}
  //               </SelectContent>
  //             </Select>
  //             <Select value={heightInches} onValueChange={setHeightInches}>
  //               <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-base focus:border-primary">
  //                 <SelectValue placeholder="Inches" />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
  //                   <SelectItem key={inch} value={inch.toString()} className="cursor-pointer focus:bg-primary/10">
  //                     {inch} in
  //                   </SelectItem>
  //                 ))}
  //               </SelectContent>
  //             </Select>
  //           </div>

  //           {/* Weight floating label */}
  //           <div className="relative">
  //             <label className="absolute left-4 top-2.5 text-xs text-gray-400 font-medium pointer-events-none z-10">
  //               Weight (lbs)
  //             </label>
  //             <Input
  //               type="number"
  //               min="50"
  //               max="800"
  //               value={weight}
  //               onChange={(e) => setWeight(e.target.value)}
  //               placeholder=""
  //               className="h-16 pt-6 pb-2 px-4 border-2 border-gray-200 rounded-xl text-lg font-semibold focus-visible:border-primary focus-visible:ring-0"
  //             />
  //           </div>
  //           <p className="flex items-center gap-1.5 text-sm text-gray-400 -mt-1">
  //             <Lock size={13} />
  //             Private &amp; secure.
  //           </p>
  //         </div>

  //         {/* BMI card */}
  //         {bmiInfo && (
  //           <div className={`mb-6 p-4 rounded-xl ${bmiInfo.bg} border ${bmiInfo.border} flex items-start gap-3`}>
  //             <span className={`mt-0.5 text-lg leading-none ${bmiInfo.icon}`}>⚠</span>
  //             <div>
  //               <p className={`text-sm font-bold ${bmiInfo.text}`}>
  //                 Your BMI is {bmi.toFixed(1)} ({bmiInfo.label}).
  //               </p>
  //               <p className={`text-sm mt-0.5 ${bmiInfo.sub}`}>
  //                 Even modest weight loss can improve health. Your plan is personalized beyond BMI.
  //               </p>
  //             </div>
  //           </div>
  //         )}

  //         <button
  //           type="button"
  //           onClick={handleStep4Continue}
  //           disabled={!heightFeet || heightInches === "" || !weight}
  //           className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
  //         >
  //           Next
  //           <ArrowRight size={18} />
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }



  // ─── STEP 6: Results / Congrats ────────────────────────────────────────────
  if (step === 6) {
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(5)} />

        <div className="max-w-xl mx-auto px-5 py-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Great news, {firstName}!
            </h1>
            <p className="text-gray-500 text-base mb-2">
              You meet the initial pre-qualifications.
            </p>
            <p className="text-lg font-bold text-primary">
              You are set to lose {calculateWeightLoss()} lbs!
            </p>
          </div>

          {/* Weight stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                Current weight
              </p>
              <p className="text-3xl font-extrabold text-gray-900">{weight}</p>
              <p className="text-sm text-gray-400 mt-1">lbs</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-6 text-center border border-primary/20">
              <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">
                Goal weight
              </p>
              <p className="text-3xl font-extrabold text-primary">{goalWeight}</p>
              <p className="text-sm text-primary/60 mt-1">lbs</p>
            </div>
          </div>

          {/* Plan steps */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm mb-4">
              {firstName}'s Medical Weight Loss Plan
            </h2>
            <div className="flex items-center justify-between gap-2">
              {[
                { label: "Medication\nDelivery", active: false },
                { label: "Ongoing\nSupport", active: false },
                { label: "Goal\nAchieved!", active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl ${
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold text-center leading-tight whitespace-pre-line ${
                        item.active ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                  {i < 2 && (
                    <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed mb-8">
            These figures are for informational purposes only and not a
            guarantee of results. Your weight loss will depend on exercise,
            diet, and medication adherence.
          </p>

          <button
            type="button"
            onClick={handleStep6Continue}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Continue to next step
            <ArrowRight size={18} />
          </button>
        </div>
      </QuizShell>
    );
  }



  // ─── STEP 8: Medication Type ───────────────────────────────────────────────
  if (step === 8) {
    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(7)} />

        <div className="max-w-xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Which medication are you currently taking?
            </h1>
            <p className="text-gray-500 text-base">
              Include drugs taken in the last 2 weeks only.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                value: "semaglutide",
                label: "Semaglutide",
                sublabel: "Compound, Ozempic, or Wegovy",
                emoji: "💉",
              },
              {
                value: "tirzepatide",
                label: "Tirzepatide",
                sublabel: "Compound, Mounjaro, or Zepbound",
                emoji: "💉",
              },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                sublabel={opt.sublabel}
                emoji={opt.emoji}
                selected={selectedMedicationType === opt.value}
                onClick={() => handleStep8Selection(opt.value)}
              />
            ))}
          </div>
        </div>
      </QuizShell>
    );
  }

  // ─── STEP 9: Dosage Selection ──────────────────────────────────────────────
  if (step === 9) {
    const semaglutideDosages = ["0.25 mg", "0.5 mg", "1 mg", "1.5 mg", "2 mg", "2.5 mg"];
    const tirzepatideDosages = ["2.5 mg", "5 mg", "7.5 mg", "10 mg", "12.5 mg", "15 mg"];
    const dosageOptions =
      selectedMedicationType === "semaglutide" ? semaglutideDosages : tirzepatideDosages;
    const medicationName =
      selectedMedicationType === "semaglutide" ? "Semaglutide" : "Tirzepatide";

    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(8)} />

        <div className="max-w-xl mx-auto px-5 py-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Select your {medicationName} dosage
            </h1>
            <p className="text-gray-500 text-base">
              Choose your current or previous dosage
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-sm text-amber-800 leading-relaxed">
              To be approved for higher dosages, you must upload a photo of
              your current medication or prescription. Without this, our
              doctors must begin you at the starter dosage.
            </p>
          </div>

          <div className="space-y-2.5 mb-8">
            {dosageOptions.map((dosage) => (
              <OptionCard
                key={dosage}
                label={dosage}
                selected={selectedDosage === dosage}
                onClick={() => setSelectedDosage(dosage)}
              />
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 space-y-3">
            {[
              "Same price at all dosage levels",
              "No hidden fees — everything included",
              "Initial telehealth visit included",
              "Prescription + medication",
              "24/7 patient support",
              "Monthly check-in with your doctor",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 size={17} className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStep9Continue}
            disabled={!selectedDosage}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </QuizShell>
    );
  }

  // ─── STEP 10: Final Product Selection ─────────────────────────────────────
  if (step === 10) {
    const isLoadingProducts = loadingSema || loadingTirz;

    return (
      <QuizShell>
        <QuizHeader step={step} onBack={() => setStep(8)} />

        <div className="max-w-xl mx-auto px-5 py-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Choose your medication
            </h1>
            <p className="text-gray-500 text-base">
              Select the GLP-1 that's right for your journey
            </p>
            {isLoadingProducts && (
              <p className="text-sm text-primary animate-pulse mt-2">
                Loading products...
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Semaglutide Card */}
            <div
              onClick={() => handleStep10Selection("semaglutide")}
              className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-200 active:scale-[0.98] hover:shadow-md ${
                selectedFinalMedication === "semaglutide"
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-gray-200 hover:border-primary/60"
              }`}
            >
              <div className="p-5">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <img
                    src={semaglutideBottle}
                    alt="Semaglutide"
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                  Semaglutide
                </h3>
                <p className="text-center mb-4">
                  {renderMedicationStartingPrice(
                    loadingSema,
                    semaFetchFailed,
                    semaglutideProducts,
                  )}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Compounded formulation for enhanced metabolic support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Works on 1 GLP receptor</span>
                  </li>
                </ul>
                {selectedFinalMedication === "semaglutide" && (
                  <div className="mt-4 flex justify-center">
                    <CheckCircle2 className="text-primary" size={24} />
                  </div>
                )}
              </div>
            </div>

            {/* Tirzepatide Card */}
            <div
              onClick={() => handleStep10Selection("tirzepatide")}
              className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-200 active:scale-[0.98] hover:shadow-md ${
                selectedFinalMedication === "tirzepatide"
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-gray-200 hover:border-primary/60"
              }`}
            >
              <div className="p-5">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <img
                    src={tirzepatideBottle}
                    alt="Tirzepatide"
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                  Tirzepatide
                </h3>
                <p className="text-center mb-4">
                  {renderMedicationStartingPrice(
                    loadingTirz,
                    tirzFetchFailed,
                    tirzepatideProducts,
                  )}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Compounded dual-action formulation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>Works on 2 GLP receptors for enhanced results</span>
                  </li>
                </ul>
                {selectedFinalMedication === "tirzepatide" && (
                  <div className="mt-4 flex justify-center">
                    <CheckCircle2 className="text-primary" size={24} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed mt-6">
            Affordable Wellness does not manufacture compounded medications. Actual product
            appearance may differ from images shown.
          </p>
        </div>
      </QuizShell>
    );
  }


  

  return null;
};

export default Questionnaire;
