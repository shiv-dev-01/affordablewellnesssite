/** Extract supply length in months from Whitelabel API product_name, e.g. "… - 12  months supply". */
function getSupplyMonthsFromProductName(productName: string): number | null {
  const m = String(productName || "").match(/-\s*(\d+)\s*months?\s+supply/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function planTypeToMonths(planType: string): 1 | 3 | 6 | 12 | null {
  switch (planType) {
    case "monthly":
      return 1;
    case "3-month":
      return 3;
    case "6-month":
      return 6;
    case "12-month":
      return 12;
    default:
      return null;
  }
}

/** Product lookup by plan — Whitelabel affordablewellness API uses product_name + SKUs like CR1 / MAINT-S3 / *-6M / *-12M. */
export function getProductByPlanFromList(
  medicationProducts: any[],
  planType: string,
): any | null {
  if (!medicationProducts?.length) return null;

  const targetMonths = planTypeToMonths(planType);
  if (targetMonths === null) return null;

  const byName = medicationProducts.find((p) => {
    const months = getSupplyMonthsFromProductName(p.product_name || "");
    return months === targetMonths;
  });
  if (byName) return byName;

  const product = medicationProducts.find((p) => {
    const sku = String(p.sku || "").toLowerCase();

    switch (planType) {
      case "monthly":
        return (
          (sku.includes("cr1") &&
            !sku.includes("6m") &&
            !sku.includes("12m") &&
            !sku.includes("maint")) ||
          (sku.includes("1m") &&
            !sku.includes("3m") &&
            !sku.includes("6m") &&
            !sku.includes("12m"))
        );
      case "3-month":
        return (
          (sku.includes("maint") &&
            (sku.includes("s3") || sku.includes("s2"))) ||
          (sku.includes("3m") && !sku.includes("6m") && !sku.includes("12m"))
        );
      case "6-month":
        return sku.includes("6m") && !sku.includes("12m");
      case "12-month":
        return sku.includes("12m");
      default:
        return false;
    }
  });

  return product || null;
}

/** Monthly "starting at" price from the 12-month plan total (total / 12). */
export function getMonthlyStartingPriceFromProducts(
  medicationProducts: any[],
): number | null {
  const product = getProductByPlanFromList(medicationProducts, "12-month");
  if (!product?.price) return null;
  const total = parseFloat(String(product.price));
  if (!Number.isFinite(total) || total <= 0) return null;
  return total / 12;
}

const STATE_NAME_TO_CODE: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

export const EXCLUDED_STATE_CODES = new Set(["LA", "MS"]);
export const EXCLUDED_STATE_NAMES = new Set(["Louisiana", "Mississippi"]);

export function isExcludedState(stateInput: string): boolean {
  if (!stateInput) return false;
  return EXCLUDED_STATE_CODES.has(normalizeStateCode(stateInput));
}

export function filterSelectableStates<
  T extends { name: string; state_code: string },
>(states: T[]): T[] {
  return states.filter((s) => !EXCLUDED_STATE_CODES.has(s.state_code));
}

/** Normalize questionnaire state (full name or 2-letter) to USPS code. */
export function normalizeStateCode(stateName: string): string {
  if (!stateName) return "";
  const t = stateName.trim();
  if (t.length === 2) return t.toUpperCase();
  return STATE_NAME_TO_CODE[t] || t;
}

/** Human-readable state for legacy onboarding URLs, e.g. "California (CA)". */
export function formatStateForOnboardingQuery(stateInput: string): string {
  const code = normalizeStateCode(stateInput);
  if (!code) return "";
  const pair = Object.entries(STATE_NAME_TO_CODE).find(([, c]) => c === code);
  const name = pair?.[0] ?? (stateInput.trim() || code);
  return `${name} (${code})`;
}

export function formatPriceValue(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(numPrice)) return "0";
  return numPrice.toFixed(2).replace(/\.00$/, "").replace(/\.0$/, "");
}

/** Parse coupon discount values that may include commas or nested strings. */
export function parseDiscountValue(value: unknown): number {
  if (value == null || value === "") return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const cleaned = String(value).replace(/,/g, "").replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Normalize check_coupons_v3 (and legacy) responses into a stable coupon object.
 */
export function normalizeCouponResponse(
  data: Record<string, any>,
  fallbackCode = "",
): {
  discount_percent: string;
  discount_amount: string;
  code: string;
  raw: Record<string, any>;
} {
  const nested =
    data?.data && typeof data.data === "object" && !Array.isArray(data.data)
      ? data.data
      : {};
  const fromList = Array.isArray(data?.data)
    ? data.data[0]
    : Array.isArray(nested?.coupons)
      ? nested.coupons[0]
      : Array.isArray(data?.coupons)
        ? data.coupons[0]
        : null;
  const sources = [data, nested, fromList].filter(Boolean) as Record<
    string,
    any
  >[];

  const pick = (...keys: string[]) => {
    for (const src of sources) {
      for (const key of keys) {
        if (src[key] != null && src[key] !== "") return src[key];
      }
    }
    return undefined;
  };

  const percent = parseDiscountValue(
    pick(
      "discount_percent",
      "discountPercent",
      "percent_off",
      "percentage",
      "percent",
    ),
  );
  const amount = parseDiscountValue(
    pick(
      "discount_amount",
      "discountAmount",
      "amount_off",
      "discount_value",
      "discountValue",
      "discount",
      "value",
    ),
  );

  return {
    ...data,
    discount_percent: String(percent),
    discount_amount: String(amount),
    code:
      String(
        pick("code", "promo_codes", "promo_code", "coupon_code") ||
          fallbackCode ||
          "",
      ),
    raw: data,
  };
}

/** Dollar discount for a given subtotal from an applied coupon object. */
export function getCouponDiscountDollars(
  subtotal: number,
  appliedCoupon: {
    discount_percent?: string | number;
    discount_amount?: string | number;
    applied_on_subtotal?: string | number;
  } | null,
  fallbackBasis?: number,
): number {
  if (!appliedCoupon || !Number.isFinite(subtotal) || subtotal <= 0) return 0;

  const percent = parseDiscountValue(appliedCoupon.discount_percent);
  if (percent > 0) {
    return Math.min(subtotal, roundMoney((subtotal * percent) / 100));
  }

  const amount = parseDiscountValue(appliedCoupon.discount_amount);
  if (amount <= 0) return 0;

  // API often returns a dollar amount for the product the coupon was checked
  // against (e.g. 99% of monthly $79 = $78.21). Convert that to a rate so the
  // same coupon applies to every plan total (99% of $228 → $2.28).
  const basis = parseDiscountValue(
    appliedCoupon.applied_on_subtotal ?? fallbackBasis,
  );
  if (basis > 0) {
    const rate = Math.min(1, amount / basis);
    return Math.min(subtotal, roundMoney(subtotal * rate));
  }

  return Math.min(subtotal, amount);
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Marketing “total savings vs monthly” (USD), fixed by medication and plan length. */
export function getMarketingTotalSavingsUsd(
  medicationType: "semaglutide" | "tirzepatide",
  planType: string,
): number {
  if (planType === "monthly") return 0;
  const sema: Record<string, number> = {
    "3-month": 198,
    "6-month": 545,
    "12-month": 1289,
  };
  const tirz: Record<string, number> = {
    "3-month": 198,
    "6-month": 645,
    "12-month": 1689,
  };
  const table = medicationType === "semaglutide" ? sema : tirz;
  return table[planType] ?? 0;
}

/** Whole-dollar display for savings callouts (e.g. 1289 → "1,289"). */
export function formatSavingsUsdDisplay(amount: number): string {
  return Math.max(0, Math.round(amount)).toLocaleString("en-US");
}
