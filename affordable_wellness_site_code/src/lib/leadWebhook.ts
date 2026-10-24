import axios from "axios";

export const N8N_LEAD_WEBHOOK_URL =
  "https://n8n.whitelabelmd.com/webhook/f7e33dc8-c81c-4879-b36b-eafe07e02c65";

const WEBHOOK_SENT_KEY = "affordablewellness_n8n_lead_webhook_sent";
const QUESTIONNAIRE_LEAD_KEY = "affordablewellness_questionnaire_lead_v1";
const TRACKING_KEY = "affordablewellness_lead_tracking_v1";
const SOURCE_URL_KEY = "affordablewellness_lead_source_url";

export interface LeadTrackingParams {
  click_id: string;
  utm_source: string;
  utm_medium: string;
  utm_term: string;
  utm_campaign: string;
  utm_content: string;
  fbclid: string;
  google_click_id: string;
  msclkid: string;
}

export interface QuestionnaireLeadRecord {
  state: string;
  first_name: string;
  last_name: string;
  email: string;
  email_consent: "yes" | "no";
  phone: string;
  sms_consent: string;
  dob: string;
  gender: string;
  bmi: number | null;
  weight_current: number | null;
  weight_goal: number | null;
  taking_weight_loss_meds: string;
  weight_loss_medications_currently_taking: string;
  medication_trying_to_get: string;
  medication_dose: string;
  ed_prior_treatments: string;
  ed_problem_duration: string;
}

const TRACKING_QUERY_KEYS = [
  "click_id",
  "utm_source",
  "utm_medium",
  "utm_term",
  "utm_campaign",
  "utm_content",
  "fbclid",
  "google_click_id",
  "msclkid",
] as const;

function emptyTracking(): LeadTrackingParams {
  return {
    click_id: "",
    utm_source: "",
    utm_medium: "",
    utm_term: "",
    utm_campaign: "",
    utm_content: "",
    fbclid: "",
    google_click_id: "",
    msclkid: "",
  };
}

function normalizeSearch(search: string): string {
  return search.startsWith("?") ? search.slice(1) : search;
}

export function captureLeadTrackingFromSearch(search: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    const params = new URLSearchParams(normalizeSearch(search));
    const existing = getLeadTrackingParams();
    const next: LeadTrackingParams = { ...emptyTracking(), ...existing };

    for (const key of TRACKING_QUERY_KEYS) {
      const value = params.get(key)?.trim();
      if (value) next[key] = value;
    }

    const gclid = params.get("gclid")?.trim();
    if (gclid) next.google_click_id = gclid;

    sessionStorage.setItem(TRACKING_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getLeadTrackingParams(): LeadTrackingParams {
  if (typeof sessionStorage === "undefined") return emptyTracking();
  try {
    const raw = sessionStorage.getItem(TRACKING_KEY);
    if (!raw) return emptyTracking();
    return { ...emptyTracking(), ...JSON.parse(raw) };
  } catch {
    return emptyTracking();
  }
}

export function ensureLeadSourceUrl(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (!sessionStorage.getItem(SOURCE_URL_KEY)) {
      sessionStorage.setItem(SOURCE_URL_KEY, window.location.href);
    }
  } catch {
    /* ignore */
  }
}

function getLeadSourceUrl(): string {
  if (typeof sessionStorage === "undefined") return window.location.href;
  try {
    return sessionStorage.getItem(SOURCE_URL_KEY) || window.location.href;
  } catch {
    return window.location.href;
  }
}

export function saveQuestionnaireLead(record: QuestionnaireLeadRecord): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(QUESTIONNAIRE_LEAD_KEY, JSON.stringify(record));
  } catch {
    /* ignore */
  }
}

export function getQuestionnaireLead(): QuestionnaireLeadRecord | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(QUESTIONNAIRE_LEAD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuestionnaireLeadRecord;
  } catch {
    return null;
  }
}

export function buildN8nLeadPayload(contact?: {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Record<string, unknown> | null {
  const lead = getQuestionnaireLead();
  const email = (contact?.email || lead?.email || "").trim();
  if (!email) return null;

  const tracking = getLeadTrackingParams();
  const siteId = import.meta.env.VITE_SITE_ID ?? "248";

  return {
    site_id: siteId,
    state: lead?.state ?? "",
    first_name: (contact?.first_name || lead?.first_name || "").trim(),
    last_name: (contact?.last_name || lead?.last_name || "").trim(),
    email,
    email_consent: lead?.email_consent ?? "no",
    phone: contact?.phone || lead?.phone || "",
    sms_consent: lead?.sms_consent || "no",
    dob: lead?.dob ?? "",
    gender: lead?.gender ?? "",
    bmi: lead?.bmi ?? null,
    weight_current: lead?.weight_current ?? null,
    weight_goal: lead?.weight_goal ?? null,
    taking_weight_loss_meds: lead?.taking_weight_loss_meds ?? "",
    weight_loss_medications_currently_taking:
      lead?.weight_loss_medications_currently_taking ?? "",
    medication_trying_to_get: lead?.medication_trying_to_get ?? "",
    source_url: getLeadSourceUrl(),
    click_id: tracking.click_id,
    utm_source: tracking.utm_source,
    utm_medium: tracking.utm_medium,
    utm_term: tracking.utm_term,
    utm_campaign: tracking.utm_campaign,
    utm_content: tracking.utm_content,
    fbclid: tracking.fbclid,
    google_click_id: tracking.google_click_id,
    msclkid: tracking.msclkid,
    medication_dose: lead?.medication_dose ?? "",
    ed_prior_treatments: lead?.ed_prior_treatments ?? "",
    ed_problem_duration: lead?.ed_problem_duration ?? "",
  };
}

/** Fires once per browser session as soon as a valid email is available. */
export async function sendPlansPageLeadWebhook(contact?: {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Promise<void> {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (sessionStorage.getItem(WEBHOOK_SENT_KEY)) return;

    const existing = getQuestionnaireLead();
    if (contact?.email?.trim() && existing) {
      saveQuestionnaireLead({
        ...existing,
        email: contact.email.trim(),
        first_name: contact.first_name?.trim() || existing.first_name,
        last_name: contact.last_name?.trim() || existing.last_name,
        phone: contact.phone || existing.phone,
      });
    }

    const payload = buildN8nLeadPayload(contact);
    if (!payload) return;

    await axios.post(N8N_LEAD_WEBHOOK_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    sessionStorage.setItem(WEBHOOK_SENT_KEY, "1");
  } catch (err) {
    console.error("Error sending lead webhook:", err);
  }
}

const MEDICATION_MAP: Record<string, string> = {
  semaglutide: "Compounded Semaglutide",
  tirzepatide: "Compounded Tirzepatide",
};

export function buildMedicationTryingToGet(
  medicationType: string,
  selectedDosage: string,
): string {
  if (medicationType === "semaglutide") {
    return `Compounded Semaglutide (up to ${selectedDosage || "0.25mg"}/weekly)`;
  }
  if (medicationType === "tirzepatide") {
    return `Compounded Tirzepatide (up to ${selectedDosage || "2.5mg"}/weekly)`;
  }
  return "";
}

export function buildQuestionnaireLeadRecord(input: {
  state: string;
  firstName: string;
  lastName: string;
  email: string;
  emailConsent: boolean;
  phone: string;
  smsConsent: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  gender: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  goalWeight: string;
  currentlyTakesMedication: string;
  selectedMedicationType: string;
  selectedDosage: string;
  medicationType: string;
}): QuestionnaireLeadRecord {
  const dob =
    input.dobYear && input.dobMonth && input.dobDay
      ? `${input.dobYear}-${String(input.dobMonth).padStart(2, "0")}-${String(input.dobDay).padStart(2, "0")}`
      : "";

  let bmi: number | null = null;
  if (input.heightFeet && input.heightInches && input.weight) {
    const bmiValue =
      parseFloat(input.weight) /
      Math.pow(
        (parseInt(input.heightFeet, 10) * 12 + parseInt(input.heightInches, 10)) *
          0.0254,
        2,
      );
    bmi = parseFloat(bmiValue.toFixed(2));
  }

  const weightCurrent = input.weight ? parseFloat(input.weight) : null;
  const weightGoal = input.goalWeight ? parseFloat(input.goalWeight) : null;

  return {
    state: input.state,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    email_consent: input.emailConsent ? "yes" : "no",
    phone: input.phone,
    sms_consent: input.smsConsent || "no",
    dob,
    gender: input.gender
      ? input.gender.charAt(0).toUpperCase() + input.gender.slice(1)
      : "",
    bmi,
    weight_current: weightCurrent,
    weight_goal: weightGoal,
    taking_weight_loss_meds: input.currentlyTakesMedication,
    weight_loss_medications_currently_taking: input.selectedMedicationType
      ? MEDICATION_MAP[input.selectedMedicationType] ?? ""
      : "",
    medication_trying_to_get: buildMedicationTryingToGet(
      input.medicationType,
      input.selectedDosage,
    ),
    medication_dose: input.selectedDosage,
    ed_prior_treatments: "",
    ed_problem_duration: "",
  };
}
