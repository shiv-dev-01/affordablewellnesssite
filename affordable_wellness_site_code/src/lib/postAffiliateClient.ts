import {
  getPersistedAffiliateAid,
  persistAffiliateAid,
  parseAffiliateAidFromSearchAndHash,
} from "@/lib/affiliateTracking";

const PAP_ACCOUNT_ID = "default1";

type PostAffSale = {
  setOrderID: (id: string) => void;
  setTotalCost: (cost: string) => void;
  setProductID?: (id: string) => void;
  setAffiliateID?: (id: string) => void;
  setCurrencyCode?: (code: string) => void;
};

type PostAffTrackerGlobal = {
  setAccountId: (id: string) => void;
  track: () => void;
  createSale: () => PostAffSale;
  register: () => void;
};

function getTracker(): PostAffTrackerGlobal | undefined {
  return (typeof window !== "undefined"
    ? (window as unknown as { PostAffTracker?: PostAffTrackerGlobal })
        .PostAffTracker
    : undefined) as PostAffTrackerGlobal | undefined;
}

let clickTrackPoll: ReturnType<typeof setInterval> | null = null;

/** Click / visit tracking (safe to call on SPA route changes). */
export function trackPostAffiliatePageView(): void {
  const run = (): boolean => {
    const pap = getTracker();
    if (!pap?.track) return false;
    try {
      pap.setAccountId(PAP_ACCOUNT_ID);
      pap.track();
    } catch {
      /* ignore */
    }
    return true;
  };

  if (run()) return;

  if (clickTrackPoll != null) return;
  clickTrackPoll = setInterval(() => {
    if (run() && clickTrackPoll != null) {
      clearInterval(clickTrackPoll);
      clickTrackPoll = null;
    }
  }, 80);

  setTimeout(() => {
    if (clickTrackPoll != null) {
      clearInterval(clickTrackPoll);
      clickTrackPoll = null;
    }
  }, 15000);
}

export function captureAffiliateFromRouter(
  search: string,
  hash: string,
): void {
  const aid = parseAffiliateAidFromSearchAndHash(search, hash);
  if (aid) persistAffiliateAid(aid);
}

const saleDoneKey = (orderId: string) => `affordablewellness_pap_sale_${orderId}`;

/**
 * Registers a commission in Post Affiliate Pro (thank-you / confirmation).
 * Idempotent per order id in this browser session.
 */
export function registerPostAffiliateSale(opts: {
  orderId: string | number;
  totalCost: number;
  productId?: string | number;
  productName?: string;
  currency?: string;
}): void {
  const pap = getTracker();
  if (!pap?.createSale || !pap.register) return;

  const orderId = String(opts.orderId).trim();
  if (!orderId) return;

  try {
    if (typeof sessionStorage !== "undefined") {
      if (sessionStorage.getItem(saleDoneKey(orderId))) return;
    }
  } catch {
    /* continue */
  }

  try {
    pap.setAccountId(PAP_ACCOUNT_ID);
    const sale = pap.createSale();
    sale.setOrderID(orderId);
    sale.setTotalCost(String(opts.totalCost));
    const pid =
      opts.productId != null && String(opts.productId).trim() !== ""
        ? String(opts.productId)
        : opts.productName?.trim();
    if (pid && sale.setProductID) sale.setProductID(pid);
    const forcedAid = getPersistedAffiliateAid();
    if (forcedAid && sale.setAffiliateID) sale.setAffiliateID(forcedAid);
    if (opts.currency && sale.setCurrencyCode)
      sale.setCurrencyCode(opts.currency);
    pap.register();
    try {
      sessionStorage.setItem(saleDoneKey(orderId), "1");
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}
