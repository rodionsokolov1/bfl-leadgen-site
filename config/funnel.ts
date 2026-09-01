export type MetricStatus = "bad" | "attention" | "good" | "excellent" | "unscored";
export type FunnelMetric = "cpl" | "contactRate" | "appointmentRate" | "showRate" | "closeRate";

export type LowerIsBetterThreshold = {
  direction: "lower_is_better";
  badFrom: number | null;
  attentionFrom: number | null;
  goodUntil: number | null;
  excellentUntil: number | null;
  target: number | null;
};

export type HigherIsBetterThreshold = {
  direction: "higher_is_better";
  badBelow: number | null;
  attentionBelow: number | null;
  goodFrom: number | null;
  excellentFrom: number | null;
  target: number | null;
};

export type FunnelThreshold = LowerIsBetterThreshold | HigherIsBetterThreshold;
export type FunnelThresholdConfig = Record<FunnelMetric, FunnelThreshold>;

export const funnelThresholds: FunnelThresholdConfig = {
  cpl: {
    direction: "lower_is_better",
    badFrom: 3000,
    attentionFrom: null,
    goodUntil: null,
    excellentUntil: null,
    target: null,
  },
  contactRate: {
    direction: "higher_is_better",
    badBelow: null,
    attentionBelow: null,
    goodFrom: null,
    excellentFrom: null,
    target: null,
  },
  appointmentRate: {
    direction: "higher_is_better",
    badBelow: null,
    attentionBelow: null,
    goodFrom: null,
    excellentFrom: null,
    target: null,
  },
  showRate: {
    direction: "higher_is_better",
    badBelow: null,
    attentionBelow: null,
    goodFrom: null,
    excellentFrom: null,
    target: null,
  },
  closeRate: {
    direction: "higher_is_better",
    badBelow: null,
    attentionBelow: null,
    goodFrom: null,
    excellentFrom: null,
    target: null,
  },
};

export const funnelAdviceContent: Record<FunnelMetric, { title: string; items: string[]; footer: string }> = {
  cpl: {
    title: "Лид уже дорогой — рекламу точно стоит проверить",
    items: [
      "Какие аудитории сейчас приводят заявки",
      "Соответствует ли оффер реальной мотивации клиента",
      "Не выгорела ли посадочная / связка",
      "Тестируются ли разные посадочные и офферы",
      "Какие креативы и объявления формируют ожидание перед заявкой",
      "Как разбиты GEO",
      "На какие действия фактически оптимизируется реклама",
      "Есть ли обратная связь из дальнейшей воронки",
    ],
    footer: "Но прежде чем снижать CPL любой ценой, давай посмотрим, что эти лиды делают дальше.",
  },
  contactRate: {
    title: "Часть рекламного бюджета теряется ещё до разговора",
    items: [
      "Номер другого региона. Совпадает ли номер, с которого звонит компания, с GEO потенциального клиента?",
      "Спам / определитель номера. Не определяется ли номер как спам, банк, коллектор или нежелательный звонок?",
      "Скорость первого звонка. Если первый контакт идёт через 20–30 минут, человек уже может получить несколько звонков от других компаний.",
      "Повторные попытки. Есть ли конкретный регламент: сколько раз звонить, когда повторять попытку и отправлять ли сообщение?",
      "Не путать недозвон с плохим лидом: человек может быть на работе, за рулём или на встрече.",
    ],
    footer: "Прежде чем поставить статус «лид говно», стоит убедиться, что компания действительно сделала всё, чтобы с ним связаться.",
  },
  appointmentRate: {
    title: "Люди отвечают, но плохо переходят в следующий шаг",
    items: [
      "Соответствует ли первое сообщение менеджера тому офферу, который человек видел в рекламе?",
      "Понимает ли менеджер, откуда пришёл человек и что именно ему обещали на посадочной?",
      "Понятна ли цель первого разговора: консультация, квалификация или конкретный следующий шаг?",
      "Понимает ли человек, зачем ему идти на встречу и какую ценность он там получит?",
      "Если человек сказал «позже», есть ли понятный follow-up?",
    ],
    footer: "В такой ситуации снижение CPL может дать меньше денег, чем улучшение первого разговора с уже оплаченным лидом.",
  },
  showRate: {
    title: "Встреча назначена — но клиент до юриста не доходит",
    items: [
      "Сколько времени проходит между первым звонком и встречей",
      "Получает ли человек напоминание и сообщение сразу после назначения",
      "Есть ли короткий прогрев и подтверждение ценности встречи",
      "Что происходит, если клиент просит перенести встречу",
      "Как обрабатывается неявка и есть ли повторный контакт",
    ],
    footer: "Заявка уже несколько раз подорожала. Покупать сверху ещё больше лидов в такой ситуации может просто увеличить объём потерь.",
  },
  closeRate: {
    title: "Здесь узкое место уже находится не в рекламном кабинете",
    items: [
      "Как проходит сама консультация",
      "Какой оффер получает человек на встрече",
      "Какие причины отказов реально фиксируются",
      "Есть ли повторная работа после встречи",
      "Насколько квалифицированные лиды доходят до консультации",
      "Отличается ли конверсия между менеджерами и юристами",
    ],
    footer: "Поэтому на вопрос «сколько стоит договор с ваших лидов?» нельзя нормально ответить, не зная, сколько лидов именно ваша компания превращает в один договор.",
  },
};
