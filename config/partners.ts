const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");

export const partnersConfig = {
  accent: "#f24e18",
  systemAccent: "#f24e18",
  telegramUrl: telegramUsername ? `https://t.me/${telegramUsername}` : "#contacts",
} as const;
