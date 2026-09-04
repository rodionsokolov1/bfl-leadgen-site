export const MULTI_GEO_VIDEO_SOURCES = {
  youtube: "https://www.youtube-nocookie.com/embed/9SrY_xPWSOM?autoplay=1&rel=0",
  vk: "https://vkvideo.ru/video_ext.php?oid=-165935805&id=456239024&hd=2&autoplay=1",
} as const;

const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
const vkContactUrl = process.env.NEXT_PUBLIC_VK_CONTACT_URL?.trim() ?? "";

export const multiGeoConfig = {
  accent: "#3287c8",
  videoSources: MULTI_GEO_VIDEO_SOURCES,
  quiz: {
    endpoint: process.env.NEXT_PUBLIC_MULTI_CITY_QUIZ_ENDPOINT ?? "",
    telegramUsername: telegramUsername ?? "",
    vkContactUrl,
    useDevMock: process.env.NODE_ENV !== "production",
    questions: [
      { key: "cities_count", title: "В скольких городах ты сейчас работаешь?", type: "single", options: ["2–3 города", "4–7 городов", "8–15 городов", "15+ городов"] },
      { key: "main_lead_source", title: "Какой сейчас основной источник заявок?", type: "single", options: ["Яндекс Директ", "VK Ads", "Покупные лиды", "Партнёры / рекомендации", "Несколько источников сразу", "Другое"] },
      { key: "monthly_ad_budget", title: "Твой рекламный бюджет в месяц", type: "single", options: ["До 200 тыс. ₽", "200–500 тыс. ₽", "500 тыс. – 1 млн ₽", "1–5 млн ₽", "5 млн ₽+"] },
      { key: "sales_team_structure", title: "Отдел продаж работает дистанционно или у каждого офиса свой ОП?", type: "single", options: ["Единый отдел продаж", "У каждого офиса свой ОП", "Смешанный ОП: дистант + офисы", "Затрудняюсь ответить"] },
      { key: "main_pains", title: "Что сейчас больше всего напрягает?", type: "multi", note: "можно выбрать несколько", options: ["Не хватает заявок", "Дорогие заявки", "Низкое качество", "Разные результаты по городам", "Продажи не справляются", "Аналитика построена криво"] },
    ],
  },
} as const;
