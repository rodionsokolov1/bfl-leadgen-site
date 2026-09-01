export const smallCompanyConfig = {
  accent: "#2f9e5a",
  trustProofImage: null as string | null,
  videoSources: {
    youtube: null as string | null,
    vk: null as string | null,
  },
  telegram: {
    botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "",
    assessmentEndpoint: process.env.NEXT_PUBLIC_FUNNEL_ASSESSMENT_ENDPOINT ?? "",
    useDevMock: process.env.NODE_ENV !== "production",
  },
} as const;

export const smallCompanyPains = [
  {
    title: "«Лиды говно»",
    body: "Возможно.",
    emphasis: "А возможно, за хороший лид уже заплатили — и потеряли его после заявки.",
  },
  {
    title: "Бюджет не резиновый",
    body: "Небольшой компании дорого бесконечно тестировать новые агентства, связки, сайты и рекламные кабинеты.",
    emphasis: "Каждая ошибка оплачивается из твоего кармана.",
  },
  {
    title: "Страшно снова выбрать не того",
    body: "Маркетолог показывает CPL. Отдел продаж говорит, что лиды плохие.",
    emphasis: "А собственнику в итоге нужно понять только одно: где договоры?",
  },
] as const;

export const trustFacts = [
  "В интернет-рекламе с 2015 года",
  "БФЛ с 2019 года",
  "Более 62 000 заявок на БФЛ за 8 месяцев 2026 года",
  "55+ посадочных страниц в тестах и работе для крупных проектов",
  "Работа с несколькими GEO",
  "В проектах с обратной связью — аналитика дальше CPL до встреч и договоров",
] as const;
