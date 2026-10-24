/** Session key for Post Affiliate Pro banner parameter `a_aid` across the funnel */
export const AFFILIATE_AID_SESSION_KEY = "affordablewellness_funnel_a_aid";

const RESERVED_HASH_TOKENS = new Set([
  "pricing",
  "faq",
  "contact",
  "main",
  "top",
  "footer",
]);

function normalizeSearch(search: string): string {
  return search.startsWith("?") ? search.slice(1) : search;
}

/**
 * Reads `a_aid` from query string and from hash (`#a_aid=value` or bare `#nimavat`).
 */
export function parseAffiliateAidFromSearchAndHash(
  search: string,
  hash: string,
): string | null {
  const q = new URLSearchParams(normalizeSearch(search)).get("a_aid")?.trim();
  if (q) return q;

  const fragment = hash.replace(/^#/, "").trim();
  if (!fragment) return null;

  if (fragment.includes("=")) {
    const fromHash = new URLSearchParams(fragment).get("a_aid")?.trim();
    if (fromHash) return fromHash;
    return null;
  }

  const token = decodeURIComponent(fragment.split("&")[0] || "").trim();
  if (
    token &&
    /^[a-zA-Z0-9_]{3,40}$/.test(token) &&
    !RESERVED_HASH_TOKENS.has(token.toLowerCase())
  ) {
    return token;
  }
  return null;
}

export function persistAffiliateAid(aid: string | null | undefined): void {
  if (!aid || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(AFFILIATE_AID_SESSION_KEY, aid);
  } catch {
    /* ignore */
  }
}

export function getPersistedAffiliateAid(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(AFFILIATE_AID_SESSION_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Ensures `a_aid` stays on internal funnel URLs when the first visit used
 * `?a_aid=…` or a hash-only affiliate id.
 */
export function mergeAffiliateIntoSearch(currentSearch: string): string {
  const params = new URLSearchParams(normalizeSearch(currentSearch));
  const inUrl = params.get("a_aid")?.trim();
  if (inUrl) {
    persistAffiliateAid(inUrl);
    const s = params.toString();
    return s ? `?${s}` : "";
  }
  const persisted = getPersistedAffiliateAid();
  if (persisted) params.set("a_aid", persisted);
  const s = params.toString();
  return s ? `?${s}` : "";
}
