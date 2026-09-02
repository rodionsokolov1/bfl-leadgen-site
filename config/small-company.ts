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
} as const;

export const smallCompanyPains = [
  {
    title: "«Лиды говно»",
    paragraphs: ["Так бывает."],
    inlineText: "Но чаще проблема не в том, что заявка плохая, а в том, что",
    emphasis: ["с ней сейчас не правильно работают"],
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
  { value: "62 000+", label: "заявок на БФЛ за 8 месяцев 2026 года" },
] as const;
