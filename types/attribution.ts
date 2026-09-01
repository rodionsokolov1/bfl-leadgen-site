export const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid",
  "landing_id",
  "landing_version",
  "creative_id",
  "ad_id",
  "tracking_id",
  "ym_client_id",
] as const;

export type AttributionKey = (typeof attributionKeys)[number];
export type AttributionData = Partial<Record<AttributionKey, string>>;
