export const smallCompanyConfig = {
  accent: "#2f9e5a",
  trustProofImage: "/images/small-company/ok-bankrot-payments.gif",
  videoSources: {
    youtube: null as string | null,
    vk: null as string | null,
  },
  telegram: {
    botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "",
    assessmentEndpoint: process.env.NEXT_PUBLIC_FUNNEL_ASSESSMENT_ENDPOINT ?? "",
    useDevMock: process.env.NODE_ENV !== "production",
  },
  testPeriodQuiz: {
    endpoint: process.env.NEXT_PUBLIC_SMALL_COMPANY_QUIZ_ENDPOINT ?? "",
    telegramUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "",
    vkContactUrl: process.env.NEXT_PUBLIC_VK_CONTACT_URL?.trim() ?? "",
    useDevMock: process.env.NODE_ENV !== "production",
    questions: [
      { key: "lead_source", title: "Откуда сейчас приходят заявки?", type: "single", options: ["Яндекс Директ / VK Реклама", "Контент в Telegram / YouTube", "Холодные звонки (Big Data)", "Рекомендации / агентская сеть", "Другое"] },
      { key: "yandex_experience", title: "Был ли у тебя опыт работы с заявками из Яндекс Директа?", type: "single", options: ["Да, работал — заявки были", "Пробовал, но не зашло", "Нет, не работал"] },
      { key: "monthly_lead_capacity", title: "Сколько заявок в месяц ты можешь обработать?", type: "single", options: ["до 300", "300–700", "700–1500", "1500+"] },
      { key: "lead_priority", title: "Что для тебя сейчас важнее при работе с заявками?", type: "single", options: ["Больше заявок", "Качественнее заявки", "Дешевле лид", "Понять, где теряются деньги"] },
      { key: "city_region", title: "В каком городе или регионе работаешь?", type: "text", placeholder: "Например: Тюмень" },
    ],
  },
} as const;

export const smallCompanyPains = [
  {
    title: "«Лиды говно»",
    paragraphs: ["Так бывает."],
    inlineText: "Но чаще проблема не в том, что заявка плохая, а в том, что",
    emphasis: ["с ней сейчас неправильно работают"],
  },
  {
    title: "Бюджет не резиновый",
    paragraphs: ["Небольшая компания не может бесконечно ошибаться в подрядчиках, офферах и запусках."],
    inlineText: null,
    emphasis: ["Каждый неудачный тест стоит реальных денег."],
  },
  {
    title: "Не хочется снова ошибиться",
    paragraphs: ["Тебе обещают заявки, показывают отчёты, объясняют, почему «всё работает»."],
    inlineText: null,
    emphasis: ["Но тебе нужны не объяснения.", "Тебе нужны деньги в кассе, а их нет"],
  },
] as const;

export const trustFacts = [
  { value: "С 2015", label: "в интернет-рекламе" },
  { value: "С 2019", label: "в нише БФЛ" },
  { value: "62 500+", label: "заявок на БФЛ за 8 месяцев 2026 года" },
] as const;
