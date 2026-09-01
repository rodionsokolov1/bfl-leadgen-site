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
    body: "Так бывает.\nНо чаще проблема не в том, что заявка плохая,\nа в том, что с ней не правильно работают",
  },
  {
    title: "Бюджет не резиновый",
    body: "Небольшая компания не может бесконечно\nошибаться в подрядчиках, офферах и запусках.\nКаждый неудачный тест стоит реальных денег.",
  },
  {
    title: "Не хочется снова ошибиться",
    body: "Тебе обещают заявки, показывают отчёты,\nобъясняют, почему “всё работает”.\n\nНо тебе нужны не объяснения.\nТебе нужны деньги в кассе, а их нет",
  },
] as const;

export const trustFacts = [
  "В интернет-рекламе с 2015 года",
  "БФЛ с 2019 года",
  "Более 62 000 заявок на БФЛ за 8 месяцев 2026 года",
  "55+ посадочных страниц в тестах и работе для крупных проектов",
  "Работа с несколькими GEO",
  "В проектах с обратной связью — аналитика от стоимости заявки до встреч и договоров",
] as const;
