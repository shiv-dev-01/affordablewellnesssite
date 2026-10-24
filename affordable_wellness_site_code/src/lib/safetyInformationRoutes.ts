export const SAFETY_INFO_ROUTES = {
  semaglutide: "/important-safety-information-for-compounded-semaglutide",
  tirzepatide: "/important-safety-information-for-compounded-tirzepatide",
} as const;

export type SafetyMedication = keyof typeof SAFETY_INFO_ROUTES;
