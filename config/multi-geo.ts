export const MULTI_GEO_VIDEO_URL = process.env.NEXT_PUBLIC_MULTI_GEO_VIDEO_URL ?? "";

const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");

export const multiGeoConfig = {
  accent: "#3287c8",
  videoUrl: MULTI_GEO_VIDEO_URL,
  finalCtaUrl: telegramUsername ? `https://t.me/${telegramUsername}` : "#contacts",
} as const;
