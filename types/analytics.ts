export const analyticsEventNames = ["LANDING_VISIT", "CTA_CLICK", "QUIZ_STARTED", "QUIZ_STEP", "QUIZ_COMPLETED", "TELEGRAM_CLICK"] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsEventProperties = Record<string, string | number | boolean | undefined>;
