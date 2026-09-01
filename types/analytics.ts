export const analyticsEventNames = [
  "LANDING_VISIT",
  "CTA_CLICK",
  "QUIZ_STARTED",
  "QUIZ_STEP",
  "QUIZ_COMPLETED",
  "TELEGRAM_CLICK",
  "SMALL_PAGE_VIEW",
  "SMALL_FUNNEL_STARTED",
  "SMALL_STEP_LEADS_COMPLETED",
  "SMALL_STEP_CONTACT_COMPLETED",
  "SMALL_STEP_APPOINTMENT_COMPLETED",
  "SMALL_STEP_HELD_COMPLETED",
  "SMALL_STEP_CONTRACT_COMPLETED",
  "SMALL_FUNNEL_RESULT_VIEWED",
  "SMALL_WHATIF_USED",
  "SMALL_TELEGRAM_ANALYSIS_CLICK",
  "SMALL_TELEGRAM_ASSESSMENT_SENT",
  "SMALL_TRUST_VIDEO_PLAY",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsEventProperties = Record<string, string | number | boolean | undefined>;
